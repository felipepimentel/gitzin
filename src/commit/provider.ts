import * as vscode from 'vscode';
import { generateCommitMessage } from '../core/assistant';

export class CommitMessageProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'commitMessageView';
  
    private _view?: vscode.WebviewView;
  
    constructor(private readonly _extensionUri: vscode.Uri) {
      console.log('CommitMessageProvider()');
    }
  
    // Function called when the view is resolved (when the tab is opened)
    public resolveWebviewView(
      webviewView: vscode.WebviewView,
      context: vscode.WebviewViewResolveContext,
      _token: vscode.CancellationToken
    ) {
      console.log('> resolveWebviewView was called');  // Log to check if the method is called
      this._view = webviewView;
    
      // Webview configuration
      webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'assets')],
      };
    
      webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    
      console.log('Webview was configured');  // Log to check if the view is being configured
    
      // Handling messages sent by the Webview
      webviewView.webview.onDidReceiveMessage(async (data) => {
        console.log('Message received from Webview:', data);
        if (data.type === 'generate') {
          console.log('Generating commit message');
          const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
          const git = gitExtension?.getAPI(1);
          const repo = git?.repositories[0];
    
          if (repo) {
            console.log('Repository found:', repo);
            const diff = await repo.diff(true);
            console.log('Diff obtained:', diff);
            const commitMessage = await generateCommitMessage(diff, data.description as string);
            console.log('Commit message generated:', commitMessage);
            if (commitMessage) {
              repo.inputBox.value = commitMessage;
              this._view?.webview.postMessage({
                type: 'showMessage',
                message: commitMessage,
              });
            }
          } else {
            console.log('No repository found');
          }
        } else if (data.type === 'commit') {
          console.log('Performing commit');
          const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
          const git = gitExtension?.getAPI(1);
          const repo = git?.repositories[0];
    
          if (repo) {
            console.log('Repository found for commit:', repo);
            await repo.commit(data.message as string);
            console.log('Commit performed with message:', data.message);
            this._view?.webview.postMessage({ type: 'commitSuccess' });
          } else {
            console.log('No repository found for commit');
          }
        }
      });
    }
    
    // Function that generates and displays the commit message
    public async generateAndShowCommitMessage() {
      console.log('generateAndShowCommitMessage called', this._view);
      if (this._view) {
        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        const git = gitExtension?.getAPI(1);
        const repo = git?.repositories[0];
  
        if (repo) {
          console.log('Repository found:', repo);
          const diff = await repo.diff(true);
          console.log('Diff obtained:', diff);
          const commitMessage = await generateCommitMessage(diff);
          console.log('Commit message generated:', commitMessage);
  
          if (commitMessage) {
            repo.inputBox.value = commitMessage;
            this._view.webview.postMessage({
              type: 'showMessage',
              message: commitMessage,
            });
          }
        } else {
          console.log('No repository found');
        }
      } else {
        console.log('Webview is not available');
      }
    }
  
    // Function that defines the HTML of the Webview
    private _getHtmlForWebview(webview: vscode.Webview): string {
      console.log('Generating Webview HTML');
      const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'icon.svg'));
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Commit Message</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 10px; }
            textarea { width: 100%; height: 50px; margin-bottom: 10px; padding: 5px; font-size: 14px; border: 1px solid #ccc; border-radius: 4px; }
            button { background-color: #007acc; color: white; border: none; padding: 8px 12px; cursor: pointer; margin-right: 5px; border-radius: 4px; }
            button:hover { background-color: #005f99; }
            img { display: block; margin-bottom: 10px; }
            .commit-container { display: flex; flex-direction: column; gap: 8px; }
          </style>
        </head>
        <body>
          <h3>Generate Commit Message</h3>
          <div class="commit-container">
            <textarea id="commitMessage" placeholder="Enter a description of the changes (optional)"></textarea>
            <button id="generateBtn">Generate Message</button>
            <button id="commitBtn">Perform Commit</button>
            <img src="${iconUri}" alt="Commit Icon" width="32" height="32">
          </div>
          <script>
            const vscode = acquireVsCodeApi();
            const messageEl = document.getElementById('commitMessage');
            const generateBtn = document.getElementById('generateBtn');
            const commitBtn = document.getElementById('commitBtn');
  
            generateBtn.addEventListener('click', () => {
              console.log('Generate Message button clicked');
              vscode.postMessage({ type: 'generate', description: messageEl.value });
            });
  
            commitBtn.addEventListener('click', () => {
              console.log('Perform Commit button clicked');
              vscode.postMessage({ type: 'commit', message: messageEl.value });
            });
  
            window.addEventListener('message', event => {
              const message = event.data;
              console.log('Message received from VS Code:', message);
              switch (message.type) {
                case 'showMessage':
                  messageEl.value = message.message;
                  break;
                case 'commitSuccess':
                  messageEl.value = 'Commit performed successfully!';
                  break;
              }
            });
          </script>
        </body>
        </html>
      `;
    }
  }
