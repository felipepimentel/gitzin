import * as vscode from "vscode";
import { generateCommit } from "../commands/assistant";
import { getGitRepository } from "../utils/gitHelpers";

export class GitzinExplorerProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionContext: vscode.ExtensionContext) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    this.setupWebview(webviewView);
  }

  private setupWebview(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionContext.extensionUri]
    };

    webviewView.webview.html = this.getWebviewContent();
    webviewView.webview.onDidReceiveMessage(this.handleWebviewMessage.bind(this));
  }

  private async handleWebviewMessage(data: any) {
    if (data.type === "generate") {
      const repo = getGitRepository();
      if (repo) {
        const diff = await repo.diff(true);
        const commitMessage = await generateCommit(diff, data.description as string) || '';
        repo.inputBox.value = commitMessage;
        this._view?.webview.postMessage({ type: "showMessage", message: commitMessage });
      }
    }
  }

  private getWebviewContent(): string {
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
