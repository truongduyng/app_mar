import { db } from "./client";
import {
  products, productThemes, productLocales, productSlides, slideCopy,
  productMetadata, productFeatureGraphics, productSocialOgs, productCtaImages,
} from "./schema";
import type { SerializableProductConfig, SerializableSlideDef, ThemeTokens, MetadataConfig, LocaleDef } from "@/lib/types";
import type { RichTextSegment } from "@/lib/rich-text";

export async function getSerializableProducts(): Promise<SerializableProductConfig[]> {
  const [
    allProducts,
    allThemes,
    allLocales,
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
    const locales = allLocales
      .filter((l) => l.productId === pid)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((l): LocaleDef => ({ code: l.code, label: l.label, flag: l.flag ?? undefined }));

    const slides = allSlides.filter((s) => s.productId === pid);
    const copy   = allCopy.filter((c) => c.productId === pid);
    const metadata = allMetadata.filter((m) => m.productId === pid);

    function buildSlides(device: string, slideVariant: string): SerializableSlideDef[] {
      return slides
        .filter((s) => s.device === device && s.slideVariant === slideVariant)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((s): SerializableSlideDef => {
          // sortOrder=0 is primary copy; higher values are copyByLocale overrides
          const copies = copy
            .filter((c) => c.slideVariant === slideVariant && c.slideKey === s.slideKey)
            .sort((a, b) => a.sortOrder - b.sortOrder);

          const primaryCopy = copies.find((c) => c.sortOrder === 0);
          if (!primaryCopy) throw new Error(`No primary copy for ${pid}/${slideVariant}/${s.slideKey}`);

          const copyByLocale: Record<string, { label: string; headline: RichTextSegment[]; subtitle: RichTextSegment[] }> = {};
          for (const c of copies.filter((c) => c.sortOrder > 0)) {
            copyByLocale[c.locale] = {
              label:    c.label,
              headline: c.headline as RichTextSegment[],
              subtitle: c.subtitle as RichTextSegment[],
            };
          }

          return {
            id: s.slideKey,
            componentKey: s.componentKey,
            copy: {
              label:    primaryCopy.label,
              headline: primaryCopy.headline as RichTextSegment[],
              subtitle: primaryCopy.subtitle as RichTextSegment[],
            },
            copyByLocale: Object.keys(copyByLocale).length ? copyByLocale : undefined,
          };
        });
    }

    // Build slidesByLocale — any variant that is not 'default'
    const variants = [...new Set(slides.map((s) => s.slideVariant))];
    const localeVariants = variants.filter((v) => v !== "default");

    const slidesByLocale: Record<string, { iphone: SerializableSlideDef[]; android?: SerializableSlideDef[] }> = {};
    for (const variant of localeVariants) {
      const iphoneSlides  = buildSlides("iphone",  variant);
      const androidSlides = buildSlides("android", variant);
      slidesByLocale[variant] = {
        iphone: iphoneSlides,
        ...(androidSlides.length ? { android: androidSlides } : {}),
      };
    }

    const defaultIphone  = buildSlides("iphone",  "default");
    const defaultAndroid = buildSlides("android", "default");

    function buildMetadata(m: typeof metadata[0]): MetadataConfig {
      return {
        name: m.name, subtitle: m.subtitle, promoText: m.promoText,
        shortDescription: m.shortDescription, description: m.description, keywords: m.keywords,
      };
    }

    const primaryLocale = locales[0]?.code ?? "en";
    const primaryMeta   = metadata.find((m) => m.locale === primaryLocale);
    const metadataByLocale: Record<string, MetadataConfig> = {};
    for (const m of metadata) metadataByLocale[m.locale] = buildMetadata(m);

    const fg  = allFeatureGraphics.find((f) => f.productId === pid);
    const og  = allSocialOgs.find((o) => o.productId === pid);
    const cta = allCtaImages.find((c) => c.productId === pid);

    return {
      id: pid,
      name: product.name,
      iconPath: product.iconPath,
      screenshotBase: product.screenshotBase,
      screenshotBaseByLocale: (product.screenshotBaseByLocale as Record<string, string>) || undefined,
      mockupPath: product.mockupPath ?? undefined,
      theme,
      locales: locales.length ? locales : undefined,
      slides: {
        iphone: defaultIphone,
        ...(defaultAndroid.length ? { android: defaultAndroid } : {}),
      },
      slidesByLocale: Object.keys(slidesByLocale).length ? slidesByLocale : undefined,
      featureGraphic: fg  ? { tagline: fg.tagline,  subtitle: fg.subtitle  ?? undefined } : undefined,
      socialOg:       og  ? { tagline: og.tagline,  subtitle: og.subtitle  ?? undefined } : undefined,
      ctaImage: cta ? {
        headline:         cta.headline,
        headlineByLocale: (cta.headlineByLocale  as Record<string, string>) || undefined,
        sc1: cta.sc1, sc2: cta.sc2,
        ctaLabel:         cta.ctaLabel ?? undefined,
        ctaLabelByLocale: (cta.ctaLabelByLocale as Record<string, string>) || undefined,
      } : undefined,
      metadata:         primaryMeta ? buildMetadata(primaryMeta) : undefined,
      metadataByLocale: Object.keys(metadataByLocale).length ? metadataByLocale : undefined,
    };
  });
}
