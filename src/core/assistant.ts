// Import 'isomorphic-fetch' to provide fetch support in Node.js
import 'isomorphic-fetch';
import * as vscode from 'vscode';

// Interface for the expected API response
interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Configure environment variables through VS Code settings
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = vscode.workspace.getConfiguration('myExtension').get('openRouterApiKey');
const OPENROUTER_MODEL = vscode.workspace.getConfiguration('myExtension').get('openRouterModel');

export async function generateCommitMessage(diff: string, description?: string): Promise<string> {
  console.log('Generating commit message');
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set in VS Code settings");
    }

    if (!OPENROUTER_MODEL) {
      throw new Error("OPENROUTER_MODEL is not set in VS Code settings");
    }

    // Using fetch to make the HTTP request
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an assistant specialized in generating concise and informative commit messages based on code differences.",
          },
          {
            role: "user",
            content: `Generate a concise and informative commit message for the following changes:\n\n${diff}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Request error: ${response.statusText}`);
    }

    // Cast the response to the correct type
    const data: OpenRouterResponse = await response.json() as OpenRouterResponse;

    // Extract the commit message from the response
    const commitMessage = data.choices[0].message.content.trim();
    return commitMessage;
  } catch (error) {
    console.error("Error generating commit message:", error);
    return "<an error occurred>";
  }
}
