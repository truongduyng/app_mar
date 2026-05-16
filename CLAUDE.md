# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server on port 3000
bun run build    # Production build
bun start        # Start production server

# Database
DATABASE_URL=... bun run src/db/seed.ts   # Seed all product data
DATABASE_URL=... bunx drizzle-kit push     # Push schema changes
DATABASE_URL=... bunx drizzle-kit generate # Generate migration SQL
```

No test or lint scripts are configured.

## What This Is

A Next.js app that generates App Store / Google Play screenshots, feature graphics, and social OG images for multiple mobile apps. It renders React components into the DOM, captures them as PNGs via `html-to-image`, resizes to platform-correct dimensions, and bundles into a ZIP.

## Architecture

### Product Data

Product data is stored in Postgres and loaded via `getSerializableProducts()` in `src/db/queries.ts`. The client hydrates the JSON-safe rows into `ProductConfig` (`src/lib/types.ts`) values with:
- `theme` — brand colors and gradients (`ThemeTokens`)
- `locales` — supported language codes; the toolbar locale picker appears automatically
- `slides.iphone` / `slides.android` — arrays of `SlideDef` (React component + per-locale copy)
- `slidesByLocale` — optional: entirely different slide sets per locale
- `featureGraphic`, `socialOg`, `ctaImage` — additional asset configurations
- `metadata` / `metadataByLocale` — App Store / Play Store listing text per locale

`src/db/seed.ts` populates product data for local/dev databases.

### Slide Styles

Slides use generic style keys, not product-specific React components. Common layout primitives are in `src/components/slide-layouts.tsx` (`CenteredSlide`, `SideSlide`, decorations). Device frame components (`Phone`, `AndroidPhone`, `Caption`, `OrbGlow`) are in `src/components/ui.tsx`.

**Style registry** — `src/components/component-registry.ts` exports generic styles such as `GenericCenteredSlide`, `GenericSideSlide`, `GenericFeatureListSlide`, and Android variants. DB rows still store the value in `product_slides.component_key` for compatibility, but it now means "style key". `hydrateProducts()` resolves style keys through `COMPONENT_REGISTRY` and falls back to a generic centered style when needed.

**Rich text** — `SlideCopy.headline` and `SlideCopy.subtitle` are `React.ReactNode` at runtime but stored in the DB as `RichTextSegment[]` (serializable JSON). Three segment types: `{ t: "text", v }`, `{ t: "br" }`, `{ t: "accent", v }`. Helpers `txt()`, `br()`, `acc()` from `src/lib/rich-text.ts` build segment arrays in the seed. The in-browser copy editor uses `**bold**` / `\n` markup that round-trips through `segmentsToMarkup` / `markupToSegments`.

### Export Pipeline

`src/lib/export.ts` drives all exports. Two critical techniques:
1. **Double-call `toPng()`** — first call warms up fonts/images; second call produces the clean PNG
2. **Temporary repositioning** — elements are moved from `left: -9999px` to `left: 0px` for capture, then hidden again; `html-to-image` requires the element to be on-screen

`exportSingle` — captures one DOM element → PNG, optionally resizes to a target export size.
`exportAllToZip` — iterates slides × export sizes, builds a ZIP with DEFLATE compression level 6, calls `onProgress` for UI feedback.

Canvas dimensions for all asset types are in `src/lib/constants.ts`:
- iPhone canvas: 1320×2868; 4 export sizes (6.9″ down to 6.1″)
- Android phone: 1080×1920
- Feature Graphic: 1024×500
- Social OG: 1200×630

### Image Preloading

All image assets **must** be preloaded as base64 data URIs before rendering. `src/lib/images.ts` provides:
- `preloadImages(paths[])` — converts all images to data URIs and caches them
- `img(path)` — returns the cached data URI (or the original path as fallback)
- `getImagePathsForProduct(product)` — scans the full `ProductConfig` to extract every referenced path

`page.tsx` gates rendering on a `ready` state and re-preloads on product/locale switch. Skipping preload causes `html-to-image` to produce blank images due to fetch race conditions during DOM cloning.

### Database Layer

Products, slides, copy, metadata, and all asset configurations live in Postgres, managed via Drizzle ORM. Key tables in `src/db/schema.ts`:

- `products` — id, name, iconPath, bundleId (Apple), packageName (Google)
- `slide_groups` — named groups per product (`default` or a locale code for `slidesByLocale`)
- `product_slides` — one row per slide slot, holds `componentKey` / `component_key` as the generic slide style key and `imagePath` (uploaded screenshot)
- `slide_copy` — per (product, slideKey, locale): label + headline/subtitle as `RichTextSegment[]`
- `product_metadata`, `product_feature_graphics`, `product_social_ogs`, `product_cta_images` — store-listing content per locale

`src/db/queries.ts::getSerializableProducts()` fetches all tables in parallel and assembles `SerializableProductConfig[]` — a JSON-safe version of `ProductConfig` (React nodes replaced by `RichTextSegment[]`). `page.tsx` fetches this server-side and passes it to `hydrateProducts()` before rendering.

### API Routes

- `POST /api/screenshots/upload` — receives a screenshot image + `slideId` + `productId`, saves to `public/uploads/screenshots/<productId>/`, updates `product_slides.image_path` in DB
- `POST /api/slide-copy` — saves edited copy segments for a slide/locale
- `POST /api/metadata` — saves product metadata per locale
- `POST /api/publish/apple` — pushes metadata to App Store Connect via JWT (requires `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_PRIVATE_KEY` env vars and `bundleId` on the product)
- `POST /api/publish/google` — pushes metadata to Google Play (requires `GOOGLE_SERVICE_ACCOUNT_JSON` env var and `packageName` on the product)
- `POST /api/generate-locale` — AI-translates copy to a new locale via Together AI (`TOGETHER_API_KEY`)

### Main Page

`src/app/page.tsx` is a single large client component managing: selected product, locale, section (which asset type), metadata edits, and export progress. It renders section components from `src/components/sections/` and delegates export to `src/lib/export.ts`.

## Adding a New Product

1. Add product rows to `src/db/seed.ts` (products, slide_groups, product_slides, slide_copy, product_metadata, etc.)
2. Use one of the generic style keys in `product_slides.componentKey`.
3. Run `DATABASE_URL=... bun run src/db/seed.ts` to populate the DB.
4. Place icon and any initial screenshot images in `public/products/<id>/`; screenshots can also be uploaded via the UI.

Adding a new slide style only requires adding a generic style component and option in `src/components/component-registry.ts`.

## Skills

Before starting any task, check `.claude/skills/` for relevant skill files and read them. The `.claude/skills/app-store-screenshots/SKILL.md` file is a comprehensive reference for this codebase's patterns.
