import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { slideCopy } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { RichTextSegment } from "@/lib/rich-text";
import { zaiComplete } from "@/lib/zai";

type SlideInput = { slideKey: string; label: string; headline: string; subtitle: string };
type LocaleTarget = { code: string; label: string };
type LocaleTranslation = { locale: string; label: string; headline: string; subtitle: string };
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
        t.headline.trim().length > 0 &&
        typeof t.subtitle === "string" &&
        t.subtitle.trim().length > 0
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
                  subtitle: nonEmptyString,
                },
                required: ["locale", "label", "headline", "subtitle"],
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
    .map((s) => `Slide "${s.slideKey}":\n  label: ${s.label}\n  headline: ${s.headline}\n  subtitle: ${s.subtitle}`)
    .join("\n\n");

  return `You are a mobile app marketing copywriter. Translate the following app screenshot slide copy from ${params.sourceLabel} into each of these languages: ${params.localeList}.

FORMAT RULES:
- label: Short ALL-CAPS category label. Keep concise and natural in the target language.
- headline: Max 40 chars. May use **bold** around the key accent word/phrase. Use \\n only if needed.
- subtitle: Max 60 chars. One short, benefit-driven sentence.
- Never return empty strings for label, headline, or subtitle. If the source field is empty, write a fresh concise target-language line from the slide label and surrounding slide context.
- Preserve **bold** markup and \\n line break tokens — translate only the surrounding text.
- Sound natural and native, not word-for-word translated.

SOURCE SLIDES (${params.sourceLabel}):
${slidesText}

Return a JSON object with key "results" — an array, one entry per source slide. Each entry has "slideKey" and "translations" (an array of objects with "locale", "label", "headline", "subtitle"). Include one translation object per target locale: ${params.targetCodes.join(", ")}.
Output only valid JSON. No explanations, no markdown, no extra content.`;
}

export async function POST(req: NextRequest) {
  const { productId, sourceLocale, sourceLabel, targetLocales, slides } = await req.json() as {
    productId: string;
    sourceLocale: string;
    sourceLabel: string;
    targetLocales: LocaleTarget[];
    slides: SlideInput[];
  };

  if (!productId || !sourceLocale || !targetLocales?.length || !slides?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

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
        maxTokens: Math.max(2048, targetCodes.length * 220),
      });
    } catch (e) {
      console.error("[translate-copy] Z.AI error:", e);
      return NextResponse.json({ error: String(e) }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = extractJsonObject(raw);
    } catch (e) {
      console.error("[translate-copy] Failed to parse JSON:", e, raw);
      return NextResponse.json({ error: "Invalid JSON from model", raw }, { status: 502 });
    }

    const chunkResults =
      parsed &&
      typeof parsed === "object" &&
      "results" in parsed &&
      Array.isArray((parsed as { results?: unknown }).results)
        ? (parsed as { results: unknown[] }).results.filter(isTranslationResult)
        : [];

    if (!chunkResults.length) {
      return NextResponse.json({ error: "Model returned no results", raw }, { status: 502 });
    }

    results.push(...chunkResults);
  }

  for (const result of results) {
    for (const t of result.translations ?? []) {
      if (!targetCodes.includes(t.locale)) continue;

      const labelText = t.label.trim();
      const headlineText = t.headline.trim();
      const subtitleText = t.subtitle.trim();
      if (!labelText || !headlineText || !subtitleText) {
        console.warn("[translate-copy] Skipping empty translation:", result.slideKey, t.locale, t);
        continue;
      }

      const label    = labelText;
      const headline = markupToSegments(headlineText);
      const subtitle = markupToSegments(subtitleText);

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
          .set({ label, headline, subtitle })
          .where(and(
            eq(slideCopy.productId, productId),
            eq(slideCopy.slideKey, result.slideKey),
            eq(slideCopy.locale, t.locale),
          ));
      } else {
        await db.insert(slideCopy).values({ productId, slideKey: result.slideKey, locale: t.locale, label, headline, subtitle });
      }
    }
  }

  return NextResponse.json({ ok: true, translated: results.length });
}
