import * as vscode from 'vscode';
import { generateCommit } from './commands/assistant';
import { GitzinExplorerProvider } from './views/view';

export function activate(context: vscode.ExtensionContext) {
  // Register the command to generate commit message
  const generateCommitCommand = vscode.commands.registerCommand('gitzin.generateCommit', generateCommit);

  // Register the Webview provider for the Gitzin commit view
  const provider = new GitzinExplorerProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("gitzin-commit-view", provider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );

  // Global command to reuse the last commit message
  context.subscriptions.push(vscode.commands.registerCommand('gitzin.useLastCommitMessage', async () => {
    const message = await vscode.workspace.getConfiguration().get<string>('gitzin.lastCommitMessage');
    if (message) {
      const repo = getGitRepository();
      repo.inputBox.value = message;
      vscode.window.showInformationMessage('Using last commit message.');
    } else {
      vscode.window.showWarningMessage('No last commit message found.');
    }
  }));

  // Ensure all commands are correctly pushed to the context
  context.subscriptions.push(generateCommitCommand);
}

export function deactivate() { }

// Helper function to retrieve the active Git repository
function getGitRepository() {
  const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
  const git = gitExtension.getAPI(1);
  return git.repositories[0];
}
