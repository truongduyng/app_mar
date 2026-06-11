import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { slideCopy } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { RichTextSegment } from "@/lib/rich-text";
import { togetherComplete } from "@/lib/together";

type SlideInput = { slideKey: string; label: string; headline: string; subtitle: string };
type LocaleTarget = { code: string; label: string };
type LocaleTranslation = { locale: string; label: string; headline: string; subtitle: string };
type TranslationResult = { slideKey: string; translations: LocaleTranslation[] };

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
                  locale:   { type: "string" },
                  label:    { type: "string" },
                  headline: { type: "string" },
                  subtitle: { type: "string" },
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

  const slidesText = slides
    .map((s) => `Slide "${s.slideKey}":\n  label: ${s.label}\n  headline: ${s.headline}\n  subtitle: ${s.subtitle}`)
    .join("\n\n");

  const prompt = `You are a mobile app marketing copywriter. Translate the following app screenshot slide copy from ${sourceLabel} into each of these languages: ${localeList}.

FORMAT RULES:
- label: Short ALL-CAPS category label. Keep concise and natural in the target language.
- headline: Max 40 chars. May use **bold** around the key accent word/phrase. Use \\n only if needed.
- subtitle: Max 60 chars. One short, benefit-driven sentence.
- Preserve **bold** markup and \\n line break tokens — translate only the surrounding text.
- Sound natural and native, not word-for-word translated.

SOURCE SLIDES (${sourceLabel}):
${slidesText}

Return a JSON object with key "results" — an array, one entry per source slide. Each entry has "slideKey" and "translations" (an array of objects with "locale", "label", "headline", "subtitle"). Include one translation object per target locale: ${targetCodes.join(", ")}.`;

  let raw: string;
  try {
    raw = await togetherComplete({ prompt, jsonSchema: SCHEMA });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }

  let parsed: { results: TranslationResult[] };
  try {
    parsed = JSON.parse(raw) as { results: TranslationResult[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON from model", raw }, { status: 502 });
  }

  const results = parsed.results;
  if (!Array.isArray(results) || !results.length) {
    return NextResponse.json({ error: "Model returned no results", raw }, { status: 502 });
  }

  for (const result of results) {
    for (const t of result.translations ?? []) {
      if (!targetCodes.includes(t.locale)) continue;

      const label    = t.label ?? "";
      const headline = markupToSegments(t.headline ?? "");
      const subtitle = markupToSegments(t.subtitle ?? "");

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
