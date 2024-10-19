import * as vscode from "vscode";
import { GitzinExplorerProvider } from "./view";
import { setCommmitMessage } from "./core/git";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "gitzin" has been activated!');

  // const panel = vscode.window.createWebviewPanel(
  //   "gitzin",
  //   "Gitzin",
  //   vscode.ViewColumn.One,
  //   { enableScripts: true }
  // );

  const provider = new GitzinExplorerProvider(context);

  console.log("Registering Webview Provider");

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("gitzin.webview", provider),
    vscode.commands.registerCommand("gitzin.start", () =>
      console.log("start")
    ),
    vscode.commands.registerCommand("gitzin.generateCommitMessage", () =>
      console.log("generateCommitMessage")
    ),
    vscode.commands.registerCommand('gitzin.setCommmitMessage', () => {
      console.log('setCommmitMessage');
      setCommmitMessage(context);
      
    })
  );
}

// Deactivation function (optional)
export function deactivate() {
  console.log('Extension "gitzin" has been deactivated!');
}
