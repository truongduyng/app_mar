import { NextRequest, NextResponse } from "next/server";
import Together from "together-ai";
import { db } from "@/db/client";
import { productLocales, slideCopy, productMetadata } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { RichTextSegment } from "@/lib/rich-text";
import type { MetadataConfig } from "@/lib/types";

const TOGETHER_MODEL = "openai/gpt-oss-120b";
const together = new Together();

// Map locale code → country/market context for ASO optimisation
const LOCALE_CONTEXT: Record<string, { language: string; country: string; marketNotes: string }> = {
  ar:        { language: "Arabic",              country: "Middle East / Arabic-speaking countries", marketNotes: "Right-to-left language. Modern Standard Arabic. Keep copy short and impactful. Keywords comma-separated." },
  cs:        { language: "Czech",               country: "Czech Republic",   marketNotes: "Czech App Store. Professional yet friendly tone. Keywords comma-separated." },
  da:        { language: "Danish",              country: "Denmark",          marketNotes: "Danish App Store. Clean, direct Scandinavian style. Keywords comma-separated." },
  en:        { language: "English",             country: "English-speaking markets", marketNotes: "App Store English. Clear, benefit-driven copy. Keywords comma-separated." },
  de:        { language: "German",              country: "Germany/Austria/Switzerland", marketNotes: "German App Store. Precision and feature depth valued. Keywords comma-separated." },
  el:        { language: "Greek",               country: "Greece",           marketNotes: "Greek App Store. Warm and expressive tone. Keywords comma-separated." },
  es:        { language: "Spanish",             country: "Spain / Latin America", marketNotes: "Spanish App Store. Warm and expressive. Keywords comma-separated." },
  fi:        { language: "Finnish",             country: "Finland",          marketNotes: "Finnish App Store. Understated, honest tone. Keywords comma-separated." },
  fil:       { language: "Filipino",            country: "Philippines",      marketNotes: "Philippine App Store. Friendly, energetic tone. Mix of Filipino and English is natural. Keywords comma-separated." },
  fr:        { language: "French",              country: "France",           marketNotes: "French App Store. Elegant, friendly tone. Keywords comma-separated." },
  he:        { language: "Hebrew",              country: "Israel",           marketNotes: "Right-to-left language. Israeli App Store. Direct and modern tone. Keywords comma-separated." },
  hr:        { language: "Croatian",            country: "Croatia",          marketNotes: "Croatian App Store. Friendly, approachable tone. Keywords comma-separated." },
  hu:        { language: "Hungarian",           country: "Hungary",          marketNotes: "Hungarian App Store. Professional tone. Keywords comma-separated." },
  id:        { language: "Indonesian",          country: "Indonesia",        marketNotes: "Indonesian App Store. Casual but clear tone. Keywords comma-separated." },
  it:        { language: "Italian",             country: "Italy",            marketNotes: "Italian App Store. Expressive and warm. Keywords comma-separated." },
  ja:        { language: "Japanese",            country: "Japan",            marketNotes: "Japanese App Store. Polite, concise Japanese. Keywords comma-separated Japanese words/phrases. Lead with core value then features." },
  ko:        { language: "Korean",              country: "South Korea",      marketNotes: "Korean App Store. 합쇼체 formality. Emphasise social proof and trust signals. Keywords comma-separated." },
  ms:        { language: "Malay",               country: "Malaysia",         marketNotes: "Malaysian App Store. Friendly and clear tone. Keywords comma-separated." },
  nl:        { language: "Dutch",               country: "Netherlands",      marketNotes: "Dutch App Store. Direct and pragmatic tone. Keywords comma-separated." },
  no:        { language: "Norwegian",           country: "Norway",           marketNotes: "Norwegian App Store. Clean, direct Scandinavian style. Keywords comma-separated." },
  pl:        { language: "Polish",              country: "Poland",           marketNotes: "Polish App Store. Professional tone. Keywords comma-separated." },
  pt:        { language: "Portuguese",          country: "Brazil / Portugal", marketNotes: "Brazilian Portuguese preferred. Energetic tone. Keywords comma-separated." },
  ro:        { language: "Romanian",            country: "Romania",          marketNotes: "Romanian App Store. Friendly, modern tone. Keywords comma-separated." },
  ru:        { language: "Russian",             country: "Russia",           marketNotes: "Russian App Store. Formal tone. Keywords comma-separated." },
  sk:        { language: "Slovak",              country: "Slovakia",         marketNotes: "Slovak App Store. Professional yet friendly tone. Keywords comma-separated." },
  sv:        { language: "Swedish",             country: "Sweden",           marketNotes: "Swedish App Store. Clean, minimal Scandinavian style. Keywords comma-separated." },
  th:        { language: "Thai",                country: "Thailand",         marketNotes: "Thai App Store. Polite, friendly tone. Keywords comma-separated Thai words." },
  tr:        { language: "Turkish",             country: "Turkey",           marketNotes: "Turkish App Store. Direct and clear. Keywords comma-separated." },
  uk:        { language: "Ukrainian",           country: "Ukraine",          marketNotes: "Ukrainian App Store. Warm, professional tone. Keywords comma-separated." },
  vi:        { language: "Vietnamese",          country: "Vietnam",          marketNotes: "Vietnamese App Store. Friendly, youthful tone. Keywords comma-separated." },
  "zh-Hans": { language: "Simplified Chinese",  country: "China / mainland Chinese speakers", marketNotes: "Simplified Chinese. Keywords space- or comma-separated Chinese words. Be concise." },
  "zh-Hant": { language: "Traditional Chinese", country: "Taiwan / Hong Kong", marketNotes: "Traditional Chinese. Warm, friendly tone common in TW/HK market. Keywords comma-separated." },
};

