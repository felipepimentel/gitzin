import * as vscode from 'vscode';
import { requestCommitMessageFromOpenRouter } from '../api/openRouter';
import { requestCommitMessageFromStackSpot } from '../api/stackspot';
import { getConfig } from '../config';
import { getGitRepository } from '../utils/gitHelpers';

export async function generateCommit(diff?: string, description?: string) {
  const { apiKey, apiProvider, commitNorm, quickCommand } = getConfig();

  if (!apiKey) {
    vscode.window.showWarningMessage('API key not set! Please configure your API key.');
    return;
  }

  const repository = getGitRepository();
  if (!repository) {
    return vscode.window.showErrorMessage('Git repository not found.');
  }

  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Generating commit message...',
    cancellable: true
  }, async (progress) => {
    try {
      const gitDiffChanges = diff || await repository.diff(false);
      const stagedChanges = await repository.diff(true);

      if (!gitDiffChanges && !stagedChanges) {
        return vscode.window.showWarningMessage('No changes to commit.');
      }

      const content = getPromptContent(commitNorm, gitDiffChanges || stagedChanges);
      const commitMessage = await getCommitMessage(apiProvider, apiKey, content, quickCommand);

      repository.inputBox.value = commitMessage;
      vscode.window.showInformationMessage('Commit message generated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Error generating commit message: ${errorMessage}`);
    }
  });
}

async function getCommitMessage(apiProvider: string, apiKey: string, content: string, quickCommand?: string): Promise<string> {
  if (apiProvider === 'stackspot') {
    if (!quickCommand) {
      throw new Error('Quick command is not set.');
    }
    return await requestCommitMessageFromStackSpot(apiKey, content, quickCommand);
  } else {
    const { model, maxTokens, temperature } = getConfig();
    return await requestCommitMessageFromOpenRouter(apiKey, content, model, maxTokens, temperature);
  }
}

function getPromptContent(commitNorm: string, gitDiffChanges: string): string {
  const customPrompt: string | undefined = vscode.workspace.getConfiguration().get<string>('gitzin.prompt.customPrompt');

  const prompts = {
    'Basic': `Create a commit message with the format: <type>: <title>. Allowed types: feat, fix, docs, style, refactor, etc. \nChanges: ${gitDiffChanges}`,
    'Karma': `Create a commit message with the Karma style: <type>(<scope>): <subject>. Changes: ${gitDiffChanges}`,
    'Dotted': `Create a detailed commit message with bullet points for changes. Use <type>(<scope>): <subject> format. \nChanges: ${gitDiffChanges}`,
    'Emoji': `Create a commit message starting with an emoji to describe the type of change. \nChanges: ${gitDiffChanges}`,
  };

  return prompts[commitNorm as keyof typeof prompts] || (customPrompt ? `${customPrompt}\nChanges: ${gitDiffChanges}` : '');
}
