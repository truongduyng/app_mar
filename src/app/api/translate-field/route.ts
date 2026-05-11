import { NextRequest, NextResponse } from "next/server";
import Together from "together-ai";
import { db } from "@/db/client";
import { productMetadata } from "@/db/schema";
import type { MetadataConfig } from "@/lib/types";

const TOGETHER_MODEL = "zai-org/GLM-5.1";
const together = new Together();

const LOCALE_NAMES: Record<string, string> = {
  ar: "Arabic", cs: "Czech", da: "Danish", de: "German", el: "Greek",
  es: "Spanish (Spain)", fi: "Finnish", fr: "French", he: "Hebrew", hr: "Croatian",
  hu: "Hungarian", id: "Indonesian", it: "Italian", ja: "Japanese",
  ko: "Korean", nl: "Dutch", no: "Norwegian", pl: "Polish",
  "pt-BR": "Portuguese (Brazil)", pt: "Portuguese", ro: "Romanian",
  ru: "Russian", sk: "Slovak", sv: "Swedish", th: "Thai",
  tr: "Turkish", uk: "Ukrainian", vi: "Vietnamese", zh: "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
};

export async function POST(req: NextRequest) {
  const { productId, fieldId, sourceValue, targetLocales } = await req.json() as {
    productId: string;
    fieldId: keyof MetadataConfig;
    sourceLocale: string;
    sourceValue: string;
    targetLocales: string[];
  };

  if (!productId || !fieldId || !targetLocales?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!sourceValue) {
    return NextResponse.json({ error: "Source value is empty — fill in the English version first" }, { status: 400 });
  }

  // Build locale list for the prompt: "cs (Czech), vi (Vietnamese), ..."
  const localeList = targetLocales
    .map((l) => `"${l}" (${LOCALE_NAMES[l] ?? l})`)
    .join(", ");

  const schema = {
    name: "translations",
    strict: false,
    schema: {
      type: "object",
      properties: Object.fromEntries(targetLocales.map((l) => [l, { type: "string" }])),
      required: targetLocales,
      additionalProperties: false,
    },
  };

  const prompt = `Translate the following text into each of these languages: ${localeList}.
Return a JSON object where each key is the locale code and the value is the faithful translation.
Output only the translation — no explanations, no extra content.

SOURCE TEXT:
${sourceValue}`;

  let response;
  try {
    response = await together.chat.completions.create({
      model: TOGETHER_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_schema", json_schema: schema },
      temperature: 0.2,
      max_tokens: 4096,
    }) as { choices: Array<{ message: { content: string } }> };
  } catch (e) {
    console.error("[translate-field] Together AI error:", e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }

  const raw = response.choices[0]?.message.content ?? "{}";
  let translations: Record<string, string>;
  try {
    translations = JSON.parse(raw) as Record<string, string>;
  } catch {
    console.error("[translate-field] Failed to parse JSON:", raw);
    return NextResponse.json({ error: "Invalid JSON from model", raw }, { status: 502 });
  }

  await Promise.all(
    Object.entries(translations).map(([locale, translated]) => {
      if (!translated) return Promise.resolve();
      return db
        .insert(productMetadata)
        .values({ productId, locale, name: "", subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "", whatsNew: "", [fieldId]: translated })
        .onConflictDoUpdate({
          target: [productMetadata.productId, productMetadata.locale],
          set: { [fieldId]: translated },
        });
    })
  );

  return NextResponse.json({ ok: true, translations });
}
