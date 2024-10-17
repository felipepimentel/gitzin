import * as vscode from "vscode";
import { generateCommitMessage } from "./gitAssistant";

interface WebviewMessage {
  type: string;
  [key: string]: unknown;
}

class CommitMessageProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "commitMessageView";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "assets")],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data: WebviewMessage) => {
      if (data.type === "commit") {
        const gitExtension =
          vscode.extensions.getExtension("vscode.git")?.exports;
        const git = gitExtension?.getAPI(1);
        const repo = git?.repositories[0];

        if (repo) {
          await vscode.commands.executeCommand("git.commit");
          this._view?.webview.postMessage({ type: "commitSuccess" });
        }
      }
    });
  }

  public async generateAndShowCommitMessage() {
    if (this._view) {
      const gitExtension =
        vscode.extensions.getExtension("vscode.git")?.exports;
      const git = gitExtension?.getAPI(1);
      const repo = git?.repositories[0];

      if (repo) {
        const diff = await repo.diff(true);
        const commitMessage = await generateCommitMessage(diff);

        if (commitMessage) {
          repo.inputBox.value = commitMessage;
          this._view.webview.postMessage({
            type: "showMessage",
            message: commitMessage,
          });
        }
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const iconUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "icon.svg")
    );

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Commit Message</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 10px; }
          #message { margin-bottom: 10px; }
          button { background-color: #007acc; color: white; border: none; padding: 8px 12px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div id="message"></div>
        <img src="${iconUri}" alt="Commit Icon" width="32" height="32">
        <button id="commitBtn">Commit</button>
        <script>
          const vscode = acquireVsCodeApi();
          const messageEl = document.getElementById('message');
          const commitBtn = document.getElementById('commitBtn');

          window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
              case 'showMessage':
                messageEl.textContent = message.message;
                break;
              case 'commitSuccess':
                messageEl.textContent = 'Commit realizado com sucesso!';
                break;
            }
          });

          commitBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'commit' });
          });
        </script>
      </body>
      </html>
    `;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Extensão "gitzin" está ativa!');

  const provider = new CommitMessageProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CommitMessageProvider.viewType,
      provider
    )
  );

  let disposable = vscode.commands.registerCommand(
    "gitzin.generateCommitMessage",
    async () => {
      try {
        await provider.generateAndShowCommitMessage();
      } catch (error) {
        vscode.window.showErrorMessage(
          `Erro ao gerar mensagem de commit: ${error}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
