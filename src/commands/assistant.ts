import * as vscode from 'vscode';
import { requestCommitMessageFromOpenRouter } from '../api/openRouter';
import { requestCommitMessageFromStackSpot } from '../api/stackspot';
import { getConfig } from '../config';

export async function generateCommit(diff?: string, description?: string) {
  const { apiKey, apiProvider, commitNorm, quickCommand } = getConfig();

  if (!apiKey) {
    vscode.window.showWarningMessage('API key not set! Please configure your API key.');
    return;
  }

  const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
  if (!gitExtension) {
    return vscode.window.showErrorMessage('Git extension not found.');
  }

  const repository = gitExtension.getAPI(1).repositories[0];

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Generating commit message...',
    cancellable: true
  }, async (progress) => {
    progress.report({ increment: 0, message: 'Verifying Git changes...' });

    // Use diff provided by the caller or get it from the repository
    const gitDiffChanges = diff || await repository.diff(false);
    const stagedChanges = await repository.diff(true);

    if (!gitDiffChanges && !stagedChanges) {
      return vscode.window.showWarningMessage('No changes to commit.');
    }

    progress.report({ increment: 30, message: 'Preparing prompt...' });
    const content = getPromptContent(commitNorm, gitDiffChanges || stagedChanges);

    try {
      let commitMessage = '';
      progress.report({ increment: 50, message: 'Requesting commit message from AI...' });

      if (apiProvider === 'stackspot') {
        if (!quickCommand) {
          throw new Error('Quick command is not set.');
        }
        commitMessage = await requestCommitMessageFromStackSpot(apiKey, content, quickCommand);
      } else {
        const { model, maxTokens, temperature } = getConfig();
        commitMessage = await requestCommitMessageFromOpenRouter(apiKey, content, model, maxTokens, temperature);
      }

      repository.inputBox.value = commitMessage;
      progress.report({ increment: 100, message: 'Commit message generated successfully!' });
      vscode.window.showInformationMessage('Commit message generated successfully!');
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Error generating commit message: ${errorMessage}`);
    }
  });
}

// Function that generates the prompt content based on Git changes
function getPromptContent(commitNorm: string, gitDiffChanges: string): string {
  let prompt = '';
  const customPrompt: string | undefined = vscode.workspace.getConfiguration().get<string>('gitzin.prompt.customPrompt');

  switch (commitNorm) {
    case 'Basic':
      prompt = `Create a commit message with the format: <type>: <title>. Allowed types: feat, fix, docs, style, refactor, etc. \nChanges: ${gitDiffChanges}`;
      break;
    case 'Karma':
      prompt = `Create a commit message with the Karma style: <type>(<scope>): <subject>. Changes: ${gitDiffChanges}`;
      break;
    case 'Dotted':
      prompt = `Create a detailed commit message with bullet points for changes. Use <type>(<scope>): <subject> format. \nChanges: ${gitDiffChanges}`;
      break;
    case 'Emoji':
      prompt = `Create a commit message starting with an emoji to describe the type of change. \nChanges: ${gitDiffChanges}`;
      break;
    default:
      prompt = customPrompt ? `${customPrompt}\nChanges: ${gitDiffChanges}` : '';
  }

  return prompt;
}
