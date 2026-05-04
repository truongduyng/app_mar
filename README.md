# App Store Screenshot Generator

A Next.js app that generates App Store / Google Play screenshots, feature graphics, and social OG images for multiple mobile apps.

## How It Works

Renders React components into the DOM, captures them as PNGs via `html-to-image`, resizes them to platform-correct dimensions, and bundles them into a ZIP.

## Getting Started

```bash
bun dev      # Start dev server on port 3000
bun run build
bun start
```

## Architecture

### Product Registry

`src/products/index.ts` exports a `PRODUCTS` array. Each entry is a `ProductConfig` (defined in `src/lib/types.ts`) with:
- `theme` — brand colors, gradients, foreground/background
- `locales` — supported language codes (e.g. `["en", "vi"]`)
- `slides.iphone` / `slides.android` — array of `SlideDef`, each with a React `Component` and per-locale `copyByLocale`
- `featureGraphic`, `socialOg` — content for Google Play banner and social preview
- `metadata` / `metadataByLocale` — App Store listing text per locale

### Slide Components

Each product lives in `src/products/<product-id>/`:
- `index.tsx` — the `ProductConfig` object
- `slides.tsx` — slide React components

Slide components receive `{ theme, base, copy }` props. `base` is the screenshot dimensions (width/height), `copy` is locale-resolved text. Common layout primitives are in `src/components/slide-layouts.tsx`.

### Export Pipeline

`src/lib/export.ts` drives all exports:
1. `exportSingle` — captures one DOM element → PNG, resizes to target canvas dimensions
2. `exportAllToZip` — iterates all slides across all locales, renders each offscreen, batches into a ZIP via jszip

Canvas dimensions for all asset types are in `src/lib/constants.ts` (iPhone, Android, feature graphic, social OG).

Image assets are preloaded as data URLs via `src/lib/images.ts` before rendering to avoid cross-origin/timing issues during DOM capture.

### Main Page

`src/app/page.tsx` is a single large client component managing all state: selected product, active device tab, active locale, metadata edits, and export progress. It renders `ScreenshotPreview` cards and delegates export to the functions above.

## Adding a New Product

1. Create `src/products/<id>/index.tsx` and `slides.tsx`
2. Define a `ProductConfig` — copy an existing product as a template (e.g. `tinysteps`)
3. Add slide components in `slides.tsx` accepting `{ theme, base, copy }`
4. Place image assets in `public/products/<id>/`
5. Register in `src/products/index.ts` by adding to the `PRODUCTS` array
