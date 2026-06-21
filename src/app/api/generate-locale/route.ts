import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { productLocales, slideCopy, productMetadata } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { RichTextSegment } from "@/lib/rich-text";
import type { MetadataConfig } from "@/lib/types";
import { togetherComplete } from "@/lib/together";

// Map locale code → country/market context for ASO optimisation
const LOCALE_CONTEXT: Record<
  string,
  { language: string; country: string; marketNotes: string }
> = {
  ar: {
    language: "Arabic",
    country: "Middle East / Arabic-speaking countries",
    marketNotes:
      "Right-to-left language. Modern Standard Arabic. Keep copy short and impactful. Keywords comma-separated.",
  },
  cs: {
    language: "Czech",
    country: "Czech Republic",
    marketNotes:
      "Czech App Store. Professional yet friendly tone. Keywords comma-separated.",
  },
  da: {
    language: "Danish",
    country: "Denmark",
    marketNotes:
      "Danish App Store. Clean, direct Scandinavian style. Keywords comma-separated.",
  },
  en: {
    language: "English",
    country: "English-speaking markets",
    marketNotes:
      "App Store English. Clear, benefit-driven copy. Keywords comma-separated.",
  },
  de: {
    language: "German",
    country: "Germany/Austria/Switzerland",
    marketNotes:
      "German App Store. Precision and feature depth valued. Keywords comma-separated.",
  },
  el: {
    language: "Greek",
    country: "Greece",
    marketNotes:
      "Greek App Store. Warm and expressive tone. Keywords comma-separated.",
  },
  es: {
    language: "Spanish",
    country: "Spain / Latin America",
    marketNotes:
      "Spanish App Store. Warm and expressive. Keywords comma-separated.",
  },
  fi: {
    language: "Finnish",
    country: "Finland",
    marketNotes:
      "Finnish App Store. Understated, honest tone. Keywords comma-separated.",
  },
  fil: {
    language: "Filipino",
    country: "Philippines",
    marketNotes:
      "Philippine App Store. Friendly, energetic tone. Mix of Filipino and English is natural. Keywords comma-separated.",
  },
  fr: {
    language: "French",
    country: "France",
    marketNotes:
      "French App Store. Elegant, friendly tone. Keywords comma-separated.",
  },
  he: {
    language: "Hebrew",
    country: "Israel",
    marketNotes:
      "Right-to-left language. Israeli App Store. Direct and modern tone. Keywords comma-separated.",
  },
  hr: {
    language: "Croatian",
    country: "Croatia",
    marketNotes:
      "Croatian App Store. Friendly, approachable tone. Keywords comma-separated.",
  },
  hu: {
    language: "Hungarian",
    country: "Hungary",
    marketNotes:
      "Hungarian App Store. Professional tone. Keywords comma-separated.",
  },
  id: {
    language: "Indonesian",
    country: "Indonesia",
    marketNotes:
      "Indonesian App Store. Casual but clear tone. Keywords comma-separated.",
  },
  it: {
    language: "Italian",
    country: "Italy",
    marketNotes:
      "Italian App Store. Expressive and warm. Keywords comma-separated.",
  },
  ja: {
    language: "Japanese",
    country: "Japan",
    marketNotes:
      "Japanese App Store. Polite, concise Japanese. Keywords comma-separated Japanese words/phrases. Lead with core value then features.",
  },
  ko: {
    language: "Korean",
    country: "South Korea",
    marketNotes:
      "Korean App Store. 합쇼체 formality. Emphasise social proof and trust signals. Keywords comma-separated.",
  },
  ms: {
    language: "Malay",
    country: "Malaysia",
    marketNotes:
      "Malaysian App Store. Friendly and clear tone. Keywords comma-separated.",
  },
  nl: {
    language: "Dutch",
    country: "Netherlands",
    marketNotes:
      "Dutch App Store. Direct and pragmatic tone. Keywords comma-separated.",
  },
  no: {
    language: "Norwegian",
    country: "Norway",
    marketNotes:
      "Norwegian App Store. Clean, direct Scandinavian style. Keywords comma-separated.",
  },
  pl: {
    language: "Polish",
    country: "Poland",
    marketNotes:
      "Polish App Store. Professional tone. Keywords comma-separated.",
  },
  pt: {
    language: "Portuguese",
    country: "Brazil / Portugal",
    marketNotes:
      "Brazilian Portuguese preferred. Energetic tone. Keywords comma-separated.",
  },
  ro: {
    language: "Romanian",
    country: "Romania",
    marketNotes:
      "Romanian App Store. Friendly, modern tone. Keywords comma-separated.",
  },
  ru: {
    language: "Russian",
    country: "Russia",
    marketNotes: "Russian App Store. Formal tone. Keywords comma-separated.",
  },
  sk: {
    language: "Slovak",
    country: "Slovakia",
    marketNotes:
      "Slovak App Store. Professional yet friendly tone. Keywords comma-separated.",
  },
  sv: {
    language: "Swedish",
    country: "Sweden",
    marketNotes:
      "Swedish App Store. Clean, minimal Scandinavian style. Keywords comma-separated.",
  },
  th: {
    language: "Thai",
    country: "Thailand",
    marketNotes:
      "Thai App Store. Polite, friendly tone. Keywords comma-separated Thai words.",
  },
  tr: {
    language: "Turkish",
    country: "Turkey",
    marketNotes:
      "Turkish App Store. Direct and clear. Keywords comma-separated.",
  },
  uk: {
    language: "Ukrainian",
    country: "Ukraine",
    marketNotes:
      "Ukrainian App Store. Warm, professional tone. Keywords comma-separated.",
  },
  vi: {
    language: "Vietnamese",
    country: "Vietnam",
    marketNotes:
      "Vietnamese App Store. Friendly, youthful tone. Keywords comma-separated.",
  },
  "zh-Hans": {
    language: "Simplified Chinese",
    country: "China / mainland Chinese speakers",
    marketNotes:
      "Simplified Chinese. Keywords space- or comma-separated Chinese words. Be concise.",
  },
  "zh-Hant": {
    language: "Traditional Chinese",
    country: "Taiwan / Hong Kong",
    marketNotes:
      "Traditional Chinese. Warm, friendly tone common in TW/HK market. Keywords comma-separated.",
  },
};

