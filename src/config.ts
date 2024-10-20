import * as vscode from 'vscode';

export function getConfig() {
  const config = vscode.workspace.getConfiguration('gitzin');
  return {
    apiKey: process.env.GITZIN_API_KEY || config.get<string>('apiKey'),
    apiProvider: config.get<string>('apiProvider') || 'openrouter',
    commitNorm: config.get<string>('commitNorm') || 'Basic',
    quickCommand: config.get<string>('stackspot.quickCommand'),
    model: config.get<string>('openRouter.model') || 'gpt-4o-mini',
    maxTokens: config.get<number>('openRouter.maxTokens') || 500,
    temperature: config.get<number>('openRouter.temperature') || 0.7,
  };
}
