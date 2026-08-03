import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { slideCopy } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { segmentsToMarkup } from "@/lib/rich-text";
import type { RichTextSegment } from "@/lib/rich-text";
import { zaiComplete } from "@/lib/zai";

type SlideInput = { slideKey: string; label: string; headline: string };
type LocaleTarget = { code: string; label: string };
type LocaleTranslation = { locale: string; label: string; headline: string };
type TranslationResult = { slideKey: string; translations: LocaleTranslation[] };

const nonEmptyString = { type: "string", minLength: 1 };

function markupToSegments(markup: string): RichTextSegment[] {
  const segments: RichTextSegment[] = [];
  const normalised = markup.replace(/\n/g, "\\n");
  const parts = normalised.split(/(\*\*[^*]*\*\*|\\n)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part === "\\n") {
      segments.push({ t: "br" });
    } else if (part.startsWith("**") && part.endsWith("**")) {
      segments.push({ t: "accent", v: part.slice(2, -2) });
    } else {
      segments.push({ t: "text", v: part });
    }
  }
  return segments.length ? segments : [{ t: "text", v: "" }];
}

function extractJsonObject(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced) {
      return JSON.parse(fenced[1]);
    }

    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("No JSON object found");
    }

    return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
  }
}

/**
 * glm-4.7-flashx sometimes echoes the JSON schema shape instead of filling it in, e.g.
 * `{"type":"object","properties":{"results":[...]}}` instead of `{"results":[...]}`.
 * Unwrap that case so the real payload underneath is still usable.
 */
function unwrapSchemaEcho(value: unknown): unknown {
  if (
    value &&
    typeof value === "object" &&
    !("results" in value) &&
    "properties" in value &&
    typeof (value as { properties?: unknown }).properties === "object"
  ) {
    return (value as { properties: unknown }).properties;
  }
  return value;
}

function isTranslationResult(value: unknown): value is TranslationResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<TranslationResult>;
  return (
    typeof result.slideKey === "string" &&
    Array.isArray(result.translations) &&
    result.translations.every((translation) => {
      if (!translation || typeof translation !== "object") return false;
      const t = translation as Partial<LocaleTranslation>;
      return (
        typeof t.locale === "string" &&
        typeof t.label === "string" &&
        t.label.trim().length > 0 &&
        typeof t.headline === "string" &&
        t.headline.trim().length > 0
      );
    })
  );
}

const SCHEMA = {
  name: "slide_translations",
  strict: true,
  schema: {
    type: "object",
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            slideKey: { type: "string" },
            translations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  locale:   nonEmptyString,
                  label:    nonEmptyString,
                  headline: nonEmptyString,
                },
                required: ["locale", "label", "headline"],
                additionalProperties: false,
              },
            },
          },
          required: ["slideKey", "translations"],
          additionalProperties: false,
        },
      },
    },
    required: ["results"],
    additionalProperties: false,
  },
};

function buildPrompt(params: {
  sourceLabel: string;
  localeList: string;
  targetCodes: string[];
  slides: SlideInput[];
}) {
  const slidesText = params.slides
    .map((s) => `Slide "${s.slideKey}":\n  label: ${s.label}\n  headline: ${s.headline}`)
    .join("\n\n");

  return `You are a mobile app marketing copywriter. Translate the following app screenshot slide copy from ${params.sourceLabel} into each of these languages: ${params.localeList}.

FORMAT RULES:
- label: Short ALL-CAPS category label. Keep concise and natural in the target language.
- headline: Max 40 chars. May use **bold** around the key accent word/phrase. Use \\n only if needed.
- Never return empty strings for label or headline. If the source field is empty, write a fresh concise target-language line from the slide label and surrounding slide context.
- Preserve **bold** markup and \\n line break tokens — translate only the surrounding text.
- Sound natural and native, not word-for-word translated.

SOURCE SLIDES (${params.sourceLabel}):
${slidesText}

Output ONLY a JSON object shaped EXACTLY like this example (filled in with real translations, not this example's values):
{"results":[{"slideKey":"example-key","translations":[{"locale":"${params.targetCodes[0]}","label":"EXAMPLE LABEL","headline":"Example headline"}]}]}

Rules for the output:
- Top-level object has exactly one key: "results". Do NOT wrap it in "type", "properties", or any JSON-Schema-like structure — output the DATA itself, not a schema describing it.
- "results" is an array with one entry per source slide, in the same order, using the same "slideKey".
- Each entry's "translations" array has exactly one object per target locale: ${params.targetCodes.join(", ")}.
- No explanations, no markdown code fences, no extra keys.`;
}

