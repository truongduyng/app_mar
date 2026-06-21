import Together from "together-ai";

export const TOGETHER_MODEL = "moonshotai/Kimi-K2.6";

const together = new Together({ timeout: 120_000 });

type JsonSchema = { name: string; schema: Record<string, unknown>; strict?: boolean };

interface CompleteOptions {
  prompt: string;
  imageBase64?: string;
  jsonSchema?: JsonSchema;
  maxTokens?: number;
}

export async function togetherComplete(opts: CompleteOptions): Promise<string> {
  const { prompt, imageBase64, jsonSchema, maxTokens } = opts;

  const messages: Parameters<typeof together.chat.completions.create>[0]["messages"] = imageBase64
    ? [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: imageBase64 } }] }]
    : [{ role: "user", content: prompt }];

  const response = await together.chat.completions.create({
    model: TOGETHER_MODEL,
    messages,
    response_format: jsonSchema
      ? { type: "json_schema", json_schema: jsonSchema }
      : { type: "json_object" },
    ...(maxTokens ? { max_tokens: maxTokens } : {}),
  });

  const choice = (
    response as {
      choices: Array<{
        message: { content: string };
        finish_reason?: string;
      }>;
      usage?: { completion_tokens?: number; prompt_tokens?: number };
    }
  ).choices[0];
  const content = choice?.message.content ?? "{}";

  console.log("[together] response", {
    model: TOGETHER_MODEL,
    jsonSchemaName: jsonSchema?.name,
    finishReason: choice?.finish_reason,
    usage: (response as { usage?: unknown }).usage,
    contentLength: content.length,
    contentPreview: content.slice(0, 200),
  });

  return content;
}
