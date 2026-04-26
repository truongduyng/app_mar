export type ThemeTokens = {
  bg: string;
  bgAlt: string;
  fg: string;
  fgMuted: string;
  accent: string;
  accentGlow: string;
  accentSoft: string;
  surface: string;
  gradients: {
    dark: string;
    warm: string;
    accent: string;
    deep: string;
    hero: string;
  };
};

/** Localizable copy for one slide */
export type SlideCopy = {
  label: string;
  headline: React.ReactNode;
  subtitle: React.ReactNode;
};

export type SlideDef = {
  id: string;
  /** Default (en) copy - required */
  copy: SlideCopy;
  /** Optional per-locale overrides, e.g. { vi: { label: "…", headline: … } } */
  copyByLocale?: Record<string, SlideCopy>;
  Component: React.FC<{ theme: ThemeTokens; base: string; copy: SlideCopy }>;
};

/** Asset categories the generator produces */
export type AssetCategory = "screenshots" | "feature-graphic" | "social-og" | "metadata";

/** Store metadata fields with character limits */
export type MetadataField = {
  id: string;
  label: string;
  platform: "apple" | "google" | "both";
  maxLength: number;
  multiline: boolean;
  placeholder: string;
  value: string;
};

/** Product-level metadata defaults */
export type MetadataConfig = {
  name: string;               // Both - 30 chars
  subtitle: string;           // Apple - 30 chars
  promoText: string;          // Apple - 170 chars
  shortDescription: string;   // Google - 80 chars
  description: string;        // Both - 4000 chars
  keywords: string;           // Apple - 100 chars
};

/** Locale definition for the metadata locale picker */
export type LocaleDef = {
  code: string;               // e.g. "en", "vi", "de"
  label: string;              // e.g. "English", "Tiếng Việt"
  flag?: string;              // e.g. "🇺🇸", "🇻🇳"
};

export type ProductConfig = {
  id: string;
  name: string;
  iconPath: string;
  screenshotBase: string;
  /** Per-locale screenshot base path overrides, e.g. { en: "/products/foo/screenshots/en", vi: "..." } */
  screenshotBaseByLocale?: Record<string, string>;
  mockupPath?: string;
  theme: ThemeTokens;
  /**
   * Supported locales for this product.
   * Controls both slide copy (copyByLocale) and store metadata (metadataByLocale).
   * A single language picker in the toolbar switches all content at once.
   * The first locale is the default (maps to the primary `copy` / `metadata` fields).
   */
  locales?: LocaleDef[];
  slides: {
    iphone: SlideDef[];
    android?: SlideDef[];
  };
  /** Per-locale slide overrides. Key is locale code. When present, replaces the default slides for that locale. */
  slidesByLocale?: Record<string, { iphone: SlideDef[]; android?: SlideDef[] }>;
  /** Feature Graphic slide (1024×500 Google Play banner) */
  featureGraphic?: {
    tagline: string;
    subtitle?: string;
  };
  /** OG / Social preview card (1200×630) */
  socialOg?: {
    tagline: string;
    subtitle?: string;
  };
  /** Store metadata defaults (primary / first locale) */
  metadata?: MetadataConfig;
  /** Per-locale metadata overrides. Key is locale code (e.g. "vi", "de") */
  metadataByLocale?: Record<string, MetadataConfig>;
};
