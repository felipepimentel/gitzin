import * as vscode from 'vscode';
import { generateCommit } from './commands/assistant';
import { getGitRepository } from './utils/gitHelpers';
import { GitzinExplorerProvider } from './views/view';

export function activate(context: vscode.ExtensionContext) {
  // Register the command to generate commit message
  const generateCommitCommand = vscode.commands.registerCommand('gitzin.generateCommit', generateCommit);

  // Register the Webview provider for the Gitzin commit view
  const provider = new GitzinExplorerProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("gitzin-commit-view", provider, {
      webviewOptions: { retainContextWhenHidden: true }
    }),
    generateCommitCommand,
    vscode.commands.registerCommand('gitzin.useLastCommitMessage', useLastCommitMessage)
  );
}

async function useLastCommitMessage() {
  const message = vscode.workspace.getConfiguration().get<string>('gitzin.lastCommitMessage');
  if (message) {
    const repo = getGitRepository();
    if (repo) {
      repo.inputBox.value = message;
      vscode.window.showInformationMessage('Using last commit message.');
    }
  } else {
    vscode.window.showWarningMessage('No last commit message found.');
  }
}

export function deactivate() { }
