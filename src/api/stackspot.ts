const fetch = require('node-fetch');

export async function requestCommitMessageFromStackSpot(apiKey: string, content: string, quickCommand: string): Promise<string> {
  const response = await fetch(`https://genai-code-buddy-api.stackspot.com/v1/quick-commands/create-execution/${quickCommand}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      input_data: content
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch completion: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}
