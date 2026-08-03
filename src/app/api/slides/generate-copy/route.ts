import { NextRequest, NextResponse } from "next/server";
import { LOCALE_NAMES } from "@/lib/locale-names";
import { zaiComplete, ZAI_VISION_MODEL } from "@/lib/zai";

export async function POST(req: NextRequest) {
  const { productName, productDescription, label, currentHeadline, locale, screenshotBase64 } = await req.json() as {
    productName: string;
    productDescription?: string;
    label: string;
    currentHeadline?: string;
    locale: string;
    screenshotBase64?: string;
  };

  if (!productName || !label || !locale) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const language = LOCALE_NAMES[locale] ?? locale;

  const contextLines = [
    `App name: ${productName}`,
    productDescription ? `App description: ${productDescription}` : null,
    `Slide label: ${label}`,
    currentHeadline ? `Current headline: ${currentHeadline}` : null,
  ].filter(Boolean).join("\n");

  const promptText = `You are a mobile app screenshot copywriter.${screenshotBase64 ? " Look at the screenshot image and use it to understand what the app screen shows." : ""} Generate a compelling headline for this app store screenshot slide.

CONTEXT:
${contextLines}

TARGET LANGUAGE: ${language}

RULES:
- headline: Max 40 characters. Main benefit statement. Use **bold** to wrap 1-3 key words for emphasis (e.g. "Track **every milestone**"). Use \\n only if needed.
- Write punchy, emotional copy that sells the benefit — not a dry feature list.
- Write in ${language}. Sound native, not translated."}`;

  try {
    const raw = await zaiComplete({
      prompt: promptText,
      imageBase64: screenshotBase64,
      model: ZAI_VISION_MODEL,
    });

    let result: { headline?: string };
    try {
      result = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("[generate-copy] unparseable response:", raw);
        return NextResponse.json({ error: "Model returned non-JSON response" }, { status: 502 });
      }
      result = JSON.parse(jsonMatch[0]);
    }

    return NextResponse.json({ ok: true, headline: result.headline ?? "" });
  } catch (e) {
    console.error("[generate-copy] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
