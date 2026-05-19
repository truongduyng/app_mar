import { NextRequest, NextResponse } from "next/server";
import Together from "together-ai";
import { LOCALE_NAMES } from "@/lib/locale-names";

const MODEL = "Qwen/Qwen3.5-397B-A17B";
const together = new Together();

export async function POST(req: NextRequest) {
  const { productName, productDescription, label, currentHeadline, currentSubtitle, locale, screenshotBase64 } = await req.json() as {
    productName: string;
    productDescription?: string;
    label: string;
    currentHeadline?: string;
    currentSubtitle?: string;
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
    currentSubtitle ? `Current subtitle: ${currentSubtitle}` : null,
  ].filter(Boolean).join("\n");

  const promptText = `You are a mobile app screenshot copywriter.${screenshotBase64 ? " Look at the screenshot image and use it to understand what the app screen shows." : ""} Generate a compelling headline and subtitle for this app store screenshot slide.

CONTEXT:
${contextLines}

TARGET LANGUAGE: ${language}

RULES:
- headline: Max 40 characters. Main benefit statement. Use **bold** to wrap 1-3 key words for emphasis (e.g. "Track **every milestone**"). Use \\n only if needed.
- subtitle: Max 60 characters. One short, benefit-driven sentence. Use \\n only if needed.
- Write punchy, emotional copy that sells the benefit — not a dry feature list.
- Write in ${language}. Sound native, not translated."}`;

  try {
    const messages: Parameters<typeof together.chat.completions.create>[0]["messages"] = screenshotBase64
      ? [
          {
            role: "user" as const,
            content: [
              { type: "text" as const, text: promptText },
              { type: "image_url" as const, image_url: { url: screenshotBase64 } },
            ],
          },
        ]
      : [{ role: "user", content: promptText }];

    const response = await together.chat.completions.create({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
      max_tokens: 8192,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";

    let result: { headline?: string; subtitle?: string };
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

    return NextResponse.json({ ok: true, headline: result.headline ?? "", subtitle: result.subtitle ?? "" });
  } catch (e) {
    console.error("[generate-copy] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
