import OpenAI from "openai";

/** Default text model used by non-visual generation flows. */
export const ZAI_MODEL = "glm-4.7-flashx";

/** Vision model for tasks that must inspect an image, such as slide copy generation. */
export const ZAI_VISION_MODEL = "glm-4.6v-flash";

const zai = new OpenAI({
  apiKey: process.env.ZAI_API_KEY,
  baseURL: "https://api.z.ai/api/paas/v4",
  timeout: 120_000,
});

type JsonSchema = { name: string; schema: Record<string, unknown>; strict?: boolean };

function stripCodeFence(content: string): string {
  const match = content.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return match ? match[1] : content;
}

interface CompleteOptions {
  prompt: string;
  imageBase64?: string;
  /** Override the default model for a modality-specific generation task. */
  model?: string;
  /** Z.AI does not support json_schema response_format; the schema shape must be described in the prompt instead. */
  jsonSchema?: JsonSchema;
  maxTokens?: number;
}

export async function zaiComplete(opts: CompleteOptions): Promise<string> {
  const { prompt, imageBase64, jsonSchema, maxTokens, model = ZAI_MODEL } = opts;

  const fullPrompt = jsonSchema
    ? `${prompt}\n\nRespond with JSON matching this schema:\n${JSON.stringify(jsonSchema.schema)}`
    : prompt;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = imageBase64
    ? [{ role: "user", content: [{ type: "text", text: fullPrompt }, { type: "image_url", image_url: { url: imageBase64 } }] }]
    : [{ role: "user", content: fullPrompt }];

  const response = await zai.chat.completions.create({
    model,
    messages,
    response_format: { type: "json_object" },
    ...(maxTokens ? { max_tokens: maxTokens } : {}),
    thinking: { type: "disabled" },
  } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);

  const choice = response.choices[0];
  const content = stripCodeFence(choice?.message.content ?? "{}");

  console.log("[zai] response", {
    model,
    jsonSchemaName: jsonSchema?.name,
    finishReason: choice?.finish_reason,
    usage: response.usage,
    contentLength: content.length,
    contentPreview: content.slice(0, 200),
  });

  if (choice?.finish_reason === "length") {
    throw new Error(
      `Z.AI response truncated by max_tokens before completing (jsonSchema: ${jsonSchema?.name ?? "none"}). Increase maxTokens.`,
    );
  }

  try {
    JSON.parse(content);
    return content;
  } catch {
    // glm-4.7-flashx occasionally emits malformed JSON (e.g. unquoted string values); one retry
    // with an explicit correction is cheaper than failing the whole request.
    console.warn("[zai] malformed JSON, retrying once", { contentPreview: content.slice(0, 200) });
    const retryResponse = await zai.chat.completions.create({
      model,
      messages: [
        ...messages,
        { role: "assistant", content },
        { role: "user", content: "That was not valid JSON. Reply again with only strictly valid JSON — every string value must be double-quoted." },
      ],
      response_format: { type: "json_object" },
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
      thinking: { type: "disabled" },
    } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);
    return stripCodeFence(retryResponse.choices[0]?.message.content ?? "{}");
  }
}