function getLocaleContext(code: string) {
  return LOCALE_CONTEXT[code] ?? {
    language: code,
    country: code,
    marketNotes: `Optimise for the ${code} locale market.`,
  };
}

type SlideSource = { slideKey: string; label: string; headline: string; subtitle: string };

type GenerateBody = {
  productId: string;
  targetLocale: string;   // e.g. "ja"
  targetLabel: string;    // e.g. "日本語"
  targetFlag?: string;    // e.g. "🇯🇵"
  sourceLocale: string;   // primary locale to translate from
  sourceLabel: string;    // e.g. "English"
  sourceFlag?: string;    // e.g. "🇺🇸"
  sourceMetadata: MetadataConfig;
  sourceSlides: SlideSource[];  // plain-text representation of slides
};

type JsonSchema = { name: string; strict: boolean; schema: Record<string, unknown> };

async function callTogether<T>(prompt: string, json_schema: JsonSchema): Promise<T> {
  const response = await together.chat.completions.create({
    model: TOGETHER_MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_schema", json_schema },
    temperature: 0.4,
    max_tokens: 4096,
  });
  const completion = response as { choices: Array<{ message: { content: string } }> };
  return JSON.parse(completion.choices[0]?.message.content ?? "{}") as T;
}

const s = <T extends Record<string, unknown>>(v: T): T => v;

const METADATA_SCHEMA: JsonSchema = {
  name: "aso_metadata",
  strict: true,
  schema: s({
    type: "object",
    properties: s({
      name:             s({ type: "string" }),
      subtitle:         s({ type: "string" }),
      promoText:        s({ type: "string" }),
      shortDescription: s({ type: "string" }),
      description:      s({ type: "string" }),
      keywords:         s({ type: "string" }),
    }),
    required: ["name", "subtitle", "promoText", "shortDescription", "description", "keywords"],
    additionalProperties: false,
  }),
};

const SLIDES_SCHEMA: JsonSchema = {
  name: "aso_slides",
  strict: true,
  schema: s({
    type: "object",
    properties: s({
      slides: s({
        type: "array",
        items: s({
          type: "object",
          properties: s({
            slideKey: s({ type: "string" }),
            label:    s({ type: "string" }),
            headline: s({ type: "string" }),
            subtitle: s({ type: "string" }),
          }),
          required: ["slideKey", "label", "headline", "subtitle"],
          additionalProperties: false,
        }),
      }),
    }),
    required: ["slides"],
    additionalProperties: false,
  }),
};

