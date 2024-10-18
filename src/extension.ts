import * as vscode from 'vscode';
import { CommitMessageProvider } from './commit/provider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "gitzin" has been activated!');

  const provider = new CommitMessageProvider(context.extensionUri);

  console.log('Registering Webview Provider');
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CommitMessageProvider.viewType, provider)
  );

  console.log('Registering command to generate commit message');

  const disposable = vscode.commands.registerCommand('gitzin.generateCommitMessage', async () => {
    console.log('Command gitzin.generateCommitMessage called');
    try {
      await vscode.commands.executeCommand('workbench.view.extension.gitzin-viewContainer');
      await provider.generateAndShowCommitMessage();
    } catch (error) {
      console.error('Error generating commit message:', error);
      vscode.window.showErrorMessage(`Error generating commit message: ${error}`);
    }
  });

  context.subscriptions.push(disposable);
}

// Deactivation function (optional)
export function deactivate() {
  console.log('Extension "gitzin" has been deactivated!');
}