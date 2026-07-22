import type { LocaleDef } from "@/lib/types";

export const COMMON_LOCALES: LocaleDef[] = [
  { code: "ar",      label: "Arabic",               flag: "🇸🇦" },
  { code: "cs",      label: "Czech",                flag: "🇨🇿" },
  { code: "da",      label: "Danish",               flag: "🇩🇰" },
  { code: "en",      label: "English",              flag: "🇬🇧" },
  { code: "de",      label: "German",               flag: "🇩🇪" },
  { code: "el",      label: "Greek",                flag: "🇬🇷" },
  { code: "es",      label: "Spanish",              flag: "🇪🇸" },
  { code: "fi",      label: "Finnish",              flag: "🇫🇮" },
  { code: "fil",     label: "Filipino",             flag: "🇵🇭" },
  { code: "fr",      label: "French",               flag: "🇫🇷" },
  { code: "he",      label: "Hebrew",               flag: "🇮🇱" },
  { code: "hr",      label: "Croatian",             flag: "🇭🇷" },
  { code: "hu",      label: "Hungarian",            flag: "🇭🇺" },
  { code: "id",      label: "Indonesian",           flag: "🇮🇩" },
  { code: "it",      label: "Italian",              flag: "🇮🇹" },
  { code: "ja",      label: "Japanese",             flag: "🇯🇵" },
  { code: "ko",      label: "Korean",               flag: "🇰🇷" },
  { code: "ms",      label: "Malay",                flag: "🇲🇾" },
  { code: "nl",      label: "Dutch",                flag: "🇳🇱" },
  { code: "no",      label: "Norwegian",            flag: "🇳🇴" },
  { code: "pl",      label: "Polish",               flag: "🇵🇱" },
  { code: "pt",      label: "Portuguese",           flag: "🇵🇹" },
  { code: "ro",      label: "Romanian",             flag: "🇷🇴" },
  { code: "ru",      label: "Russian",              flag: "🇷🇺" },
  { code: "sk",      label: "Slovak",               flag: "🇸🇰" },
  { code: "sv",      label: "Swedish",              flag: "🇸🇪" },
  { code: "th",      label: "Thai",                 flag: "🇹🇭" },
  { code: "tr",      label: "Turkish",              flag: "🇹🇷" },
  { code: "uk",      label: "Ukrainian",            flag: "🇺🇦" },
  { code: "vi",      label: "Vietnamese",           flag: "🇻🇳" },
  { code: "zh-Hans", label: "Simplified Chinese",   flag: "🇨🇳" },
  { code: "zh-Hant", label: "Traditional Chinese",  flag: "🇹🇼" },
];

export const LOCALE_NAMES: Record<string, string> = Object.fromEntries(
  COMMON_LOCALES.map((l) => [l.code, l.label])
);

// Country/market context for ASO copywriting prompts.
export const LOCALE_CONTEXT: Record<
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

export function getLocaleContext(code: string) {
  return (
    LOCALE_CONTEXT[code] ?? {
      language: code,
      country: code,
      marketNotes: `Optimise for the ${code} locale market.`,
    }
  );
}
