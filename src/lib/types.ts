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
  /** Numeric DB primary key of the product_slides row — used for screenshot upload */
  dbId: number;
  /** Default (en) copy - required */
  copy: SlideCopy;
  /** Optional per-locale overrides, e.g. { vi: { label: "…", headline: … } } */
  copyByLocale?: Record<string, SlideCopy>;
  /** Full public path to the screenshot image, e.g. /products/amfo/screenshots/sc1.png */
  imagePath?: string;
  Component: React.FC<{ theme: ThemeTokens; imagePath: string; copy: SlideCopy }>;
};

/**
 * Structured locale copy for a product's slides.
 * Key is slide id, value is a map of locale → SlideCopy.
 * Used in copy.ts files to separate content from component wiring.
 *
 * Example:
 *   export const COPY: SlideCopyMap = {
 *     hero: { en: { label: "HERO", headline: "...", subtitle: "..." }, vi: { ... } },
 *   }
 */
export type SlideCopyMap = Record<string, Record<string, SlideCopy>>;

export type AppPlatform = "iphone" | "android";

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
  /** CTA image (1080×1080 square for social) */
  ctaImage?: {
    headline: string;
    headlineByLocale?: Record<string, string>;
    /** Filename within screenshotBase, e.g. "sc1.png" or "sc_hone1.png" */
    sc1: string;
    sc2: string;
    ctaLabel?: string;
    ctaLabelByLocale?: Record<string, string>;
  };
  /** Store metadata defaults (primary / first locale) */
  metadata?: MetadataConfig;
  /** Per-locale metadata overrides. Key is locale code (e.g. "vi", "de") */
  metadataByLocale?: Record<string, MetadataConfig>;
  /** Apple App Store bundle ID, e.g. "com.example.myapp" */
  bundleId?: string;
  /** Google Play package name, e.g. "com.example.myapp" */
  packageName?: string;
};

// ─── Serializable versions (DB ↔ API, no React nodes) ─────────────────────

import type { RichTextSegment } from "./rich-text";

export type SerializableSlideCopy = {
  label: string;
  headline: RichTextSegment[];
  subtitle: RichTextSegment[];
};

export type SerializableSlideDef = {
  id: string;
  dbId: number;
  componentKey: string;
  copy: SerializableSlideCopy;
  copyByLocale?: Record<string, SerializableSlideCopy>;
  imagePath?: string;
};

export type SerializableProductConfig = Omit<
  ProductConfig,
  "slides" | "slidesByLocale"
> & {
  slides: {
    iphone: SerializableSlideDef[];
    android?: SerializableSlideDef[];
  };
  slidesByLocale?: Record<string, {
    iphone: SerializableSlideDef[];
    android?: SerializableSlideDef[];
  }>;
};
