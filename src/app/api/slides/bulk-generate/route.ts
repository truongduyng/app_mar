import { NextRequest, NextResponse } from "next/server";
import Together from "together-ai";
import { db } from "@/db/client";
import { slideGroups, productSlides, slideCopy, productLocales } from "@/db/schema";
import { eq, and, max } from "drizzle-orm";
import { LOCALE_NAMES } from "@/lib/locale-names";

const MODEL = "moonshotai/Kimi-K2.6";
const together = new Together();

export async function POST(req: NextRequest) {
  const { productId, productName, productDescription, device, locale, styleKey, count } =
    await req.json() as {
      productId: string;
      productName: string;
      productDescription?: string;
      device: "iphone" | "android";
      locale: string;
      styleKey: string;
      count: number;
    };

  if (!productId || !productName || !device || !locale || !styleKey || !count) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const language = LOCALE_NAMES[locale] ?? locale;

  const prompt = `You are a mobile app screenshot copywriter. Generate exactly ${count} App Store screenshot slides for the following app.

App name: ${productName}
${productDescription ? `App description: ${productDescription}` : ""}
Target language: ${language}

Return a JSON object with a "slides" array of exactly ${count} objects, each with:
- "label": short internal name, lowercase English, 1-4 words (e.g. "track progress", "instant sync")
- "headline": max 40 chars, punchy benefit statement, use **word** to bold 1-3 key words, \\n only if needed
- "subtitle": max 60 chars, one short benefit-driven sentence, \\n only if needed

Cover different angles: core value prop, key features, social proof, ease of use, etc. No duplicate themes.
Write headline and subtitle in ${language}. Sound native, not translated.

Respond with only the JSON object.`;

  let slides: { label: string; headline: string; subtitle: string }[];
  try {
    const response = await together.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });
    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: { slides?: unknown[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return NextResponse.json({ error: "Model returned non-JSON" }, { status: 502 });
      parsed = JSON.parse(m[0]);
    }
    if (!Array.isArray(parsed.slides)) {
      return NextResponse.json({ error: "Model did not return slides array" }, { status: 502 });
    }
    slides = (parsed.slides as { label?: string; headline?: string; subtitle?: string }[]).map((s) => ({
      label: String(s.label ?? "Slide"),
      headline: String(s.headline ?? ""),
      subtitle: String(s.subtitle ?? ""),
    }));
  } catch (e) {
    console.error("[bulk-generate] AI error:", e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }

  // Resolve or create default slide group
  let [group] = await db
    .select()
    .from(slideGroups)
    .where(and(eq(slideGroups.productId, productId), eq(slideGroups.name, "default")));

  if (!group) {
    const [inserted] = await db
      .insert(slideGroups)
      .values({ productId, name: "default", sortOrder: 0 })
      .returning();
    group = inserted;
  }

  // Get current max sortOrder
  const [{ maxOrder }] = await db
    .select({ maxOrder: max(productSlides.sortOrder) })
    .from(productSlides)
    .where(and(eq(productSlides.groupId, group.id), eq(productSlides.device, device)));

  let nextOrder = (maxOrder ?? -1) + 1;

  // Get all locales for this product
  const localeRows = await db
    .select({ code: productLocales.code })
    .from(productLocales)
    .where(eq(productLocales.productId, productId));
  const localeCodes = localeRows.length ? localeRows.map((l) => l.code) : ["en"];

  const created: { slideId: number; label: string }[] = [];

  for (const slide of slides) {
    const slideKey = `${slide.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [row] = await db
      .insert(productSlides)
      .values({ groupId: group.id, device, slideKey, componentKey: styleKey, sortOrder: nextOrder++ })
      .returning();

    const headlineSegs = slide.headline ? [{ t: "text", v: slide.headline }] : [];
    const subtitleSegs = slide.subtitle ? [{ t: "text", v: slide.subtitle }] : [];

    for (const code of localeCodes) {
      await db.insert(slideCopy).values({
        productId,
        slideKey,
        locale: code,
        label: slide.label,
        headline: headlineSegs,
        subtitle: subtitleSegs,
      }).onConflictDoNothing();
    }

    created.push({ slideId: row.id, label: slide.label });
  }

  return NextResponse.json({ ok: true, created });
}