/** Convert plain markup text to RichTextSegment[]. Replicates markupToSegments logic. */
function markupToSegments(markup: string): RichTextSegment[] {
  const segments: RichTextSegment[] = [];
  const parts = markup.split(/(\*\*[^*]*\*\*|\\n)/g);
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

export async function POST(req: NextRequest) {
  const body = await req.json() as GenerateBody;
  const { productId, targetLocale, targetLabel, targetFlag, sourceLocale, sourceMetadata, sourceSlides } = body;

  if (!productId || !targetLocale || !sourceLocale || !sourceMetadata || !sourceSlides) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ctx = getLocaleContext(targetLocale);

  // ── 1. Generate metadata ───────────────────────────────────────────────────
  const metaPrompt = `You are an App Store Optimisation (ASO) expert specialising in the ${ctx.country} market.

Translate and optimise the following app store metadata from ${sourceLocale.toUpperCase()} to ${ctx.language}.
Market notes: ${ctx.marketNotes}

STRICT CHARACTER LIMITS (never exceed):
- name: 30 characters
- subtitle: 30 characters
- promoText: 170 characters
- shortDescription: 80 characters
- description: 4000 characters
- keywords: 100 characters (comma-separated, no spaces after commas)

SOURCE METADATA (${sourceLocale.toUpperCase()}):
name: ${sourceMetadata.name}
subtitle: ${sourceMetadata.subtitle}
promoText: ${sourceMetadata.promoText}
shortDescription: ${sourceMetadata.shortDescription}
description: ${sourceMetadata.description}
keywords: ${sourceMetadata.keywords}

Return a JSON object with exactly these keys: name, subtitle, promoText, shortDescription, description, keywords.`;

  // ── 2. Generate slide copy ─────────────────────────────────────────────────
  const slidesInput = sourceSlides.map((s) =>
    `Slide "${s.slideKey}":
  label: ${s.label}
  headline: ${s.headline}
  subtitle: ${s.subtitle}`
  ).join("\n\n");

  const slidesPrompt = `You are an app marketing copywriter optimising screenshot copy for the ${ctx.country} market.

Translate and adapt the following app screenshot copy from ${sourceLocale.toUpperCase()} to ${ctx.language}.
Market notes: ${ctx.marketNotes}

FORMAT RULES:
- label: ALL CAPS, short category label (max ~30 chars)
- headline: The main benefit statement. You may use **bold** to wrap the key accent phrase (e.g. "Track **every milestone**"). Use \\n for a line break if needed.
- subtitle: Supporting sentence. Can use \\n for line breaks.
- Keep copy punchy and benefit-driven, not feature-listing.

SOURCE SLIDES (${sourceLocale.toUpperCase()}):
${slidesInput}

Return a JSON object with a single key "slides" whose value is an array. Each element has: slideKey, label, headline, subtitle.`;

  let generatedMetadata: MetadataConfig;
  let generatedSlides: SlideSource[];

  try {
    const [metaResult, slidesResult] = await Promise.all([
      callTogether<MetadataConfig>(metaPrompt, METADATA_SCHEMA),
      callTogether<{ slides: SlideSource[] }>(slidesPrompt, SLIDES_SCHEMA),
    ]);

    generatedMetadata = metaResult;
    generatedSlides   = slidesResult.slides;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `AI generation failed: ${msg}` }, { status: 500 });
  }

  // ── 3. Persist to DB ───────────────────────────────────────────────────────

  // 3a. Ensure both source and target locales exist in productLocales.
  // The source locale may only exist as a hardcoded fallback (never persisted), so insert it first.
  const allLocaleRows = await db
    .select({ code: productLocales.code, sortOrder: productLocales.sortOrder })
    .from(productLocales)
    .where(eq(productLocales.productId, productId));

  const existingCodes = new Set(allLocaleRows.map((r) => r.code));
  const maxOrder = allLocaleRows.length ? Math.max(...allLocaleRows.map((r) => r.sortOrder)) : -1;
  let nextOrder = maxOrder;

  if (!existingCodes.has(sourceLocale)) {
    await db.insert(productLocales).values({
      productId,
      code:      sourceLocale,
      label:     body.sourceLabel,
      flag:      body.sourceFlag ?? null,
      sortOrder: 0,
    });
  }

  if (!existingCodes.has(targetLocale)) {
    nextOrder += 1;
    await db.insert(productLocales).values({
      productId,
      code:      targetLocale,
      label:     targetLabel,
      flag:      targetFlag ?? null,
      sortOrder: nextOrder,
    });
  }

  // 3b. Upsert metadata
  await db
    .insert(productMetadata)
    .values({
      productId,
      locale:           targetLocale,
      name:             generatedMetadata.name ?? "",
      subtitle:         generatedMetadata.subtitle ?? "",
      promoText:        generatedMetadata.promoText ?? "",
      shortDescription: generatedMetadata.shortDescription ?? "",
      description:      generatedMetadata.description ?? "",
      keywords:         generatedMetadata.keywords ?? "",
    })
    .onConflictDoUpdate({
      target: [productMetadata.productId, productMetadata.locale],
      set: {
        name:             generatedMetadata.name ?? "",
        subtitle:         generatedMetadata.subtitle ?? "",
        promoText:        generatedMetadata.promoText ?? "",
        shortDescription: generatedMetadata.shortDescription ?? "",
        description:      generatedMetadata.description ?? "",
        keywords:         generatedMetadata.keywords ?? "",
      },
    });

  // 3c. Upsert slide copy
  for (const slide of generatedSlides) {
    const headline = markupToSegments(slide.headline ?? "");
    const subtitle = markupToSegments(slide.subtitle ?? "");
    const label    = slide.label ?? "";

    const existing = await db
      .select({ id: slideCopy.id })
      .from(slideCopy)
      .where(and(
        eq(slideCopy.productId, productId),
        eq(slideCopy.slideKey, slide.slideKey),
        eq(slideCopy.locale, targetLocale),
      ));

    if (existing.length) {
      await db
        .update(slideCopy)
        .set({ label, headline, subtitle })
        .where(and(
          eq(slideCopy.productId, productId),
          eq(slideCopy.slideKey, slide.slideKey),
          eq(slideCopy.locale, targetLocale),
        ));
    } else {
      await db.insert(slideCopy).values({ productId, slideKey: slide.slideKey, locale: targetLocale, label, headline, subtitle });
    }
  }

  return NextResponse.json({
    ok: true,
    locale: { code: targetLocale, label: targetLabel, flag: targetFlag },
    metadata: generatedMetadata,
  });
}
