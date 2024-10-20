import fetch from 'node-fetch'; // Ensure node-fetch is installed
import * as vscode from 'vscode';

// Define the OpenRouterCompletionResponse interface
export interface OpenRouterCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Function to request a commit message from OpenRouter API
export async function requestCommitMessageFromOpenRouter(
  apiKey: string, 
  content: string, 
  model: string, 
  maxTokens: number, 
  temperature: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const apiUrl = vscode.workspace.getConfiguration().get<string>('gitzin.openRouter.apiUrl') || 'https://openrouter.ai/api/v1/chat/completions';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content }],
        max_tokens: maxTokens,
        temperature,
        provider: { allow_fallbacks: true }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
    }

    const data: OpenRouterCompletionResponse = await response.json() as OpenRouterCompletionResponse;
    const commitMessage = data.choices?.[0]?.message?.content;

    if (typeof commitMessage !== 'string') {
      throw new Error('Invalid commit message format received from OpenRouter');
    }

    return commitMessage;
  } catch (error) {
    handleApiError(error);
  }
}

function handleApiError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message.includes('ENOTFOUND')) {
      throw new Error('Network error: Unable to reach OpenRouter API. Please check your DNS settings or internet connection.');
    } else if (error.message.includes('ECONNREFUSED')) {
      throw new Error('Network error: Connection refused. Please verify the API URL or your network settings.');
    } else {
      throw new Error(`Error generating commit message: ${error.message}`);
    }
  } else {
    throw new Error('An unknown error occurred while generating the commit message.');
  }
}

// Helper function to validate the configuration and retrieve the necessary settings
export function getOpenRouterConfig(): { apiKey: string, model: string, maxTokens: number, temperature: number } {
  const config = vscode.workspace.getConfiguration();
  const apiKey = process.env.GITZIN_API_KEY || config.get<string>('gitzin.apiKey');

  if (!apiKey) {
    throw new Error('API key is not set. Please configure your OpenRouter API key in the settings or use the GITZIN_API_KEY environment variable.');
  }

  const model = config.get<string>('gitzin.openRouter.model') || 'gpt-4o-mini';
  const maxTokens = config.get<number>('gitzin.openRouter.maxTokens') || 500;
  const temperature = config.get<number>('gitzin.openRouter.temperature') || 0.7;

  return { apiKey, model, maxTokens, temperature };
}
