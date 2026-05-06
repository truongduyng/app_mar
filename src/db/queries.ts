import { db } from "./client";
import {
  products, productThemes, productLocales, slideGroups, slideGroupLocales,
  productSlides, slideCopy, productMetadata, productFeatureGraphics,
  productSocialOgs, productCtaImages,
} from "./schema";
import type { SerializableProductConfig, SerializableSlideDef, SerializableSlideCopy, ThemeTokens, MetadataConfig, LocaleDef } from "@/lib/types";
import type { RichTextSegment } from "@/lib/rich-text";

export async function getSerializableProducts(): Promise<SerializableProductConfig[]> {
  const [
    allProducts,
    allThemes,
    allLocales,
    allGroups,
    allGroupLocales,
    allSlides,
    allCopy,
    allMetadata,
    allFeatureGraphics,
    allSocialOgs,
    allCtaImages,
  ] = await Promise.all([
    db.select().from(products),
    db.select().from(productThemes),
    db.select().from(productLocales),
    db.select().from(slideGroups),
    db.select().from(slideGroupLocales),
    db.select().from(productSlides),
    db.select().from(slideCopy),
    db.select().from(productMetadata),
    db.select().from(productFeatureGraphics),
    db.select().from(productSocialOgs),
    db.select().from(productCtaImages),
  ]);

  return allProducts.map((product) => {
    const pid = product.id;

    const theme = allThemes.find((t) => t.productId === pid)?.tokens as ThemeTokens;

    const localeRows = allLocales
      .filter((l) => l.productId === pid)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const locales: LocaleDef[] = localeRows.map((l) => ({
      code: l.code,
      label: l.label,
      flag: l.flag ?? undefined,
    }));

    const primaryLocale = localeRows[0]?.code ?? "en";

    // screenshot_base overrides keyed by locale
    const screenshotBaseByLocale: Record<string, string> = {};
    for (const l of localeRows) {
      if (l.screenshotBaseOverride) screenshotBaseByLocale[l.code] = l.screenshotBaseOverride;
    }

    // Slide groups for this product
    const groups = allGroups.filter((g) => g.productId === pid);
    const defaultGroup = groups.find((g) => g.name === "default");
    const localeGroupsList = groups.filter((g) => g.name !== "default");

    // Copy rows for this product
    const productCopy = allCopy.filter((c) => c.productId === pid);

    function buildDevice(
      groupId: number,
      device: string,
      groupPrimaryLocale: string,
    ): SerializableSlideDef[] {
      return allSlides
        .filter((s) => s.groupId === groupId && s.device === device)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((slide): SerializableSlideDef => {
          const copies = productCopy.filter((c) => c.slideKey === slide.slideKey);

          const primaryCopy = copies.find((c) => c.locale === groupPrimaryLocale);
          if (!primaryCopy) {
            throw new Error(`No copy for ${pid}/${slide.slideKey}/${groupPrimaryLocale}`);
          }

          const copyByLocale: Record<string, SerializableSlideCopy> = {};
          for (const c of copies) {
            if (c.locale === groupPrimaryLocale) continue;
            copyByLocale[c.locale] = {
              label:    c.label,
              headline: c.headline as RichTextSegment[],
              subtitle: c.subtitle as RichTextSegment[],
            };
          }

          return {
            id:           slide.slideKey,
            componentKey: slide.componentKey,
            copy: {
              label:    primaryCopy.label,
              headline: primaryCopy.headline as RichTextSegment[],
              subtitle: primaryCopy.subtitle as RichTextSegment[],
            },
            copyByLocale: Object.keys(copyByLocale).length ? copyByLocale : undefined,
          };
        });
    }

    function buildGroup(group: { id: number; name: string }): {
      iphone: SerializableSlideDef[];
      android?: SerializableSlideDef[];
    } {
      // For the default group, primary copy is the product's primary locale.
      // For locale-specific groups, primary copy is the locale the group is named for.
      const groupPrimaryLocale = group.name === "default" ? primaryLocale : group.name;
      const iphone  = buildDevice(group.id, "iphone",  groupPrimaryLocale);
      const android = buildDevice(group.id, "android", groupPrimaryLocale);
      return { iphone, ...(android.length ? { android } : {}) };
    }

    const defaultSlides = defaultGroup ? buildGroup(defaultGroup) : { iphone: [] };

    const slidesByLocale: Record<string, { iphone: SerializableSlideDef[]; android?: SerializableSlideDef[] }> = {};
    for (const group of localeGroupsList) {
      slidesByLocale[group.name] = buildGroup(group);
    }

    // Metadata
    const metaRows = allMetadata.filter((m) => m.productId === pid);
    const primaryMeta = metaRows.find((m) => m.locale === primaryLocale);
    const metadataByLocale: Record<string, MetadataConfig> = {};
    for (const m of metaRows) {
      metadataByLocale[m.locale] = {
        name: m.name, subtitle: m.subtitle, promoText: m.promoText,
        shortDescription: m.shortDescription, description: m.description, keywords: m.keywords,
      };
    }

    // Feature graphic: use primary locale, fall back to any row for this product
    const fg = allFeatureGraphics.find((f) => f.productId === pid && f.locale === primaryLocale)
            ?? allFeatureGraphics.find((f) => f.productId === pid);

    // Social OG: same fallback logic
    const og = allSocialOgs.find((o) => o.productId === pid && o.locale === primaryLocale)
            ?? allSocialOgs.find((o) => o.productId === pid);

    // CTA image: build headlineByLocale / ctaLabelByLocale from per-locale rows
    const ctaRows = allCtaImages.filter((c) => c.productId === pid);
    const primaryCta = ctaRows.find((c) => c.locale === primaryLocale) ?? ctaRows[0];
    let ctaImage: SerializableProductConfig["ctaImage"];
    if (primaryCta) {
      const headlineByLocale: Record<string, string> = {};
      const ctaLabelByLocale: Record<string, string> = {};
      for (const c of ctaRows) {
        if (c.locale === primaryLocale) continue;
        headlineByLocale[c.locale] = c.headline;
        if (c.ctaLabel) ctaLabelByLocale[c.locale] = c.ctaLabel;
      }
      ctaImage = {
        headline:         primaryCta.headline,
        headlineByLocale: Object.keys(headlineByLocale).length ? headlineByLocale : undefined,
        sc1:              primaryCta.sc1,
        sc2:              primaryCta.sc2,
        ctaLabel:         primaryCta.ctaLabel ?? undefined,
        ctaLabelByLocale: Object.keys(ctaLabelByLocale).length ? ctaLabelByLocale : undefined,
      };
    }

    return {
      id:             pid,
      name:           product.name,
      iconPath:       product.iconPath,
      screenshotBase: product.screenshotBase,
      screenshotBaseByLocale: Object.keys(screenshotBaseByLocale).length ? screenshotBaseByLocale : undefined,
      mockupPath: product.mockupPath ?? undefined,
      theme,
      locales: locales.length ? locales : undefined,
      slides:         defaultSlides,
      slidesByLocale: Object.keys(slidesByLocale).length ? slidesByLocale : undefined,
      featureGraphic: fg ? { tagline: fg.tagline, subtitle: fg.subtitle ?? undefined } : undefined,
      socialOg:       og ? { tagline: og.tagline, subtitle: og.subtitle ?? undefined } : undefined,
      ctaImage,
      metadata: primaryMeta
        ? { name: primaryMeta.name, subtitle: primaryMeta.subtitle, promoText: primaryMeta.promoText, shortDescription: primaryMeta.shortDescription, description: primaryMeta.description, keywords: primaryMeta.keywords }
        : undefined,
      metadataByLocale: Object.keys(metadataByLocale).length ? metadataByLocale : undefined,
    };
  });
}
