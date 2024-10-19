import * as vscode from 'vscode';

export async function commit(context: vscode.ExtensionContext) {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension?.getAPI(1);

    let message = await context.globalState.get('commitMessage');
    //get current repo (if many, gets latest one)
    const repo = git?.repositories[0];
    const commitMessage = message || message || ' - AutoCommit';
    await repo?.commit(commitMessage);
    vscode.window.showInformationMessage('Committed changes using commit message "' + commitMessage + '"');
    return true;
}

export async function push() {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    const git = gitExtension?.getAPI(1);

    //get current repo (if many, gets latest one)
    const repo = git?.repositories[0];
    await repo?.push();
    vscode.window.showInformationMessage('Pushed changes');
    return true;
}

export async function setCommmitMessage(conext: vscode.ExtensionContext) {
    const userInput = await vscode.window.showInputBox({ prompt: 'Enter a commit message' });
    if (userInput === null || userInput === " ") {
        vscode.window.showErrorMessage('No commit message entered, aborting');
        return false;
    }
    await conext.globalState.update('commitMessage', userInput);
}