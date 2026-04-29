---
name: app-store-screenshots
description: Use when building App Store or Google Play screenshot pages, generating exportable marketing screenshots for iOS and/or Android apps, or creating programmatic screenshot generators with Next.js. Triggers on app store, play store, screenshots, marketing assets, html-to-image, phone mockup, android screenshots, feature graphic.
---

# App Store & Google Play Screenshots Generator

## Overview

Build a Next.js page that renders App Store **and** Google Play screenshots as **advertisements** (not UI showcases) and exports them via `html-to-image` at Apple's and Google's required resolutions. Screenshots are the single most important conversion asset on both stores.

Supported devices out of the box:
- **iPhone** (portrait) - Apple App Store
- **iPad** (portrait) - Apple App Store
- **Android Phone** (portrait) - Google Play
- **Android Tablet 7"** (portrait + landscape) - Google Play
- **Android Tablet 10"** (portrait + landscape) - Google Play
- **Feature Graphic** (landscape banner, 1024×500) - Google Play store listing header

## Core Principle

**Screenshots are advertisements, not documentation.** Every screenshot sells one idea. If you're showing UI, you're doing it wrong - you're selling a *feeling*, an *outcome*, or killing a *pain point*.

## Step 1: Ask the User These Questions

Before writing ANY code, ask the user all of these. Do not proceed until you have answers:

### Required

