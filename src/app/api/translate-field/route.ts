import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { productMetadata } from "@/db/schema";
import type { MetadataConfig } from "@/lib/types";
import { togetherComplete } from "@/lib/together";

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

  let raw: string;
  try {
    raw = await togetherComplete({ prompt, jsonSchema: schema });
  } catch (e) {
    console.error("[translate-field] Together AI error:", e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("[translate-field] Failed to parse JSON:", raw);
    return NextResponse.json({ error: "Invalid JSON from model", raw }, { status: 502 });
  }

  const maybeTranslations =
    parsed &&
    typeof parsed === "object" &&
    "translations" in parsed &&
    typeof (parsed as { translations?: unknown }).translations === "object" &&
    (parsed as { translations?: unknown }).translations !== null
      ? (parsed as { translations: Record<string, unknown> }).translations
      : parsed;

  if (!maybeTranslations || typeof maybeTranslations !== "object") {
    return NextResponse.json({ error: "Invalid translations from model", raw }, { status: 502 });
  }

  const translations = Object.fromEntries(
    targetLocales
      .map((locale) => [locale, (maybeTranslations as Record<string, unknown>)[locale]])
      .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0)
  );

  if (!Object.keys(translations).length) {
    return NextResponse.json({ error: "Model returned no translations", raw }, { status: 502 });
  }

  await Promise.all(
    Object.entries(translations).map(([locale, translated]) => {
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
