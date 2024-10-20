import { Uri } from 'vscode';

export interface GitExtension {
  getAPI(version: number): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
}
export interface Repository {
  rootUri: Uri;
  inputBox: {
    value: string;
  };
  diff(cached: boolean): Promise<string>;
}