function getLocaleContext(code: string) {
  return (
    LOCALE_CONTEXT[code] ?? {
      language: code,
      country: code,
      marketNotes: `Optimise for the ${code} locale market.`,
    }
  );
}

type SlideSource = {
  slideKey: string;
  label: string;
  headline: string;
  subtitle: string;
};

type GenerateBody = {
  productId: string;
  targetLocale: string;
  targetLabel: string;
  targetFlag?: string;
  sourceLocale: string;
  sourceLabel: string;
  sourceFlag?: string;
  sourceMetadata: MetadataConfig;
  sourceSlides: SlideSource[];
};

type JsonSchema = {
  name: string;
  strict: boolean;
  schema: Record<string, unknown>;
};

async function callTogether<T>(
  prompt: string,
  jsonSchema: JsonSchema,
): Promise<T> {
  const raw = await togetherComplete({ prompt, jsonSchema });
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("[generate-locale] failed to parse model output", {
      jsonSchemaName: jsonSchema.name,
      rawLength: raw.length,
      raw,
    });
    throw err;
  }
}

const s = <T extends Record<string, unknown>>(v: T): T => v;

const METADATA_SCHEMA: JsonSchema = {
  name: "aso_metadata",
  strict: true,
  schema: s({
    type: "object",
    properties: s({
      name: s({ type: "string" }),
      subtitle: s({ type: "string" }),
      promoText: s({ type: "string" }),
      shortDescription: s({ type: "string" }),
      description: s({ type: "string" }),
      keywords: s({ type: "string" }),
      whatsNew: s({ type: "string" }),
    }),
    required: [
      "name",
      "subtitle",
      "promoText",
      "shortDescription",
      "description",
      "keywords",
      "whatsNew",
    ],
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
            label: s({ type: "string" }),
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

const META_LIMITS: Record<keyof MetadataConfig, number> = {
  name: 30,
  subtitle: 30,
  promoText: 170,
  shortDescription: 80,
  description: 4000,
  keywords: 100,
  whatsNew: 4000,
};

type MetaViolation = { field: keyof MetadataConfig; current: string; limit: number };

function checkMetaLimits(meta: MetadataConfig): MetaViolation[] {
  return (Object.keys(META_LIMITS) as (keyof MetadataConfig)[])
    .filter((k) => (meta[k]?.length ?? 0) > META_LIMITS[k])
    .map((k) => ({ field: k, current: meta[k] ?? "", limit: META_LIMITS[k] }));
}

async function generateMetadata(
  ctx: { language: string; country: string; marketNotes: string },
  sourceLocale: string,
  sourceMetadata: MetadataConfig,
): Promise<MetadataConfig> {
  const prompt = `You are a senior App Store Optimisation (ASO) copywriter for the ${ctx.country} market. You write compelling, conversion-focused app store listings that feel native to the language and culture — not translated.

Your task: study the source app store listing below to deeply understand what this app does and what value it delivers. Then write entirely new, high-quality ${ctx.language} copy for the ${ctx.country} App Store. You are free to restructure sentences, choose different angles, or reorder benefits — as long as the meaning and feature set remain accurate.

Market context: ${ctx.marketNotes}

STRICT CHARACTER LIMITS — these are hard limits enforced by Apple. Exceeding them will cause a rejection. Count every character carefully before responding:
- name: max 30 characters
- subtitle: max 30 characters
- promoText: max 170 characters
- shortDescription: max 80 characters
- description: max 4000 characters
- keywords: max 100 characters (comma-separated, no spaces after commas)
- whatsNew: max 4000 characters

SOURCE LISTING (${sourceLocale.toUpperCase()}) — use this to understand the app, not to translate word-for-word:
name: ${sourceMetadata.name}
subtitle: ${sourceMetadata.subtitle}
promoText: ${sourceMetadata.promoText}
shortDescription: ${sourceMetadata.shortDescription}
description: ${sourceMetadata.description}

IMPORTANT: Do not use any emoji in any field — the App Store will reject them.

Guidelines for each field:
- name: Keep the app name
- subtitle: Lead with the strongest benefit; feel free to rewrite for maximum impact. MUST be 30 characters or fewer.
- promoText: Write a compelling hook for the ${ctx.language}-speaking audience; adapt tone to local expectations
- shortDescription: One punchy sentence covering the top 2-3 features
- description: Rewrite to sound natural in ${ctx.language}. CRITICAL FORMATTING — each section heading must be ALL CAPS on its own line, with a blank line before it and a blank line after it. Example: "...end of paragraph.\\n\\nSECTION HEADING\\n\\nStart of next paragraph..." — the blank lines are mandatory. Plain text only, no markdown, no bullet symbols, no emoji.
- keywords: Comma-separated search terms, no space after each comma (e.g. "baby,tracker,growth"). Each term should be a single word or a natural short phrase in ${ctx.language}. No emoji. CRITICAL: the entire string including commas must be 100 characters or fewer. Aim for 95–100 chars but never go over.
- whatsNew: Translate the source whatsNew directly into ${ctx.language}. Do not rewrite or add content — faithful translation only. Plain text, no emoji.

Return a JSON object with exactly these keys: name, subtitle, promoText, shortDescription, description, keywords, whatsNew.`;

  return callTogether<MetadataConfig>(prompt, METADATA_SCHEMA);
}

async function correctMetadata(
  meta: MetadataConfig,
  violations: MetaViolation[],
  ctx: { language: string; country: string },
): Promise<MetadataConfig> {
  const violationDetails = violations
    .map(
      (v) =>
        `- ${v.field}: currently ${v.current.length} characters, must be ${v.limit} or fewer. Current value: "${v.current}"`,
    )
    .join("\n");

  const prompt = `You are an ASO copywriter. The following ${ctx.language} App Store metadata fields exceed Apple's character limits and must be shortened WITHOUT truncating mid-word or mid-keyword. Preserve quality and meaning — rewrite smartly to fit within the limit.

Fields that need fixing:
${violationDetails}

Rules:
- For "subtitle": rewrite to convey the same benefit in ${v_limit_note(violations, "subtitle")} characters or fewer
- For "keywords": remove the least important keywords from the end until the total string (including commas) is 100 characters or fewer. Do not truncate any keyword mid-word.
- For other fields: shorten by removing less important words or condensing sentences
- Do not add emoji
- Return ONLY the fields listed above — do not include other fields

Return a JSON object containing only the keys that need fixing: ${violations.map((v) => v.field).join(", ")}.`;

  const fixSchema: JsonSchema = {
    name: "aso_metadata_fix",
    strict: true,
    schema: s({
      type: "object",
      properties: Object.fromEntries(violations.map((v) => [v.field, s({ type: "string" })])),
      required: violations.map((v) => v.field),
      additionalProperties: false,
    }),
  };

  const fixes = await callTogether<Partial<MetadataConfig>>(prompt, fixSchema);
  return { ...meta, ...fixes };
}

function v_limit_note(violations: MetaViolation[], field: string): number {
  return violations.find((v) => v.field === field)?.limit ?? 30;
}

async function generateSlides(
  ctx: { language: string; country: string; marketNotes: string },
  sourceLocale: string,
  sourceSlides: SlideSource[],
): Promise<SlideSource[]> {
  const slidesInput = sourceSlides
    .map(
      (s) =>
        `Slide "${s.slideKey}":
  label: ${s.label}
  headline: ${s.headline}
  subtitle: ${s.subtitle}`,
    )
    .join("\n\n");

  const prompt = `You are a senior mobile app marketing copywriter creating screenshot copy for the ${ctx.country} market. Your copy should feel like it was written by a native ${ctx.language} speaker who understands the app deeply — not translated.

Your task: study the source slide copy below to understand the message and intent of each slide. Then write fresh, compelling ${ctx.language} copy that resonates with the ${ctx.country} audience. You may rewrite headlines and subtitles with a different angle, stronger hook, or better cultural fit — as long as the core message is preserved.

Market context: ${ctx.marketNotes}

FORMAT RULES:
- label: Short ALL-CAPS category label (max 30 chars). Adapt to sound natural in ${ctx.language}, not a literal translation.
- headline: Max 40 characters (excluding markup). The main benefit statement. You may use **bold** to wrap the key accent word/phrase (e.g. "Track **every milestone**"). Use a newline only if needed.
- subtitle: Max 60 characters. One short sentence only. Conversational, benefit-driven. Use a newline only if absolutely needed.
- Overall: write punchy, emotional copy that sells the benefit — not a dry list of features.

SOURCE SLIDES (${sourceLocale.toUpperCase()}) — understand the intent, then rewrite for ${ctx.language}:
${slidesInput}

Return a JSON object with a single key "slides" whose value is an array. Each element has: slideKey, label, headline, subtitle.`;

  const result = await callTogether<{ slides: SlideSource[] }>(prompt, SLIDES_SCHEMA);
  return result.slides;
}

/** Convert plain markup text to RichTextSegment[]. Replicates markupToSegments logic. */
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

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GenerateBody;
  const {
    productId,
    targetLocale,
    targetLabel,
    targetFlag,
    sourceLocale,
    sourceMetadata,
    sourceSlides,
  } = body;

  if (
    !productId ||
    !targetLocale ||
    !sourceLocale ||
    !sourceMetadata ||
    !sourceSlides
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const ctx = getLocaleContext(targetLocale);

  // ── 1. Generate metadata and slides in parallel ────────────────────────────
  let generatedMetadata: MetadataConfig;
  let generatedSlides: SlideSource[];

  try {
    [generatedMetadata, generatedSlides] = await Promise.all([
      generateMetadata(ctx, sourceLocale, sourceMetadata),
      generateSlides(ctx, sourceLocale, sourceSlides),
    ]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `AI generation failed: ${msg}` },
      { status: 500 },
    );
  }

  // ── 2. Validate and correct metadata if any field exceeds limits ───────────
  const violations = checkMetaLimits(generatedMetadata);
  if (violations.length > 0) {
    try {
      generatedMetadata = await correctMetadata(generatedMetadata, violations, ctx);
      // If still over after correction, log but continue — don't silently mangle content
      const remaining = checkMetaLimits(generatedMetadata);
      if (remaining.length > 0) {
        console.warn(
          `[generate-locale] ${targetLocale}: fields still over limit after correction:`,
          remaining.map((v) => `${v.field}(${v.current.length}/${v.limit})`).join(", "),
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `AI correction failed: ${msg}` },
        { status: 500 },
      );
    }
  }

  // ── 3. Clean description formatting ───────────────────────────────────────
  const cleanMeta = {
    ...generatedMetadata,
    description: (generatedMetadata.description ?? "")
      .replace(/([^\n])\n([A-ZÀ-ɏ][A-ZÀ-ɏ\s]{3,})\n/g, "$1\n\n$2\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  };

  // ── 4. Persist to DB ───────────────────────────────────────────────────────
  const allLocaleRows = await db
    .select({ code: productLocales.code, sortOrder: productLocales.sortOrder })
    .from(productLocales)
    .where(eq(productLocales.productId, productId));

  const existingCodes = new Set(allLocaleRows.map((r) => r.code));
  const maxOrder = allLocaleRows.length
    ? Math.max(...allLocaleRows.map((r) => r.sortOrder))
    : -1;
  let nextOrder = maxOrder;

  if (!existingCodes.has(sourceLocale)) {
    await db.insert(productLocales).values({
      productId,
      code: sourceLocale,
      label: body.sourceLabel,
      flag: body.sourceFlag ?? null,
      sortOrder: 0,
    });
  }

  if (!existingCodes.has(targetLocale)) {
    nextOrder += 1;
    await db.insert(productLocales).values({
      productId,
      code: targetLocale,
      label: targetLabel,
      flag: targetFlag ?? null,
      sortOrder: nextOrder,
    });
  }

  await db
    .insert(productMetadata)
    .values({ productId, locale: targetLocale, ...cleanMeta })
    .onConflictDoUpdate({
      target: [productMetadata.productId, productMetadata.locale],
      set: cleanMeta,
    });

  for (const slide of generatedSlides) {
    const headline = markupToSegments(slide.headline ?? "");
    const subtitle = markupToSegments(slide.subtitle ?? "");
    const label = slide.label ?? "";

    const existing = await db
      .select({ id: slideCopy.id })
      .from(slideCopy)
      .where(
        and(
          eq(slideCopy.productId, productId),
          eq(slideCopy.slideKey, slide.slideKey),
          eq(slideCopy.locale, targetLocale),
        ),
      );

    if (existing.length) {
      await db
        .update(slideCopy)
        .set({ label, headline, subtitle })
        .where(
          and(
            eq(slideCopy.productId, productId),
            eq(slideCopy.slideKey, slide.slideKey),
            eq(slideCopy.locale, targetLocale),
          ),
        );
    } else {
      await db.insert(slideCopy).values({
        productId,
        slideKey: slide.slideKey,
        locale: targetLocale,
        label,
        headline,
        subtitle,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    locale: { code: targetLocale, label: targetLabel, flag: targetFlag },
    metadata: cleanMeta,
  });
}