1. **App screenshots** - "Where are your app screenshots? (PNG files of actual device captures)"
2. **App icon** - "Where is your app icon PNG?"
3. **Brand colors** - "What are your brand colors? (accent color, text color, background preference)"
4. **Font** - "What font does your app use? (or what font do you want for the screenshots?)"
5. **Feature list** - "List your app's features in priority order. What's the #1 thing your app does?"
6. **Number of slides** - "How many screenshots do you want? (Apple allows up to 10, Google Play up to 8)"
7. **Style direction** - "What style do you want? Examples: warm/organic, dark/moody, clean/minimal, bold/colorful, gradient-heavy, flat. Share App Store screenshot references if you have any."
8. **Multi-product** - "Is this a new product in an existing multi-product generator, or a standalone single-product project?" (If the user's workspace already has a multi-product generator, always add to it rather than creating a new project.)

### Optional

9. **Target stores** - "Are you targeting Apple App Store only, Google Play only, or both? This determines which devices we generate screenshots for."
10. **iPad screenshots** - "Do you also have iPad screenshots? If so, we'll generate iPad App Store screenshots too (recommended for universal apps)."
11. **Android tablet screenshots** - "Do you have Android tablet screenshots? If yes, what tablet sizes - 7" and/or 10"? Do you have them in portrait, landscape, or both orientations?"
12. **Feature Graphic** - "Do you want a Google Play Feature Graphic (1024×500 banner shown at the top of your Play Store listing)? This is separate from phone screenshots."
13. **Component assets** - "Do you have any UI element PNGs (cards, widgets, etc.) you want as floating decorations? If not, that's fine - we'll skip them."
14. **Localized screenshots** - "Do you want screenshots in multiple languages? This helps your listing rank in regional App Stores even if your app is English-only. If yes: which languages? (e.g. en, de, es, pt, ja, ar, he)"
15. **Theme preset system** - "Do you want one art direction, or reusable visual themes (for example: clean-light, dark-bold, warm-editorial) so you can swap screenshot looks quickly?"
16. **Additional instructions** - "Any specific requirements, constraints, or preferences?"

### Derived from answers (do NOT ask - decide yourself)

Based on the user's style direction, brand colors, and app aesthetic, decide:
- **Background style**: gradient direction, colors, whether light or dark base
- **Decorative elements**: blobs, glows, geometric shapes, or none - match the style
- **Dark vs light slides**: how many of each, which features suit dark treatment
- **Typography treatment**: weight, tracking, line height - match the brand personality
- **Color palette**: derive text colors, secondary colors, shadow tints from the brand colors
- **Theme preset names**: turn vague style requests into reusable theme ids the user can switch between
- **RTL behavior**: if any locale is RTL (`ar`, `he`, `fa`, `ur`), mirror layout intentionally instead of just translating the text
- **Landscape slide layouts**: for tablet landscape slides, use caption-left + device-right composition (never try to fit two tablets side-by-side in landscape - there's not enough horizontal room)
- **Single vs multi-product**: if the user mentions multiple apps or is adding a product to an existing generator, use the multi-product architecture (see below). Otherwise default to single-product.

**IMPORTANT:** If the user gives additional instructions at any point during the process, follow them. User instructions always override skill defaults.

### Multi-Product Architecture

When generating screenshots for **multiple apps** in one project, use this architecture. Default to single-product (backward compatible) - only activate multi-product when the user explicitly has multiple apps or is adding a product to an existing generator.

#### Type System

```typescript
type ThemeTokens = {
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

type SlideCopy = {
  label: string;
  headline: React.ReactNode;
  subtitle: React.ReactNode;
};

type SlideDef = {
  id: string;
  copy: SlideCopy;                              // default (first locale) copy
  copyByLocale?: Record<string, SlideCopy>;     // per-locale copy overrides
  Component: React.FC<{ theme: ThemeTokens; base: string; copy: SlideCopy }>;
};

type LocaleDef = {
  code: string;   // e.g. "en", "vi", "de"
  label: string;  // e.g. "English", "Tiếng Việt"
  flag?: string;  // e.g. "🇺🇸", "🇻🇳"
};

type MetadataConfig = {
  name: string;             // Both stores - 30 chars
  subtitle: string;         // Apple - 30 chars
  promoText: string;        // Apple - 170 chars
  shortDescription: string; // Google - 80 chars
  description: string;      // Both - 4000 chars
  keywords: string;         // Apple - 100 chars
};

type ProductConfig = {
  id: string;                // slug: "tinysteps", "fitfo"
  name: string;              // display: "TinySteps: Baby Tracker"
  iconPath: string;          // "/products/tinysteps/icon.png"
  screenshotBase: string;    // "/products/tinysteps/screenshots/en" (default locale)
  /** Per-locale screenshot base overrides. Use when each locale has different screenshot files. */
  screenshotBaseByLocale?: Record<string, string>;
  mockupPath?: string;       // override default "/mockup.png" if needed
  theme: ThemeTokens;        // single theme per product (not a theme map)
  locales?: LocaleDef[];     // supported locales; first entry is default
  slides: {
    iphone: SlideDef[];
    android?: SlideDef[];
  };
  /**
   * Per-locale slide overrides. Use when locales have different screenshot files
   * (different screens, different count) — replaces slides entirely for that locale.
   * Each slide component hardcodes the screenshot filename it shows (e.g. "sc1.png").
   * The `base` prop (resolved from screenshotBaseByLocale) points to the right folder.
   */
  slidesByLocale?: Record<string, { iphone: SlideDef[]; android?: SlideDef[] }>;
  featureGraphic?: { tagline: string; subtitle?: string };
  socialOg?: { tagline: string; subtitle?: string };
  metadata?: MetadataConfig;
  metadataByLocale?: Record<string, MetadataConfig>;
};
```

#### Slide Components

Each slide is a React component, not a factory function. The component receives `theme`, `base` (locale-resolved screenshot folder path), and `copy` (locale-resolved text). Screenshot filenames are hardcoded inside the component:

```tsx
// src/products/myapp/slides.tsx
export function MyAppSlide1({ theme: T, base, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} base={base}
      gradient={T.gradients.hero}
      orbs={[{ size: 1000, top: "-15%", left: "-25%", color: "rgba(107,142,104,0.18)" }]}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      screenshot="sc1.png" alt="Home"   // filename within `base` folder
      captionMt={0.04}
    />
  );
}
```

**Screenshot filename convention:** Use `sc1.png`, `sc2.png`, … (or `sc_ts1.png` etc. if the product has a prefix). Keep it consistent within a product. **Never rename files to match code** — if the naming breaks, raise an error and ask the user to clarify.

#### Products Array

```typescript
// src/products/index.ts
export const PRODUCTS: ProductConfig[] = [TINYSTEPS, FITFO, /* ... */];
```

Each product lives in `src/products/{id}/index.tsx` and `slides.tsx`.

#### State Management

```typescript
// In ScreenshotsPage (page.tsx):
const [productId, setProductId] = useState(PRODUCTS[0].id);
const [locale, setLocale] = useState(getProductLocales(PRODUCTS[0])[0].code);
const product = PRODUCTS.find(p => p.id === productId)!;
const T = product.theme;

// Resolve locale-specific slides and base path:
const activeSlides = product.slidesByLocale?.[locale] ?? product.slides;
const slides = activeDevice === "android" ? activeSlides.android : activeSlides.iphone;
const screenshotBase = product.screenshotBaseByLocale?.[locale] ?? product.screenshotBase;

// Pass to each slide component:
<slide.Component theme={T} base={screenshotBase} copy={slide.copyByLocale?.[locale] ?? slide.copy} />
```

#### Image Preloading (Product-Aware)

When the user switches products, re-preload all locale variants of that product's images:

```typescript
function getImagePathsForProduct(product: ProductConfig): string[] {
  const paths = new Set<string>([product.mockupPath ?? "/mockup.png", product.iconPath]);
  const bases = product.screenshotBaseByLocale
    ? Object.values(product.screenshotBaseByLocale)
    : [product.screenshotBase];
  for (const base of bases) {
    product.slides.iphone.forEach((_, i) => paths.add(`${base}/sc${i + 1}.png`));
    product.slides.android?.forEach((_, i) => paths.add(`${base}/sc${i + 1}.png`));
  }
  return [...paths];
}

const [ready, setReady] = useState(false);
useEffect(() => {
  setReady(false);
  preloadImages(getImagePathsForProduct(product)).then(() => setReady(true));
}, [productId]);
```

#### Export Filenames

In multi-product mode, prefix filenames with the product id:

```typescript
// Single-product: 01-hero-en-1320x2868.png
// Multi-product:  tinysteps-01-hero-en-1320x2868.png
const prefix = PRODUCTS.length > 1 ? `${product.id}-` : "";
a.download = `${prefix}${String(i + 1).padStart(2, "0")}-${slides[i].id}-${locale}-${size.w}x${size.h}.png`;
```

#### Adding a New Product to an Existing Generator

When the user asks to add a new app to an existing multi-product generator:

1. Create `src/products/{id}/index.tsx` and `slides.tsx`
2. Place image assets in `public/products/{id}/`
3. Define `ProductConfig` — copy an existing product as template
4. Add slide components in `slides.tsx` accepting `{ theme, base, copy }`
5. Add the new product to `src/products/index.ts` PRODUCTS array

If the existing generator is single-product and needs to become multi-product:

1. Move existing assets from `public/screenshots/` → `public/products/{existing-id}/screenshots/`
2. Move `public/icon.png` → `public/products/{existing-id}/icon.png`
3. Wrap existing config into a `ProductConfig` object
4. Create the `PRODUCTS` array with the existing product + the new one
5. Add the product selector to the toolbar

## Step 2: Set Up the Project

### Detect Package Manager

Check what's available, use this priority: **bun > pnpm > yarn > npm**

```bash
# Check in order
which bun && echo "use bun" || which pnpm && echo "use pnpm" || which yarn && echo "use yarn" || echo "use npm"
```

### Scaffold (if no existing Next.js project)

```bash
# With bun:
bunx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
bun add html-to-image

# With pnpm:
pnpx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
pnpm add html-to-image

# With yarn:
yarn create next-app . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
yarn add html-to-image

# With npm:
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
npm install html-to-image
```

### Copy the Phone Mockup

The skill includes a pre-measured iPhone mockup at `mockup.png` (co-located with this SKILL.md). Copy it to the project's `public/` directory. All other device frames (Android Phone, Android Tablets, iPad) are rendered with CSS - no additional mockup PNGs needed.

### File Structure

#### iPhone-only app (default - single product)

```
project/
├── public/
│   ├── mockup.png              # iPhone frame (included with skill)
│   ├── icon.png            # User's app icon
│   └── screenshots/
│       ├── en/
│       │   ├── home.png
│       │   ├── feature-1.png
│       │   └── ...
│       ├── de/
│       └── {locale}/
├── src/app/
│   ├── layout.tsx              # Font setup
│   └── page.tsx                # The screenshot generator (single file)
└── package.json
```

If iPad screenshots are localized too, mirror the same locale structure:

```
└── screenshots-ipad/
    ├── en/
    ├── de/
    └── {locale}/
```

Single-language apps can omit the locale folder entirely - paths become `screenshots/home.png`.

#### Multi-platform app (iOS + Android, single product)

When the user needs both Apple and Android screenshots, use a platform-based structure so every device's images are clearly separated:

```
└── screenshots/
    ├── apple/
    │   ├── iphone/
    │   │   ├── en/
    │   │   └── {locale}/
    │   └── ipad/
    │       ├── en/
    │       └── {locale}/
    └── android/
        ├── phone/
        │   ├── en/
        │   └── {locale}/
        ├── tablet-7/
        │   ├── portrait/
        │   │   └── {locale}/
        │   └── landscape/
        │       └── {locale}/
        └── tablet-10/
            ├── portrait/
            │   └── {locale}/
            └── landscape/
                └── {locale}/
```

#### Multi-product app

When the user has **multiple apps** in one generator, nest everything under `products/{product-id}/`:

```
project/
├── public/
│   ├── mockup.png              # Shared iPhone frame
│   └── products/
│       ├── tinysteps/
│       │   ├── icon.png
│       │   └── screenshots/
│       │       ├── en/         # locale-separated (screenshotBaseByLocale)
│       │       │   ├── sc1.png
│       │       │   └── sc2.png
│       │       └── vi/
│       │           ├── sc1.png
│       │           └── sc2.png
│       └── {product-id}/
│           ├── icon.png
│           └── screenshots/
│               └── sc1.png     # flat (no locale folders) when screenshots are shared
├── src/
│   ├── app/
│   │   └── page.tsx            # Main page
│   ├── products/
│   │   ├── index.ts            # PRODUCTS array
│   │   ├── tinysteps/
│   │   │   ├── index.tsx       # ProductConfig
│   │   │   └── slides.tsx      # Slide components
│   │   └── {product-id}/
│   │       ├── index.tsx
│   │       └── slides.tsx
│   ├── components/
│   │   ├── slide-layouts.tsx   # Shared layout primitives
│   │   └── ui.tsx              # PhoneFrame, Caption, etc.
│   └── lib/
│       ├── types.ts            # ProductConfig, SlideDef, etc.
│       ├── constants.ts        # Canvas sizes
│       ├── images.ts           # Preload cache
│       └── export.ts           # Export pipeline
└── package.json
```

**Locale-separated screenshots** (`screenshotBaseByLocale`): use when each locale has different screenshot files — different screens shown, different count, or different UI language baked into the screenshots. Configure in `ProductConfig`:

```typescript
screenshotBase: "/products/myapp/screenshots/en",   // default (first locale)
screenshotBaseByLocale: {
  en: "/products/myapp/screenshots/en",
  vi: "/products/myapp/screenshots/vi",
},
// If vi has different screens than en, also add slidesByLocale.vi
slidesByLocale: {
  vi: {
    iphone: [/* vi-specific SlideDef[] referencing sc1..scN in the vi folder */],
  },
},
```

**Only create subdirectories for devices the user actually has screenshots for.** An empty directory will cause broken image placeholders in the generator.

**Use the iPhone-only single-product structure by default.** Switch to multi-platform when targeting Android. Switch to multi-product when the user has multiple apps.

**The generator splits into multiple files** in the multi-product pattern: `page.tsx` for UI/state, `src/products/{id}/` for product configs and slide components, `src/lib/` for shared utilities, `src/components/` for layout primitives.

### Multi-language: Locale Select

Add a `LOCALES` array and a `<select>` locale picker to the toolbar. Every slide src uses a `base` variable - no hardcoded locale paths:

```tsx
const LOCALES = ["en", "de", "es", "tr"] as const; // use whatever langs were defined
type Locale = typeof LOCALES[number];

// In ScreenshotsPage:
const [locale, setLocale] = useState<Locale>("en");
// base is derived per-device from locale:
const base = (platform: string) => `/screenshots/${platform}/${locale}`;

// Toolbar:
<select value={locale} onChange={e => setLocale(e.target.value as Locale)}>
  {LOCALES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
</select>

// In every slide - unchanged between single and multi-language:
<Phone src={`${base("apple/iphone")}/home.png`} alt="Home" />
```

Use a `<select>` rather than inline tabs for locale - it scales cleanly to many languages without overflowing the toolbar.

### Theme Presets

```tsx
const THEMES = {
  "clean-light": { bg: "#F6F1EA", fg: "#171717", accent: "#5B7CFA", muted: "#6B7280" },
  "dark-bold":   { bg: "#0B1020", fg: "#F8FAFC", accent: "#8B5CF6", muted: "#94A3B8" },
  "warm-editorial": { bg: "#F7E8DA", fg: "#2B1D17", accent: "#D97706", muted: "#7C5A47" },
} as const;

type ThemeId = keyof typeof THEMES;
const [themeId, setThemeId] = useState<ThemeId>("clean-light");
const theme = THEMES[themeId];
```

Use theme tokens everywhere instead of hardcoded colors.

### Font Setup

```tsx
// src/app/layout.tsx
import { YourFont } from "next/font/google";
const font = YourFont({ subsets: ["latin"] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html><body className={font.className}>{children}</body></html>;
}
```

## Step 3: Plan the Slides

### Screenshot Framework (Narrative Arc)

Adapt this framework to the user's requested slide count. Not all slots are required - pick what fits:

| Slot | Purpose | Notes |
|------|---------|-------|
| #1 | **Hero / Main Benefit** | App icon + tagline + home screen. This is the ONLY one most people see. |
| #2 | **Differentiator** | What makes this app unique vs competitors |
| #3 | **Ecosystem** | Widgets, extensions, watch - beyond the main app. Skip if N/A. |
| #4+ | **Core Features** | One feature per slide, most important first |
| 2nd to last | **Trust Signal** | Identity/craft - "made for people who [X]" |
| Last | **More Features** | Pills listing extras + coming soon. Skip if few features. |

**Rules:**
- Each slide sells ONE idea. Never two features on one slide.
- Vary layouts across slides - never repeat the same template structure.
- Include 1-2 contrast slides (inverted bg) for visual rhythm.
- **Landscape tablets**: use caption-left + device-right layout. The wide canvas rewards asymmetric composition. Never try two devices side-by-side in landscape - there's not enough room.

## Step 4: Read Screenshots, Then Write Copy

**Before writing any copy, read every screenshot image.** Use the Read tool on each PNG to see what's actually shown. Copy must match the screen — mismatched copy (e.g. "Journal" copy on a Vaccinations screen) is worse than no copy at all.

For each locale separately:
1. Read all screenshot files (`sc1.png`, `sc2.png`, …) for that locale
2. Map each file to the feature it shows
3. Note that locales may show *different screens in different order* — do not assume locale B has the same screens as locale A
4. Only then write copy and assign slide components

**Screenshot file naming convention:** Files are named `sc1.png`, `sc2.png`, … (sequential integers). If the product uses a prefix (e.g. `sc_ts1.png`), keep that convention consistently. **Never rename screenshot files to match code** — if a filename breaks something, raise an error instead.

Get all headlines approved before building layouts. Bad copy ruins good design.

### The Iron Rules

1. **One idea per headline.** Never join two things with "and."
2. **Short, common words.** 1-2 syllables. No jargon unless it's domain-specific.
3. **3-5 words per line.** Must be readable at thumbnail size in the App Store.
4. **Line breaks are intentional.** Control where lines break with `<br />`.

### Three Approaches (pick one per slide)

| Type | What it does | Example |
|------|-------------|---------|
| **Paint a moment** | You picture yourself doing it | "Check your coffee without opening the app." |
| **State an outcome** | What your life looks like after | "A home for every coffee you buy." |
| **Kill a pain** | Name a problem and destroy it | "Never waste a great bag of coffee." |

### What NEVER Works

- **Feature lists as headlines**: "Log every item with tags, categories, and notes"
- **Two ideas joined by "and"**: "Track X and never miss Y"
- **Vague aspirational**: "Every item, tracked"
- **Marketing buzzwords**: "AI-powered tips" (unless it's actually AI)

### Bad-to-Better Headline Examples

| Weak | Better | Why it wins |
|------|--------|-------------|
| Track habits and stay motivated | Keep your streak alive | one idea, faster to parse |
| Organize tasks with AI summaries | Turn notes into next steps | outcome-first, less jargon |
| Save recipes with tags and favorites | Find dinner fast | sells the benefit, not the UI |
| Manage budgets and never miss payments | See where money goes | cleaner promise, no dual claim |

### Copy Process

1. Write 3 options per slide using the three approaches
2. Read each at arm's length - if you can't parse it in 1 second, it's too complex
3. Check: does each line have 3-5 words? If not, adjust line breaks
4. Present options to the user with reasoning for each

### Example Prompt Shapes

If the user gives a weak or underspecified request, reshape it internally into something like:

```text
Build App Store screenshots for my habit tracker.
The app helps people stay consistent with simple daily routines.
I want 6 slides, clean/minimal style, warm neutrals, and a calm premium feel.
```

```text
Generate App Store screenshots for my personal finance app.
The app's main strengths are fast expense capture, clear monthly trends, and shared budgets.
I want a sharp, modern style with high contrast and 7 slides.
```

```text
Create exportable App Store screenshots for my AI note-taking app.
The core value is turning messy voice notes into clean summaries and action items.
I want bold copy, dark backgrounds, and a polished tech-forward look.
```

The pattern is:

1. app category + core outcome
2. top features in priority order
3. desired slide count
4. style direction

### Localization Rules

- Do not literally translate headlines if the result becomes long or awkward - re-write for the target market.
- Re-check line breaks per locale; German, French, and Portuguese often need shorter claims.
- For RTL languages (`ar`, `he`, `fa`, `ur`), set `dir="rtl"` on the canvas and mirror asymmetric layouts intentionally.

### Reference Apps for Copy Style

- **Raycast** - specific, descriptive, one concrete value per slide
- **Turf** - ultra-simple action verbs, conversational
- **Mela / Notion** - warm, minimal, elegant

## Step 5: Build the Page

### Architecture

#### Single-product

```
page.tsx
├── Constants (canvas dimensions, export sizes, frame ratios)
├── Width formula functions (phoneW, tabletPW, tabletLW, ipadW)
├── LOCALES / RTL_LOCALES / THEMES / COPY_BY_LOCALE
├── Image preload cache (preloadAllImages + img() helper)
├── Device frame components:
│   ├── Phone          - iPhone (mockup.png + pre-measured overlay)
│   ├── AndroidPhone   - Android phone (CSS-only)
│   ├── AndroidTabletP - Android tablet portrait (CSS-only)
│   ├── AndroidTabletL - Android tablet landscape (CSS-only)
│   └── IPad           - iPad (CSS-only)
├── Caption component (label + headline, scales from canvasW)
├── Decorative components (blobs, glows - based on style direction)
├── Slide components (makeSlide1..N factories for portrait,
│                     makeTabLSlide1..N factories for landscape)
├── Slide registries (IPHONE_SLIDES, ANDROID_SLIDES, ANDROID_7P_SLIDES,
│   ANDROID_7L_SLIDES, ANDROID_10P_SLIDES, ANDROID_10L_SLIDES, IPAD_SLIDES)
├── ScreenshotPreview  - ResizeObserver scaling + hover export
└── ScreenshotsPage    - grid + toolbar + export logic
```

#### Multi-product (when PRODUCTS array has > 1 entry)

```
page.tsx
├── Constants (canvas dimensions, export sizes, frame ratios)
├── Width formula functions (phoneW, tabletPW, tabletLW, ipadW)
├── ProductConfig type + PRODUCTS array
│   └── Each product:
│       ├── id, name, iconPath, screenshotBase
│       ├── themes (product-specific ThemeTokens)
│       ├── slides (per-device slide registries)
│       ├── locales + copyByLocale
│       └── font (optional override)
├── Image preload cache (product-aware: re-preloads on product switch)
├── Device frame components (shared across all products):
│   ├── Phone, AndroidPhone, AndroidTabletP, AndroidTabletL, IPad
├── Caption component (uses current product's theme tokens)
├── Decorative components (parameterized by theme tokens)
├── Slide factory functions (shared - accept basePath + theme)
├── ScreenshotPreview  - ResizeObserver scaling + hover export
└── ScreenshotsPage    - product selector + grid + toolbar + export logic
```

**Key difference:** In multi-product mode, design tokens (`T`), slide registries, image paths, and locales are all derived from the currently selected `ProductConfig` instead of being top-level constants.

### Canvas Dimensions

Design at the **largest** required resolution for each device category. Smaller sizes are achieved by re-rendering at the target resolution on export.

```typescript
// Apple
const W      = 1320;  const H      = 2868; // iPhone (6.9" - largest required)
const IPAD_W = 2064;  const IPAD_H = 2752; // iPad 13" - largest required

// Android phone
const AW     = 1080;  const AH     = 1920; // Android phone

// Android tablet - portrait
const AT7P_W  = 1200; const AT7P_H  = 1920; // 7" portrait
const AT10P_W = 1600; const AT10P_H = 2560; // 10" portrait

// Android tablet - landscape
const AT7L_W  = 1920; const AT7L_H  = 1200; // 7" landscape
const AT10L_W = 2560; const AT10L_H = 1600; // 10" landscape

// Feature Graphic
const FGW = 1024; const FGH = 500;
```

### Export Sizes

#### iPhone (Apple required, portrait)

```typescript
const IPHONE_SIZES = [
  { label: '6.9"', w: 1320, h: 2868 },
  { label: '6.5"', w: 1284, h: 2778 },
  { label: '6.3"', w: 1206, h: 2622 },
  { label: '6.1"', w: 1125, h: 2436 },
] as const;
```

#### iPad (Apple required, portrait)

```typescript
const IPAD_SIZES = [
  { label: '13" iPad',     w: 2064, h: 2752 },
  { label: '12.9" iPad Pro', w: 2048, h: 2732 },
] as const;
```

#### Android (Google Play recommended)

```typescript
const ANDROID_SIZES    = [{ label: "Phone",           w: 1080, h: 1920 }] as const;
const ANDROID_7P_SIZES = [{ label: '7" Portrait',     w: 1200, h: 1920 }] as const;
const ANDROID_7L_SIZES = [{ label: '7" Landscape',    w: 1920, h: 1200 }] as const;
const ANDROID_10P_SIZES= [{ label: '10" Portrait',    w: 1600, h: 2560 }] as const;
const ANDROID_10L_SIZES= [{ label: '10" Landscape',   w: 2560, h: 1600 }] as const;
const FG_SIZES         = [{ label: "Feature Graphic", w: 1024, h:  500 }] as const;
```

### Device Type

```typescript
type Device = "iphone" | "android" | "android-7" | "android-10" | "ipad" | "feature-graphic";
type Orientation = "portrait" | "landscape";
```

### Frame Aspect Ratios

```typescript
const MK_RATIO   = 1022 / 2082; // iPhone mockup (width/height)
const TAB_P_RATIO = 0.667;       // tablet portrait frame (5:8 screen)
const TAB_L_RATIO = 1.5;         // tablet landscape frame (8:5 screen)
const IPAD_RATIO  = 0.770;       // iPad frame (770/1000)
```

### Width Formula Functions

These functions determine how wide to render a device frame relative to the canvas. They auto-scale so the device fills the canvas proportionally regardless of canvas aspect ratio:

```typescript
type WidthFn = (cW: number, cH: number) => number;

// Returns a fraction of canvas width (0–1)
function phoneW(cW: number, cH: number, clamp = 0.84) {
  return Math.min(clamp, 0.72 * (cH / cW) * MK_RATIO);
}
function phoneW2(cW: number, cH: number) { return phoneW(cW, cH, 0.66); } // smaller, for two-phone slides

function tabletPW(cW: number, cH: number, clamp = 0.80) {
  return Math.min(clamp, 0.72 * (cH / cW) * TAB_P_RATIO);
}
function tabletPW2(cW: number, cH: number) { return tabletPW(cW, cH, 0.64); }

function tabletLW(cW: number, cH: number, clamp = 0.62) {
  return Math.min(clamp, 0.75 * (cH / cW) * TAB_L_RATIO);
}

function ipadW(cW: number, cH: number, clamp = 0.75) {
  return Math.min(clamp, 0.72 * (cH / cW) * IPAD_RATIO);
}
function ipadW2(cW: number, cH: number) { return ipadW(cW, cH, 0.60); }
```

Usage: `width: \`${phoneW(cW, cH) * 100}%\``

### Rendering Strategy

Each screenshot is designed at full resolution. Two copies exist:

1. **Preview**: CSS `transform: scale()` via `ResizeObserver` to fit a grid card
2. **Export**: Offscreen at `position: absolute; left: -9999px` at true resolution

**Critical:** Wrap the entire page in `overflowX: "hidden"` to prevent offscreen export elements from causing horizontal scroll:

```tsx
<div style={{ minHeight: "100vh", background: "#f3f4f6", position: "relative", overflowX: "hidden" }}>
```

### Device Frame Components

#### iPhone (PNG mockup)

The included `mockup.png` has these pre-measured values:

```typescript
const MK_W = 1022; const MK_H = 2082;
const SC_L  = (52   / MK_W) * 100;  // screen left %
const SC_T  = (46   / MK_H) * 100;  // screen top %
const SC_W  = (918  / MK_W) * 100;  // screen width %
const SC_H  = (1990 / MK_H) * 100;  // screen height %
const SC_RX = (126  / 918)  * 100;  // border-radius x %
const SC_RY = (126  / 1990) * 100;  // border-radius y %
```

```tsx
function Phone({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", aspectRatio: `${MK_W}/${MK_H}`, ...style }}>
      <img src={img("/mockup.png")} alt="" style={{ display: "block", width: "100%", height: "100%" }} draggable={false} />
      <div style={{
        position: "absolute", zIndex: 10, overflow: "hidden",
        left: `${SC_L}%`, top: `${SC_T}%`, width: `${SC_W}%`, height: `${SC_H}%`,
        borderRadius: `${SC_RX}% / ${SC_RY}%`,
      }}>
        <img src={src} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} draggable={false} />
      </div>
    </div>
  );
}
```

#### Android Phone (CSS-only)

```tsx
function AndroidPhone({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", aspectRatio: "9/19.5", ...style }}>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: "8% / 4%",
        background: "linear-gradient(160deg, #2a2a2e 0%, #18181b 100%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.55)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Punch-hole camera */}
        <div style={{
          position: "absolute", top: "1.5%", left: "50%",
          transform: "translateX(-50%)", width: "3%", height: "1.4%",
          borderRadius: "50%", background: "#0d0d0f",
          border: "1px solid rgba(255,255,255,0.06)", zIndex: 20,
        }} />
        {/* Screen */}
        <div style={{
          position: "absolute", left: "3.5%", top: "2%",
          width: "93%", height: "96%",
          borderRadius: "5.5% / 2.6%", overflow: "hidden", background: "#000",
        }}>
          <img src={src} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} draggable={false} />
        </div>
      </div>
    </div>
  );
}
```

#### Android Tablet - Portrait (CSS-only)

```tsx
function AndroidTabletP({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", aspectRatio: "5/8", ...style }}>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: "4.5% / 2.8%",
        background: "linear-gradient(160deg, #2a2a2e 0%, #18181b 100%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 48px rgba(0,0,0,0.6)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Camera dot */}
        <div style={{
          position: "absolute", top: "1.2%", left: "50%",
          transform: "translateX(-50%)", width: "1.4%", height: "0.88%",
          borderRadius: "50%", background: "#0d0d0f",
          border: "1px solid rgba(255,255,255,0.07)", zIndex: 20,
        }} />
        {/* Bezel highlight */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "4.5% / 2.8%",
          border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none", zIndex: 15,
        }} />
        {/* Screen */}
        <div style={{
          position: "absolute", left: "3.5%", top: "2.2%",
          width: "93%", height: "95.6%",
          borderRadius: "2.5% / 1.6%", overflow: "hidden", background: "#000",
        }}>
          <img src={src} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} draggable={false} />
        </div>
      </div>
    </div>
  );
}
```

#### Android Tablet - Landscape (CSS-only)

Same as portrait but with a rotated aspect ratio and camera on the left side:

```tsx
function AndroidTabletL({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", aspectRatio: "8/5", ...style }}>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: "2.8% / 4.5%",
        background: "linear-gradient(160deg, #2a2a2e 0%, #18181b 100%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 48px rgba(0,0,0,0.6)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Camera dot - left side in landscape */}
        <div style={{
          position: "absolute", left: "1.2%", top: "50%",
          transform: "translateY(-50%)", width: "0.88%", height: "1.4%",
          borderRadius: "50%", background: "#0d0d0f",
          border: "1px solid rgba(255,255,255,0.07)", zIndex: 20,
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: "2.8% / 4.5%",
          border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none", zIndex: 15,
        }} />
        {/* Screen */}
        <div style={{
          position: "absolute", left: "2.2%", top: "3.5%",
          width: "95.6%", height: "93%",
          borderRadius: "1.6% / 2.5%", overflow: "hidden", background: "#000",
        }}>
          <img src={src} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} draggable={false} />
        </div>
      </div>
    </div>
  );
}
```

#### iPad (CSS-only)

**Critical dimension:** Frame aspect ratio must be `770/1000` so the inner screen (92% × 94.4%) matches the 3:4 aspect ratio of iPad screenshots.

```tsx
function IPad({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", aspectRatio: "770/1000", ...style }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: "5% / 3.6%",
        background: "linear-gradient(180deg, #2C2C2E 0%, #1C1C1E 100%)",
        position: "relative", overflow: "hidden",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.6)",
      }}>
        <div style={{
          position: "absolute", top: "1.2%", left: "50%",
          transform: "translateX(-50%)", width: "0.9%", height: "0.65%",
          borderRadius: "50%", background: "#111113",
          border: "1px solid rgba(255,255,255,0.08)", zIndex: 20,
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: "5% / 3.6%",
          border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none", zIndex: 15,
        }} />
        <div style={{
          position: "absolute", left: "4%", top: "2.8%",
          width: "92%", height: "94.4%",
          borderRadius: "2.2% / 1.6%", overflow: "hidden", background: "#000",
        }}>
          <img src={src} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} draggable={false} />
        </div>
      </div>
    </div>
  );
}
```

### Slide Factory Pattern

Instead of writing separate slide components for every device, use factory functions. Each factory accepts a device component, its width function, the screenshot base path, and the frame ratio:

```typescript
type SlideProps = { cW: number; cH: number; locale: string };
type SlideDef   = { id: string; component: (p: SlideProps) => JSX.Element };
type PhoneComp  = (p: { src: string; alt: string; style?: React.CSSProperties }) => JSX.Element;

function makeSlide1(
  PhoneComp: PhoneComp,
  widthFn: WidthFn,
  basePath: string,
  _frameRatio: number,
): SlideDef {
  return {
    id: "hero",
    component: ({ cW, cH }) => {
      const fw = widthFn(cW, cH) * 100;
      return (
        <div style={{ width: "100%", height: "100%", position: "relative", background: "...", overflow: "hidden" }}>
          <Caption cW={cW} label="YOUR APP" headline={<>"Sell one<br />idea here."</>} />
          <PhoneComp
            src={img(`/${basePath}/home.png`)}
            alt="Home"
            style={{
              position: "absolute", bottom: 0,
              width: `${fw}%`,
              left: "50%", transform: `translateX(-50%) translateY(13%)`,
            }}
          />
        </div>
      );
    },
  };
}
```

Build `makeSlide2..N` with the same signature. Then build registries:

```typescript
const mkTabP = (base: string) => [
  makeSlide1(AndroidTabletP, tabletPW, base, TAB_P_RATIO),
  makeSlide2(AndroidTabletP, tabletPW, base, TAB_P_RATIO),
  // ...
];
const mkTabL = (base: string) => [
  makeTabLSlide1(AndroidTabletL, tabletLW, base),
  makeTabLSlide2(AndroidTabletL, tabletLW, base),
  // ...
];

const IPHONE_SLIDES      = [makeSlide1(Phone, phoneW, "screenshots/apple/iphone", MK_RATIO), ...];
const ANDROID_SLIDES     = [makeSlide1(AndroidPhone, phoneW, "screenshots/android/phone", MK_RATIO), ...];
const ANDROID_7P_SLIDES  = mkTabP("screenshots/android/tablet-7/portrait");
const ANDROID_7L_SLIDES  = mkTabL("screenshots/android/tablet-7/landscape");
const ANDROID_10P_SLIDES = mkTabP("screenshots/android/tablet-10/portrait");
const ANDROID_10L_SLIDES = mkTabL("screenshots/android/tablet-10/landscape");
const IPAD_SLIDES        = [makeSlide1(IPad, ipadW, "screenshots/apple/ipad", IPAD_RATIO), ...];
```

### Landscape Slide Layout

Landscape tablet canvases are wide (e.g. 2560×1600). Use a **caption-left + device-right** layout. Never try two devices side-by-side - there isn't enough room.

```tsx
function makeTabLSlide1(PhoneComp: PhoneComp, widthFn: WidthFn, basePath: string): SlideDef {
  return {
    id: "hero-landscape",
    component: ({ cW, cH }) => {
      const fw = widthFn(cW, cH) * 100;
      return (
        <div style={{ width: "100%", height: "100%", position: "relative", background: "...", overflow: "hidden" }}>
          {/* Caption - left 34% of canvas */}
          <div style={{ position: "absolute", top: "50%", left: "5%", width: "34%", transform: "translateY(-50%)" }}>
            <Caption cW={cW} label="FEATURE" headline={<>"One idea<br />per slide."</>} />
          </div>
          {/* Device - right side */}
          <PhoneComp
            src={img(`/${basePath}/home.png`)}
            alt="Home"
            style={{
              position: "absolute",
              right: "-3%",
              top: "50%",
              width: `${fw}%`,
              transform: "translateY(-50%)",
            }}
          />
        </div>
      );
    },
  };
}
```

### Feature Graphic Component

The Feature Graphic is a **1024×500 landscape banner** shown at the top of the Google Play store listing. It has no device frame - it's a pure graphic with the app name, tagline, icon, and decorative elements.

```tsx
function FeatureGraphicSlide({ cW, cH }: { cW: number; cH: number }) {
  return (
    <div style={{
      width: "100%", height: "100%", position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: `0 ${cW * 0.06}px`,
    }}>
      {/* Left: app icon + name + tagline */}
      <div style={{ display: "flex", alignItems: "center", gap: cW * 0.03 }}>
        <img src={img("/icon.png")} alt="App Icon"
          style={{ width: cW * 0.12, height: cW * 0.12, borderRadius: cW * 0.022 }}
          draggable={false} />
        <div>
          <div style={{ fontSize: cW * 0.05, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>AppName</div>
          <div style={{ fontSize: cW * 0.025, color: "rgba(255,255,255,0.7)", marginTop: cW * 0.008 }}>Your tagline here.</div>
        </div>
      </div>
      {/* Right: decorative / supporting visual */}
    </div>
  );
}
```

### Device Resolution Dispatch

In the main component, derive canvas dimensions, export sizes, and slide registry from the current device + orientation state:

```typescript
const { cW, cH, currentSizes, slides } = (() => {
  if (device === "android-7") {
    return orientation === "landscape"
      ? { cW: AT7L_W,  cH: AT7L_H,  currentSizes: ANDROID_7L_SIZES,  slides: ANDROID_7L_SLIDES }
      : { cW: AT7P_W,  cH: AT7P_H,  currentSizes: ANDROID_7P_SIZES,  slides: ANDROID_7P_SLIDES };
  }
  if (device === "android-10") {
    return orientation === "landscape"
      ? { cW: AT10L_W, cH: AT10L_H, currentSizes: ANDROID_10L_SIZES, slides: ANDROID_10L_SLIDES }
      : { cW: AT10P_W, cH: AT10P_H, currentSizes: ANDROID_10P_SIZES, slides: ANDROID_10P_SLIDES };
  }
  if (device === "android")         return { cW: AW,     cH: AH,     currentSizes: ANDROID_SIZES,   slides: ANDROID_SLIDES };
  if (device === "ipad")            return { cW: IPAD_W, cH: IPAD_H, currentSizes: IPAD_SIZES,      slides: IPAD_SLIDES };
  if (device === "feature-graphic") return { cW: FGW,    cH: FGH,    currentSizes: FG_SIZES,        slides: [FG_SLIDE] };
  return { cW: W, cH: H, currentSizes: IPHONE_SIZES, slides: IPHONE_SLIDES };
})();
```

### Toolbar Layout

The toolbar has two sections: a **scrollable controls area** (left, `flex: 1`) and a **fixed export button** (right, always visible). Never wrap them in a single scrollable row - the button must always be reachable.

In multi-product mode, add a **product selector** as the first control in the toolbar (before locale and device selectors). The toolbar title updates to show the current product name.

```tsx
{/* Toolbar */}
<div style={{ position: "sticky", top: 0, zIndex: 50, background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center" }}>

  {/* Scrollable controls */}
  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", overflowX: "auto", minWidth: 0 }}>

    {/* Product selector - only shown when PRODUCTS.length > 1 */}
    {PRODUCTS.length > 1 && (
      <select
        value={productId}
        onChange={e => { setProductId(e.target.value); setSizeIdx(0); }}
        style={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 10px", fontWeight: 700 }}>
        {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    )}

    <span style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
      {PRODUCTS.length > 1 ? `${product.name} · Screenshots` : "My App · Screenshots"}
    </span>

    {/* Locale */}
    <select value={locale} onChange={e => setLocale(e.target.value as Locale)} style={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 10px" }}>
      {LOCALES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
    </select>

    {/* Device tabs */}
    <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 8, padding: 4, flexShrink: 0 }}>
      {(["iphone", "android", "ipad", "feature-graphic"] as Device[]).map(d => (
        <button key={d} onClick={() => { setDevice(d); setSizeIdx(0); }}
          style={{ padding: "4px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: device === d ? "white" : "transparent", color: device === d ? "#2563eb" : "#6b7280" }}>
          {d === "iphone" ? "iPhone" : d === "android" ? "Android" : d === "ipad" ? "iPad" : "Feature Graphic"}
        </button>
      ))}
      {/* Android tablet dropdown - inside the device tab group */}
      <select
        value={isTablet ? device : ""}
        onChange={e => { if (e.target.value) { setDevice(e.target.value as Device); setSizeIdx(0); } }}
        style={{ fontSize: 12, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", background: isTablet ? "white" : "transparent", color: isTablet ? "#2563eb" : "#6b7280" }}>
        <option value="" disabled>Android Tab.</option>
        <option value="android-7">Android 7"</option>
        <option value="android-10">Android 10"</option>
      </select>
    </div>

    {/* Orientation - tablets only */}
    {isTablet && (
      <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 8, padding: 4, flexShrink: 0 }}>
        {(["portrait", "landscape"] as Orientation[]).map(o => (
          <button key={o} onClick={() => { setOrientation(o); setSizeIdx(0); }}
            style={{ padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: orientation === o ? "white" : "transparent", color: orientation === o ? "#2563eb" : "#6b7280" }}>
            {o === "portrait" ? "Portrait ↕" : "Landscape ↔"}
          </button>
        ))}
      </div>
    )}

    {/* Export size */}
    {device !== "feature-graphic" && (
      <select value={sizeIdx} onChange={e => setSizeIdx(Number(e.target.value))} style={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px" }}>
        {currentSizes.map((s, i) => <option key={i} value={i}>{s.label} - {s.w}×{s.h}</option>)}
      </select>
    )}
  </div>

  {/* Export button - always at right edge, never scrolls away */}
  <div style={{ flexShrink: 0, padding: "10px 16px", borderLeft: "1px solid #e5e7eb" }}>
    <button onClick={exportAll} disabled={!!exporting}
      style={{ padding: "7px 20px", background: exporting ? "#93c5fd" : "#2563eb", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: exporting ? "default" : "pointer", whiteSpace: "nowrap" }}>
      {exporting ? `Exporting… ${exporting}` : "Export All"}
    </button>
  </div>
</div>
```

`isTablet` helper:

```typescript
const isTablet = device === "android-7" || device === "android-10";
```

### Typography (Resolution-Independent)

All sizing relative to canvas width `cW`:

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Category label | `cW * 0.028` | 600 | default |
| Headline | `cW * 0.09` to `cW * 0.1` | 700 | 1.0 |
| Hero headline | `cW * 0.1` | 700 | 0.92 |
| Feature Graphic name | `cW * 0.05` | 800 | 1.1 |

### Phone Placement Patterns (Portrait)

Vary across slides - NEVER use the same layout twice in a row:

**Centered device** (hero, single-feature):
```
bottom: 0, width: "82-86%" (phone) / "70-75%" (tablet) / "65-70%" (iPad)
left: "50%", transform: "translateX(-50%) translateY(13%)"
```

**Two devices layered** (comparison):
```
Back:  left: "-8%",  width: "65%", rotate(-4deg), opacity: 0.55
Front: right: "-4%", width: "82%", translateY(10%)
```

**Landscape tablet** (always caption-left + device-right):
```
Caption: position: absolute, top: 50%, left: 5%, width: 34%, transform: translateY(-50%)
Device:  position: absolute, right: "-3%", top: 50%, width: fw%, transform: translateY(-50%)
```

### "More Features" Slide (Optional)

Dark/contrast background with app icon, headline ("And so much more."), and feature pills. Can include a "Coming Soon" section with dimmer pills. Works identically across all device types.

## Step 6: Export

### Why html-to-image, NOT html2canvas

`html2canvas` breaks on CSS filters, gradients, drop-shadow, backdrop-filter, and complex clipping. `html-to-image` uses native browser SVG serialization - handles all CSS faithfully.

### Pre-load Images as Data URIs (CRITICAL)

`html-to-image` clones the DOM into an SVG `<foreignObject>`. During cloning it re-fetches every `<img>` src. These re-fetches are non-deterministic - some hit the browser cache, some silently fail, causing transparent/black rectangles in exports.

**Fix:** Convert all images to base64 data URIs at page load. Use those as `src` everywhere.

```typescript
const IMAGE_PATHS = [
  "/mockup.png",
  "/icon.png",
  "/screenshots/apple/iphone/en/home.png",
  // ... all images used in any slide across all devices/locales
];

const imageCache: Record<string, string> = {};

async function preloadAllImages() {
  await Promise.all(IMAGE_PATHS.map(async (path) => {
    const resp = await fetch(path);
    const blob = await resp.blob();
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    imageCache[path] = dataUrl;
  }));
}

// Use in every <img> src:
function img(path: string): string {
  return imageCache[path] || path;
}
```

Gate rendering on preload completion:

```typescript
const [ready, setReady] = useState(false);
useEffect(() => { preloadAllImages().then(() => setReady(true)); }, []);
if (!ready) return <p>Loading images…</p>;
```

### Export Implementation

```typescript
import { toPng } from "html-to-image";

async function captureSlide(el: HTMLElement, w: number, h: number): Promise<string> {
  el.style.left = "0px";
  el.style.opacity = "1";
  el.style.zIndex = "-1";

  const opts = { width: w, height: h, pixelRatio: 1, cacheBust: true };

  // CRITICAL: Double-call - first warms up fonts/images, second produces clean output
  await toPng(el, opts);
  const dataUrl = await toPng(el, opts);

  el.style.left = "-9999px";
  el.style.opacity = "";
  el.style.zIndex = "";
  return dataUrl;
}
```

### Export All (Bulk)

```typescript
async function exportAll() {
  if (device === "feature-graphic") { await exportFG(); return; }
  const size = currentSizes[sizeIdx];
  for (let i = 0; i < slides.length; i++) {
    setExporting(`${i + 1}/${slides.length}`);
    const el = exportRefs.current[i];
    if (!el) continue;
    const dataUrl = await captureSlide(el, size.w, size.h);
    const a = document.createElement("a");
    a.href = dataUrl;
    // Multi-product: prefix with product id when multiple products exist
    const prefix = PRODUCTS.length > 1 ? `${product.id}-` : "";
    a.download = `${prefix}${String(i + 1).padStart(2, "0")}-${slides[i].id}-${locale}-${size.w}x${size.h}.png`;
    a.click();
    await new Promise(r => setTimeout(r, 300));
  }
  setExporting(null);
}
```

### Key Export Rules

- **Double-call trick**: First `toPng()` loads fonts/images lazily. Second produces clean output. Without this, exports are blank.
- **On-screen for capture**: Temporarily move to `left: 0` before `toPng` - offscreen elements don't render.
- **Offscreen container**: Use `position: absolute; left: -9999px` (not `fixed`) inside a `overflowX: hidden` wrapper.
- **300ms delay** between sequential exports - prevents browser throttling.
- **Numbered filenames**: Zero-padded prefix so files sort correctly: `01-hero-en-1320x2868.png`. In multi-product mode, product id is prepended: `hone-01-hero-en-1320x2868.png`.
- **Pre-loaded data URIs**: Always use `img()` helper. Never use raw file paths in slide components.
- **RGB source images**: Ensure source screenshots are RGB (not RGBA). RGBA PNGs can produce transparent/black regions in exports.

## Step 7: Final QA Gate

### Message Quality
- **One idea per slide**: if a headline sells two ideas, split it or simplify it
- **First slide is strongest**: the hero slide must communicate the main benefit immediately
- **Readable in one second**: if you cannot parse it instantly at arm's length, rewrite it

### Visual Quality
- **No repeated layouts in sequence**: adjacent slides should not feel templated
- **Landscape slides feel designed**: caption-left + device-right with intentional negative space
- **Decorative elements support the story**: add energy without covering app UI
- **Visual rhythm exists**: at least one contrast slide when the set is long enough

### Export Quality
- **No clipped text or assets** after scaling to export size
- **Screenshots correctly aligned** inside every device frame
- **Filenames sort correctly** with zero-padded numeric prefixes
- **Feature Graphic exports** cleanly at 1024×500 (no device frame)
- **Theme tokens are applied consistently** across all slides in the same preset
- **Localized copy still fits** after translation, especially on long-word languages
- **RTL slides feel designed, not just flipped**

### Hand-off Behavior

When you present the finished work:

1. briefly explain the narrative arc across the slides
2. mention any slides that intentionally use contrast or different layout treatment
3. call out any assumptions you made about brand tone, copy, or missing assets

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| All slides look the same | Vary device position (center, left, right, two-device, no-device) |
| Landscape slides look broken | Use caption-left + single device-right - never two devices side-by-side |
| Copy is too complex | "One second at arm's length" test |
| Floating elements block the phone | Move off-screen edges or above the device |
| Plain white/black background | Use gradients - even subtle ones add depth |
| Headlines use "and" | Split into two slides or pick one idea |
| Export is blank | Use double-call trick; move element on-screen before capture |
| Phone screens black in export | Images not inlined - use `preloadAllImages()` + `img()` helper |
| Some slides missing images | Non-deterministic fetch race - same fix as above |
| Export button scrolls off toolbar | Split toolbar: scrollable controls left (`flex: 1`), fixed button right (`flex-shrink: 0`) |
| Page has horizontal scroll | Add `overflowX: "hidden"` on the outermost wrapper div |
| Screenshots rejected by App Store | Source PNGs have alpha channel - flatten to RGB (composite onto black) |
| Android tablet orientation ignored | Derive `cW/cH/slides` from `device + orientation` combo, not just `device` |
| Product assets leak into wrong product | Derive all paths from `product.screenshotBase` and `product.iconPath` - never hardcode paths |
| Product switch shows stale images | Re-run `preloadImages()` in a `useEffect` keyed on `productId` - gate rendering on `ready` state |
| Single-product projects break after update | `PRODUCTS.length === 1` hides the product selector and skips filename prefix - fully backward compatible |
| Copy doesn't match the screenshot shown | Always read every screenshot PNG with the Read tool before writing any copy — locales often show different screens in different order |
| Locale B slides show wrong screens | Each locale's screenshots may differ; use `slidesByLocale` with locale-specific components when screens differ between locales |
| Renamed screenshot files to match code | Never rename user's files — raise an error and ask for clarification instead |
| All locales share one screenshot folder | Use `screenshotBaseByLocale` when each locale has its own screenshot files |
| Locale switch doesn't update screenshots | Pass `base={screenshotBase}` (locale-resolved) to slide components, not `product.screenshotBase` directly |
