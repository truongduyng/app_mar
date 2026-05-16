import { NextRequest, NextResponse } from "next/server";
import Together from "together-ai";

const MODEL = "moonshotai/Kimi-K2.6";
const together = new Together();

const LOCALE_NAMES: Record<string, string> = {
  ar: "Arabic", cs: "Czech", da: "Danish", de: "German", el: "Greek",
  en: "English", es: "Spanish", fi: "Finnish", fr: "French", he: "Hebrew",
  hr: "Croatian", hu: "Hungarian", id: "Indonesian", it: "Italian",
  ja: "Japanese", ko: "Korean", ms: "Malay", nl: "Dutch", no: "Norwegian",
  pl: "Polish", pt: "Portuguese", ro: "Romanian", ru: "Russian",
  sk: "Slovak", sv: "Swedish", th: "Thai", tr: "Turkish", uk: "Ukrainian",
  vi: "Vietnamese", "zh-Hans": "Simplified Chinese", "zh-Hant": "Traditional Chinese",
};

export async function POST(req: NextRequest) {
  const { productName, label, currentHeadline, currentSubtitle, locale, screenshotBase64 } = await req.json() as {
    productName: string;
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
- Write in ${language}. Sound native, not translated.

You MUST respond with ONLY a raw JSON object — no markdown, no code fences, no explanation. Example: {"headline": "...", "subtitle": "..."}`;

  try {
    const messages: Parameters<typeof together.chat.completions.create>[0]["messages"] = screenshotBase64
      ? [
          {
            role: "user",
            content: [{ type: "image_url", image_url: { url: screenshotBase64 } }] as Parameters<typeof together.chat.completions.create>[0]["messages"][0]["content"],
          },
          { role: "user", content: promptText },
        ]
      : [{ role: "user", content: promptText }];

    const response = await together.chat.completions.create({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 512,
    }) as { choices: Array<{ message: { content: string } }> };

    const raw = response.choices[0]?.message.content ?? "{}";
    console.log("[generate-copy] raw response:", raw);

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
