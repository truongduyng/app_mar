/**
 * Migration utility: convert static product files → DB rows.
 *
 * Usage:
 *   DATABASE_URL=... bun run src/db/migrate-from-static.ts
 *
 * How it works:
 *   1. Imports the live PRODUCTS array from src/products/index.ts (Bun handles JSX/TSX natively).
 *   2. Converts React.ReactNode headlines/subtitles → RichTextSegment[] using jsxToSegments().
 *   3. Resolves component references → string keys using the COMPONENT_REGISTRY.
 *   4. Inserts everything into the new schema.
 *
 * jsxToSegments() recognises three patterns in the JSX:
 *   - Plain string              → { t: "text", v: string }
 *   - <br />                    → { t: "br" }
 *   - <span style.color=accent> → { t: "accent", v: textContent }
 *   - React.Fragment / array    → flattened recursively
 *
 * Anything that doesn't match those patterns degrades to a text extraction.
 */

import React from "react";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import type { RichTextSegment } from "@/lib/rich-text";
import type { ProductConfig, SlideDef } from "@/lib/types";

// ─── JSX → RichTextSegment[] ──────────────────────────────────────────────

function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  const el = node as React.ReactElement<{ children?: React.ReactNode }>;
  return extractText(el.props?.children);
}

export function jsxToSegments(node: React.ReactNode, accentColor: string): RichTextSegment[] {
  if (node === null || node === undefined || typeof node === "boolean") return [];
  if (typeof node === "number") return [{ t: "text", v: String(node) }];
  if (typeof node === "string") return node ? [{ t: "text", v: node }] : [];
  if (Array.isArray(node)) return node.flatMap((n) => jsxToSegments(n, accentColor));

  const el = node as React.ReactElement<{ children?: React.ReactNode; style?: React.CSSProperties }>;
  const { type, props } = el;
  const typeStr = String(type);

  // Fragment
  if (type === React.Fragment || typeStr === "Symbol(react.fragment)") {
    return jsxToSegments(props.children, accentColor);
  }

  // Line break
  if (type === "br") return [{ t: "br" }];

  // Accent span: <span style={{ color: accentColor }}>…</span>
  if (type === "span" && (props?.style as Record<string, string> | undefined)?.color === accentColor) {
    return [{ t: "accent", v: extractText(props.children) }];
  }

  // Any other element: recurse into children
  if (props?.children !== undefined) {
    return jsxToSegments(props.children, accentColor);
  }

  return [];
}

// ─── Component key resolution ─────────────────────────────────────────────

type SlideComponent = React.FC<any>;

function buildReverseRegistry(
  registry: Record<string, SlideComponent>,
): Map<SlideComponent, string> {
  return new Map(Object.entries(registry).map(([key, comp]) => [comp, key]));
}

// ─── Main migration ───────────────────────────────────────────────────────