export async function POST(req: NextRequest) {
  const { productId, sourceLocale, sourceLabel, targetLocales } = await req.json() as {
    productId: string;
    sourceLocale: string;
    sourceLabel: string;
    targetLocales: LocaleTarget[];
  };

  if (!productId || !sourceLocale || !targetLocales?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sourceRows = await db
    .select({ slideKey: slideCopy.slideKey, label: slideCopy.label, headline: slideCopy.headline })
    .from(slideCopy)
    .where(and(
      eq(slideCopy.productId, productId),
      eq(slideCopy.locale, sourceLocale),
    ));

  if (!sourceRows.length) {
    return NextResponse.json({ error: "No source copy found for this locale" }, { status: 400 });
  }

  const slides: SlideInput[] = sourceRows.map((row) => ({
    slideKey: row.slideKey,
    label: row.label,
    headline: segmentsToMarkup(row.headline as RichTextSegment[]),
  }));

  const localeList = targetLocales.map((l) => `"${l.code}" (${l.label})`).join(", ");
  const targetCodes = targetLocales.map((l) => l.code);

  const results: TranslationResult[] = [];

  for (const slide of slides) {
    const prompt = buildPrompt({
      sourceLabel,
      localeList,
      targetCodes,
      slides: [slide],
    });

    let raw: string;
    try {
      raw = await zaiComplete({
        prompt,
        jsonSchema: SCHEMA,
        maxTokens: 10000,
      });
    } catch (e) {
      console.error("[translate-copy] Z.AI error:", e);
      return NextResponse.json({ error: String(e) }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = unwrapSchemaEcho(extractJsonObject(raw));
    } catch (e) {
      console.error("[translate-copy] Failed to parse JSON:", e, "raw:", raw);
      return NextResponse.json({ error: "Invalid JSON from model", raw }, { status: 502 });
    }

    const rawResults =
      parsed &&
      typeof parsed === "object" &&
      "results" in parsed &&
      Array.isArray((parsed as { results?: unknown }).results)
        ? (parsed as { results: unknown[] }).results
        : null;

    if (!rawResults) {
      console.error("[translate-copy] Response missing 'results' array. Parsed:", JSON.stringify(parsed));
      return NextResponse.json({ error: "Model returned no results", raw }, { status: 502 });
    }

    const chunkResults = rawResults.filter(isTranslationResult);

    if (!chunkResults.length) {
      console.error(
        "[translate-copy] All entries in 'results' failed shape validation. Entries:",
        JSON.stringify(rawResults),
      );
      return NextResponse.json({ error: "Model returned no valid results", raw }, { status: 502 });
    } else if (chunkResults.length < rawResults.length) {
      console.warn(
        "[translate-copy] Some entries failed shape validation:",
        JSON.stringify(rawResults.filter((r) => !isTranslationResult(r))),
      );
    }

    results.push(...chunkResults);
  }

  for (const result of results) {
    for (const t of result.translations ?? []) {
      if (!targetCodes.includes(t.locale)) continue;

      const labelText = t.label.trim();
      const headlineText = t.headline.trim();
      if (!labelText || !headlineText) {
        console.warn("[translate-copy] Skipping empty translation:", result.slideKey, t.locale, t);
        continue;
      }

      const label    = labelText;
      const headline = markupToSegments(headlineText);

      const existing = await db
        .select({ id: slideCopy.id })
        .from(slideCopy)
        .where(and(
          eq(slideCopy.productId, productId),
          eq(slideCopy.slideKey, result.slideKey),
          eq(slideCopy.locale, t.locale),
        ));

      if (existing.length) {
        await db
          .update(slideCopy)
          .set({ label, headline })
          .where(and(
            eq(slideCopy.productId, productId),
            eq(slideCopy.slideKey, result.slideKey),
            eq(slideCopy.locale, t.locale),
          ));
      } else {
        await db.insert(slideCopy).values({ productId, slideKey: result.slideKey, locale: t.locale, label, headline });
      }
    }
  }

  return NextResponse.json({ ok: true, translated: results.length });
}
