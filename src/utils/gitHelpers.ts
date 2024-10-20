import * as vscode from 'vscode';
import { GitExtension, Repository } from '../@types/git';

export function getGitRepository(): Repository | undefined {
  const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
  const api = gitExtension?.getAPI(1);

  if (!api) {
    vscode.window.showErrorMessage('Git extension not found or not activated.');
    return undefined;
  }

  if (api.repositories.length === 0) {
    vscode.window.showErrorMessage('No Git repositories found.');
    return undefined;
  }

  // If there's only one repository, return it
  if (api.repositories.length === 1) {
    return api.repositories[0];
  }

  // If there are multiple repositories, try to get the one for the current file
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const currentFilePath = activeEditor.document.uri;
    for (const repo of api.repositories) {
      if (repo.rootUri.fsPath === vscode.workspace.getWorkspaceFolder(currentFilePath)?.uri.fsPath) {
        return repo;
      }
    }
  }

  // If we couldn't determine the repository based on the current file, return the first one
  return api.repositories[0];
}
