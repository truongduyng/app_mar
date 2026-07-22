import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { productMetadata, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { MetadataConfig } from "@/lib/types";
import { zaiComplete } from "@/lib/zai";
import { LOCALE_NAMES } from "@/lib/locale-names";
import { ensureTermsOfUse } from "@/lib/terms";

const FIELD_RULES: Record<keyof MetadataConfig, { maxLength: number; instruction: string }> = {
  name: { maxLength: 30, instruction: "Use a concise app name; keep the product name/brand recognizable." },
  subtitle: { maxLength: 30, instruction: "Write a natural, compelling App Store subtitle." },
  promoText: { maxLength: 170, instruction: "Write natural promotional copy suitable for App Store promotional text." },
  shortDescription: { maxLength: 80, instruction: "Write a punchy Google Play short description." },
  description: { maxLength: 4000, instruction: "Preserve the meaning and paragraph structure of the full store description." },
  keywords: { maxLength: 100, instruction: "Return comma-separated search terms with no spaces after commas; never cut a keyword in half." },
  whatsNew: { maxLength: 4000, instruction: "Write natural App Store release notes and preserve the meaning." },
};

export async function POST(req: NextRequest) {
  const { productId, fieldId, sourceLocale, sourceValue, targetLocales } =
    (await req.json()) as {
      productId: string;
      fieldId: keyof MetadataConfig;
      sourceLocale: string;
      sourceValue: string;
      targetLocales: string[];
    };

  if (!productId || !fieldId || !targetLocales?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }
  const fieldRule = FIELD_RULES[fieldId];
  if (!fieldRule) {
    return NextResponse.json({ error: "Unsupported metadata field" }, { status: 400 });
  }
  if (!sourceValue) {
    return NextResponse.json(
      {
        error: `Source value is empty — fill in ${sourceLocale || "the primary locale"} first`,
      },
      { status: 400 },
    );
  }

  const [product] = await db
    .select({ termsOfUseUrl: products.termsOfUseUrl })
    .from(products)
    .where(eq(products.id, productId));

  // Build locale list for the prompt: "cs (Czech), vi (Vietnamese), ..."
  const localeList = targetLocales
    .map((l) => `"${l}" (${LOCALE_NAMES[l] ?? l})`)
    .join(", ");

  const schema = {
    name: "translate_field_response",
    strict: true,
    schema: {
      type: "object",
      properties: {
        translations: {
          type: "object",
          properties: Object.fromEntries(
            targetLocales.map((l) => [l, { type: "string" }]),
          ),
          required: targetLocales,
          additionalProperties: false,
        },
      },
      required: ["translations"],
      additionalProperties: false,
    },
  };

  const prompt = `Translate/adapt the following App Store or Google Play metadata field into each of these languages: ${localeList}.
Field: ${fieldId}
Field rules: ${fieldRule.instruction}
The result for every locale must be no more than ${fieldRule.maxLength} characters, including spaces and punctuation. Do not add explanations or labels.
Return JSON matching this exact shape:
{
  "translations": {
    "locale-code": "faithful translation"
  }
}
Output only valid JSON. No explanations, no markdown, no extra content.

SOURCE TEXT:
${sourceValue}`;

  let raw: string;
  try {
    raw = await zaiComplete({ prompt, jsonSchema: schema });
  } catch (e) {
    console.error("[translate-field] Z.AI error:", e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("[translate-field] Failed to parse JSON:", raw);
    return NextResponse.json(
      { error: "Invalid JSON from model", raw },
      { status: 502 },
    );
  }

  const translationsObject =
    parsed &&
    typeof parsed === "object" &&
    "translations" in parsed &&
    typeof (parsed as { translations?: unknown }).translations === "object" &&
    (parsed as { translations?: unknown }).translations !== null
      ? (parsed as { translations: Record<string, unknown> }).translations
      : null;

  if (!translationsObject) {
    return NextResponse.json(
      { error: "Invalid translations from model", raw },
      { status: 502 },
    );
  }

  const translations = Object.fromEntries(
    targetLocales
      .map((locale) => [
        locale,
        normalizeTranslation(fieldId, translationsObject[locale], fieldRule.maxLength),
      ])
      .filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && entry[1].trim().length > 0,
      ),
  );

  if (fieldId === "description") {
    for (const locale of Object.keys(translations)) {
      translations[locale] = ensureTermsOfUse(
        translations[locale],
        product?.termsOfUseUrl ?? undefined,
      );
    }
  }

  if (!Object.keys(translations).length) {
    return NextResponse.json(
      { error: "Model returned no translations", raw },
      { status: 502 },
    );
  }

  await Promise.all(
    Object.entries(translations).map(([locale, translated]) => {
      return db
        .insert(productMetadata)
        .values({
          productId,
          locale,
          name: "",
          subtitle: "",
          promoText: "",
          shortDescription: "",
          description: "",
          keywords: "",
          whatsNew: "",
          [fieldId]: translated,
        })
        .onConflictDoUpdate({
          target: [productMetadata.productId, productMetadata.locale],
          set: { [fieldId]: translated },
        });
    }),
  );

  return NextResponse.json({ ok: true, translations });
}

function normalizeTranslation(
  fieldId: keyof MetadataConfig,
  value: unknown,
  maxLength: number,
): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  if (text.length <= maxLength) return text;
  if (fieldId === "keywords") {
    return text
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .reduce((result, keyword) => {
        const next = result ? `${result},${keyword}` : keyword;
        return next.length <= maxLength ? next : result;
      }, "");
  }
  return text.slice(0, maxLength).trimEnd();
}