async function migrate() {
  // Dynamic imports so this file can be type-checked without side effects.
  // In a real run, Bun resolves these JSX/TSX files natively.
  const { PRODUCTS } = await import("@/products/index");
  const { COMPONENT_REGISTRY } = await import("@/components/component-registry");

  const reverseRegistry = buildReverseRegistry(COMPONENT_REGISTRY);

  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
  const db = drizzle(sql, { schema });

  console.log(`Migrating ${PRODUCTS.length} products…`);

  for (const product of PRODUCTS as ProductConfig[]) {
    const accent = product.theme.accent;
    const primaryLocale = product.locales?.[0]?.code ?? "en";

    // ── products ──────────────────────────────────────────────────────
    await db.insert(schema.products).values({
      id:             product.id,
      name:           product.name,
      iconPath:       product.iconPath,
      screenshotBase: product.screenshotBase,
      mockupPath:     product.mockupPath,
    }).onConflictDoNothing();

    // ── product_themes ────────────────────────────────────────────────
    await db.insert(schema.productThemes).values({
      productId: product.id,
      tokens:    product.theme,
    }).onConflictDoNothing();

    // ── product_locales ───────────────────────────────────────────────
    if (product.locales?.length) {
      await db.insert(schema.productLocales).values(
        product.locales.map((loc, i) => ({
          productId:              product.id,
          code:                   loc.code,
          label:                  loc.label,
          flag:                   loc.flag,
          sortOrder:              i,
          screenshotBaseOverride: product.screenshotBaseByLocale?.[loc.code] ?? null,
        })),
      ).onConflictDoNothing();
    }

    // ── slide_groups & slides ─────────────────────────────────────────
    async function insertGroup(
      name: string,
      sortOrder: number,
      slidesByDevice: { iphone?: SlideDef[]; android?: SlideDef[] },
      groupLocales: string[],
    ) {
      const [group] = await db.insert(schema.slideGroups).values({
        productId: product.id,
        name,
        sortOrder,
      }).onConflictDoNothing().returning();

      if (!group) {
        console.warn(`  Group ${product.id}:${name} already exists — skipping slides`);
        return;
      }

      if (groupLocales.length) {
        await db.insert(schema.slideGroupLocales).values(
          groupLocales.map((locale) => ({ groupId: group.id, locale })),
        ).onConflictDoNothing();
      }

      const entries: typeof schema.productSlides.$inferInsert[] = [];
      for (const [device, slides] of Object.entries(slidesByDevice) as [string, SlideDef[]][]) {
        if (!slides) continue;
        slides.forEach((slide, i) => {
          const componentKey = reverseRegistry.get(slide.Component);
          if (!componentKey) {
            throw new Error(`Component for slide "${slide.id}" not found in COMPONENT_REGISTRY`);
          }
          entries.push({ groupId: group.id, device, slideKey: slide.id, componentKey, sortOrder: i });
        });
      }
      if (entries.length) {
        await db.insert(schema.productSlides).values(entries).onConflictDoNothing();
      }
    }

    await insertGroup("default", 0, {
      iphone:  product.slides.iphone,
      android: product.slides.android,
    }, []);

    if (product.slidesByLocale) {
      let groupOrder = 1;
      for (const [localeName, localeSlides] of Object.entries(product.slidesByLocale)) {
        await insertGroup(localeName, groupOrder++, {
          iphone:  localeSlides.iphone,
          android: localeSlides.android,
        }, [localeName]);
      }
    }

    // ── slide_copy ────────────────────────────────────────────────────
    // Collect all unique slideKeys from default + locale groups
    const allSlides: SlideDef[] = [
      ...(product.slides.iphone ?? []),
      ...(product.slides.android ?? []),
    ];

    const seen = new Set<string>();
    const copyRows: typeof schema.slideCopy.$inferInsert[] = [];

    function addCopyRows(slideKey: string, primaryLocaleCode: string, copy: ProductConfig["slides"]["iphone"][0]["copy"], copyByLocale?: ProductConfig["slides"]["iphone"][0]["copyByLocale"]) {
      const key = `${slideKey}:${primaryLocaleCode}`;
      if (!seen.has(key)) {
        seen.add(key);
        copyRows.push({
          productId: product.id,
          slideKey,
          locale:    primaryLocaleCode,
          label:     copy.label,
          headline:  jsxToSegments(copy.headline, accent),
          subtitle:  jsxToSegments(copy.subtitle, accent),
        });
      }
      if (copyByLocale) {
        for (const [locale, localeCopy] of Object.entries(copyByLocale)) {
          const locKey = `${slideKey}:${locale}`;
          if (!seen.has(locKey)) {
            seen.add(locKey);
            copyRows.push({
              productId: product.id,
              slideKey,
              locale,
              label:     localeCopy.label,
              headline:  jsxToSegments(localeCopy.headline, accent),
              subtitle:  jsxToSegments(localeCopy.subtitle, accent),
            });
          }
        }
      }
    }

    for (const slide of allSlides) {
      addCopyRows(slide.id, primaryLocale, slide.copy, slide.copyByLocale);
    }

    if (product.slidesByLocale) {
      for (const [localeName, localeSlides] of Object.entries(product.slidesByLocale)) {
        const locSlides = [...(localeSlides.iphone ?? []), ...(localeSlides.android ?? [])];
        for (const slide of locSlides) {
          addCopyRows(slide.id, localeName, slide.copy, slide.copyByLocale);
        }
      }
    }

    if (copyRows.length) {
      await db.insert(schema.slideCopy).values(copyRows).onConflictDoNothing();
    }

    // ── product_metadata ──────────────────────────────────────────────
    const metaEntries: typeof schema.productMetadata.$inferInsert[] = [];
    if (product.metadata) {
      metaEntries.push({ productId: product.id, locale: primaryLocale, ...product.metadata });
    }
    if (product.metadataByLocale) {
      for (const [locale, meta] of Object.entries(product.metadataByLocale)) {
        if (locale !== primaryLocale) {
          metaEntries.push({ productId: product.id, locale, ...meta });
        }
      }
    }
    if (metaEntries.length) {
      await db.insert(schema.productMetadata).values(metaEntries).onConflictDoNothing();
    }

    // ── product_feature_graphics ──────────────────────────────────────
    if (product.featureGraphic) {
      await db.insert(schema.productFeatureGraphics).values({
        productId: product.id,
        locale:    primaryLocale,
        tagline:   product.featureGraphic.tagline,
        subtitle:  product.featureGraphic.subtitle,
      }).onConflictDoNothing();
    }

    // ── product_social_ogs ────────────────────────────────────────────
    if (product.socialOg) {
      await db.insert(schema.productSocialOgs).values({
        productId: product.id,
        locale:    primaryLocale,
        tagline:   product.socialOg.tagline,
        subtitle:  product.socialOg.subtitle,
      }).onConflictDoNothing();
    }

    // ── product_cta_images ────────────────────────────────────────────
    if (product.ctaImage) {
      const { headline, headlineByLocale, sc1, sc2, ctaLabel, ctaLabelByLocale } = product.ctaImage;

      await db.insert(schema.productCtaImages).values({
        productId: product.id,
        locale:    primaryLocale,
        headline,
        sc1,
        sc2,
        ctaLabel,
      }).onConflictDoNothing();

      if (headlineByLocale) {
        for (const [locale, loc_headline] of Object.entries(headlineByLocale)) {
          await db.insert(schema.productCtaImages).values({
            productId: product.id,
            locale,
            headline:  loc_headline,
            sc1,
            sc2,
            ctaLabel:  ctaLabelByLocale?.[locale] ?? ctaLabel,
          }).onConflictDoNothing();
        }
      }
    }

    console.log(`  ✓ ${product.id}`);
  }

  await sql.end();
  console.log("Migration complete.");
}

migrate().catch((err) => { console.error(err); process.exit(1); });
