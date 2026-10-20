import "dotenv/config";
import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: 120000,
});

async function main() {
  try {
    const response = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: 'Return exactly this JSON: {"status":"ok"}',
        },
      ],
      response_format: { type: "json_object" },
    });

    console.log("OpenRouter test succeeded:");
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenRouter test failed:", error.status, error.message);
  }
}

main();