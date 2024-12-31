import { createOpenAI, openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Factuality, Levenshtein } from "autoevals";
import { evalite } from "evalite";
import { traceAISDKModel } from "evalite/ai-sdk";

import dotenv from "dotenv";
dotenv.config();

const client = createOpenAI({apiKey: process.env.OPENAI_API_KEY, });

evalite("Test Capitals", {
  data: async () => [
    {
      input: `What's the capital of France?`,
      expected: `Paris`,
    },
    {
      input: `What's the capital of Germany?`,
      expected: `Berlin`,
    },
  ],
  task: async (input) => {
    const result = await streamText({
      model: traceAISDKModel(client("gpt-4o-mini")),
      system: `
        Answer the question concisely. Answer in as few words as possible.
        Remove full stops from the end of the output.
        If the country has no capital, return '<country> has no capital'.
        If the country does not exist, return 'Unknown'.
      `,
      prompt: input,
    });

    return result.textStream;
  },
  scorers: [Factuality, Levenshtein],
});