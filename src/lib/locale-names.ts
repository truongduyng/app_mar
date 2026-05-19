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
