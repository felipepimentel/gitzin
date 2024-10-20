import * as vscode from "vscode";
import { generateCommit } from "../commands/assistant";

export class GitzinExplorerProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;

  constructor(private readonly _extensionContext: vscode.ExtensionContext) {
    this._extensionUri = _extensionContext.extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === "generate") {
        const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
        const git = gitExtension?.getAPI(1);
        const repo = git?.repositories[0];

        if (repo) {
          const diff = await repo.diff(true);
          const commitMessage = await generateCommit(diff, data.description as string);
          repo.inputBox.value = commitMessage;
          this._view?.webview.postMessage({ type: "showMessage", message: commitMessage });
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Commit Message</title>
    </head>
    <body>
      <textarea id="commitMessage" placeholder="Enter a description"></textarea>
      <button id="generateBtn">Generate Message</button>
      <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('generateBtn').addEventListener('click', () => {
          vscode.postMessage({ type: 'generate', description: document.getElementById('commitMessage').value });
        });
      </script>
    </body>
    </html>
    `;
  }
}
