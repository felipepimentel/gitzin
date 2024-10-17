import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL;

export async function generateCommitMessage(
  diff: string
): Promise<string | null> {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY não está definida");
    }

    if (!OPENROUTER_MODEL) {
      throw new Error("OPENROUTER_MODEL não está definido");
    }

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente especializado em gerar mensagens de commit concisas e informativas com base em diferenças de código.",
          },
          {
            role: "user",
            content: `Gere uma mensagem de commit concisa e informativa para as seguintes alterações:\n\n${diff}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const commitMessage = response.data.choices[0].message.content.trim();
    return commitMessage;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao gerar mensagem de commit:", error.message);
    } else {
      console.error("Erro desconhecido ao gerar mensagem de commit");
    }
    return null;
  }
}
