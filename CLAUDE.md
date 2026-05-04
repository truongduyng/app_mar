# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server on port 3000
bun run build    # Production build
bun start        # Start production server
```

No test or lint scripts are configured.

## What This Is

A Next.js app that generates App Store / Google Play screenshots, feature graphics, and social OG images for multiple mobile apps. It renders React components into the DOM, captures them as PNGs via `html-to-image`, resizes to platform-correct dimensions, and bundles into a ZIP.

## Architecture

### Product Registry

`src/products/index.ts` exports a `PRODUCTS` array. Each entry is a `ProductConfig` (`src/lib/types.ts`) with:
- `theme` — brand colors and gradients (`ThemeTokens`)
- `locales` — supported language codes; the toolbar locale picker appears automatically
- `slides.iphone` / `slides.android` — arrays of `SlideDef` (React component + per-locale copy)
- `slidesByLocale` — optional: entirely different slide sets per locale
- `screenshotBaseByLocale` — optional: different screenshot folder paths per locale
- `featureGraphic`, `socialOg`, `ctaImage` — additional asset configurations
- `metadata` / `metadataByLocale` — App Store / Play Store listing text per locale

The product selector toolbar only renders when `PRODUCTS.length > 1`.

### Slide Components

Each product lives in `src/products/<product-id>/`:
- `index.tsx` — the `ProductConfig` object
- `theme.ts` — `ThemeTokens` (8 color/gradient tokens)
- `metadata.ts` — `MetadataConfig` keyed by locale
- `slides.tsx` — React components for each slide
- `copy.tsx` — optional centralized copy mapping (used by some products)

Slide components receive `{ theme, base, copy }` props. `base` is the screenshot folder path (locale-resolved). Screenshot filenames (e.g. `sc1.png`) are hardcoded inside the component. Common layout primitives are in `src/components/slide-layouts.tsx` (`CenteredSlide`, `SideSlide`, decorations). Device frame components (`Phone`, `AndroidPhone`, `Caption`, `OrbGlow`) are in `src/components/ui.tsx`.

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

### Main Page

`src/app/page.tsx` is a single large client component managing: selected product, locale, section (which asset type), metadata edits, and export progress. It renders section components from `src/components/sections/` and delegates export to `src/lib/export.ts`.

## Adding a New Product

1. Create `src/products/<id>/index.tsx`, `theme.ts`, `metadata.ts`, `slides.tsx`
2. Copy an existing product as template (e.g. `tinysteps`)
3. Add slide components accepting `{ theme, base, copy }` — use `CenteredSlide` / `SideSlide` from `slide-layouts.tsx`
4. Place image assets in `public/products/<id>/`
5. Register in `src/products/index.ts` by appending to `PRODUCTS`

## Skills

Before starting any task, check `.claude/skills/` for relevant skill files and read them. The `.claude/skills/app-store-screenshots/SKILL.md` file is a comprehensive reference for this codebase's patterns.
