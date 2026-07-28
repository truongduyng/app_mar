"use client";

import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { hydrateProducts } from "@/lib/product-hydration";
import { COMPONENT_REGISTRY } from "@/components/component-registry";
import { preloadImages, getImagePathsForProduct } from "@/lib/images";
import type { SerializableProductConfig, MetadataConfig, LocaleDef, AppPlatform, ThemeTokens } from "@/lib/types";
import { toast } from "sonner";

export type HydratedProduct = ReturnType<typeof hydrateProducts>[number];
export type UiMode = "dark" | "light";

type ProductContextValue = {
  PRODUCTS: HydratedProduct[];
  rawProducts: SerializableProductConfig[];
  product: HydratedProduct;
  productId: string;
  setProductId: (id: string) => void;
  locale: string;
  setLocale: (code: string) => void;
  platform: AppPlatform;
  setPlatform: (p: AppPlatform) => void;
  productLocales: LocaleDef[];
  extraLocales: Record<string, LocaleDef[]>;
  setExtraLocales: React.Dispatch<React.SetStateAction<Record<string, LocaleDef[]>>>;
  metadataMap: Record<string, Record<string, MetadataConfig>>;
  setMetadataMap: React.Dispatch<React.SetStateAction<Record<string, Record<string, MetadataConfig>>>>;
  ctaScMap: Record<string, { sc1: string; sc2: string }>;
  ctaHeadlineMap: Record<string, Record<string, string>>;
  setCtaSc1: (v: string) => void;
  setCtaSc2: (v: string) => void;
  setCtaHeadline: (v: string) => void;
  saveCtaHeadline: () => Promise<boolean>;
  ctaSc1: string;
  ctaSc2: string;
  ctaHeadline: string;
  ready: boolean;
  regenLocaleCode: string | null;
  handleRegenLocale: (locCode: string) => Promise<void>;
  removeLocale: (code: string) => Promise<void>;
  baseLocaleCodes: Set<string>;
  multiProduct: boolean;
  uiMode: UiMode;
  setUiMode: (mode: UiMode) => void;
};

const ProductContext = createContext<ProductContextValue | null>(null);

export function useProduct() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be used inside ProductProvider");
  return ctx;
}

function getProductLocales(product: HydratedProduct, extraLocales: Record<string, LocaleDef[]>): LocaleDef[] {
  const base = product.locales ?? [{ code: "en", label: "English", flag: "🇺🇸" }];
  const extra = extraLocales[product.id] ?? [];
  const seen = new Set(base.map((l) => l.code));
  return [...base, ...extra.filter((l) => !seen.has(l.code))];
}

function withUiModeTheme(product: HydratedProduct, uiMode: UiMode): HydratedProduct {
  if (uiMode === "dark") return product;

  const lightTheme: ThemeTokens = {
    ...product.theme,
    bg: "#F6F7FB",
    bgAlt: "#FFFFFF",
    fg: "#17171C",
    fgMuted: "#667085",
    accentSoft: `${product.theme.accent}1A`,
    surface: "rgba(17,24,39,0.05)",
    gradients: {
      ...product.theme.gradients,
      dark: "linear-gradient(180deg, #FFFFFF 0%, #F6F7FB 52%, #EEF1F7 100%)",
      warm: `linear-gradient(180deg, #FFFFFF 0%, ${product.theme.accent}10 42%, #F6F7FB 100%)`,
      deep: "linear-gradient(180deg, #FFFFFF 0%, #F4F6FA 100%)",
      hero: `linear-gradient(180deg, #FFFFFF 0%, ${product.theme.accent}12 45%, #F6F7FB 100%)`,
      accent: `linear-gradient(135deg, #FFFFFF 0%, ${product.theme.accent}16 48%, #F6F7FB 100%)`,
    },
  };

  return { ...product, theme: lightTheme };
}

import { segmentsToMarkup } from "@/lib/rich-text";
import type { RichTextSegment } from "@/lib/rich-text";

function segmentsToPlain(segments: RichTextSegment[]): string {
  return segmentsToMarkup(segments);
}

export function ProductProvider({
  rawProducts,
  initialProductId,
  initialLocale,
  children,
}: {
  rawProducts: SerializableProductConfig[];
  initialProductId: string;
  initialLocale: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const PRODUCTS = useMemo(
    () => hydrateProducts(rawProducts, COMPONENT_REGISTRY),
    [rawProducts],
  );

  const [productId, setProductIdState] = useState(initialProductId);
  const [locale, setLocaleState] = useState(initialLocale);
  const [platform, setPlatformState] = useState<AppPlatform>("iphone");
  const [uiMode, setUiModeState] = useState<UiMode>("dark");
  const [ready, setReady] = useState(false);
  const [extraLocales, setExtraLocales] = useState<Record<string, LocaleDef[]>>({});
  const [regenLocaleCode, setRegenLocaleCode] = useState<string | null>(null);

  const rawProduct = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];
  const product = useMemo(() => withUiModeTheme(rawProduct, uiMode), [rawProduct, uiMode]);
  const displayProducts = useMemo(() => PRODUCTS.map((p) => withUiModeTheme(p, uiMode)), [PRODUCTS, uiMode]);

  const setUiMode = useCallback((mode: UiMode) => {
    setUiModeState(mode);
    localStorage.setItem("uiMode", mode);
  }, []);

  const [metadataMap, setMetadataMap] = useState<Record<string, Record<string, MetadataConfig>>>(() => {
    const empty: MetadataConfig = { name: "", subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "", whatsNew: "" };
    const map: Record<string, Record<string, MetadataConfig>> = {};
    for (const p of PRODUCTS) {
      const locales = p.locales ?? [{ code: "en", label: "English", flag: "🇺🇸" }];
      const localeMap: Record<string, MetadataConfig> = {};
      for (const loc of locales) {
        if (p.metadataByLocale?.[loc.code]) {
          localeMap[loc.code] = p.metadataByLocale[loc.code];
        } else if (loc.code === locales[0].code && p.metadata) {
          localeMap[loc.code] = p.metadata;
        } else {
          localeMap[loc.code] = { ...empty, name: p.name };
        }
      }
      map[p.id] = localeMap;
    }
    return map;
  });

  const [ctaScMap, setCtaScMap] = useState<Record<string, { sc1: string; sc2: string }>>(() => {
    const defaults: Record<string, { sc1: string; sc2: string }> = {};
    for (const p of PRODUCTS) {
      if (p.ctaImage) defaults[p.id] = { sc1: p.ctaImage.sc1, sc2: p.ctaImage.sc2 };
    }
    return defaults;
  });

  const [ctaHeadlineMap, setCtaHeadlineMap] = useState<Record<string, Record<string, string>>>(() => {
    const defaults: Record<string, Record<string, string>> = {};
    for (const p of PRODUCTS) {
      if (!p.ctaImage) continue;
      defaults[p.id] = { [p.locales?.[0]?.code ?? "en"]: p.ctaImage.headline };
      for (const [code, headline] of Object.entries(p.ctaImage.headlineByLocale ?? {})) {
        defaults[p.id][code] = headline;
      }
    }
    return defaults;
  });

  const productLocales = useMemo(
    () => getProductLocales(product, extraLocales),
    [product, extraLocales],
  );

  const ctaSc1 = ctaScMap[product.id]?.sc1 ?? product.ctaImage?.sc1 ?? "sc1.png";
  const ctaSc2 = ctaScMap[product.id]?.sc2 ?? product.ctaImage?.sc2 ?? "sc2.png";
  const ctaHeadline =
    ctaHeadlineMap[product.id]?.[locale] ??
    product.ctaImage?.headlineByLocale?.[locale] ??
    product.ctaImage?.headline ??
    product.name;

  useEffect(() => {
    const savedPlatform = localStorage.getItem(`selectedPlatform_${productId}`);
    const currentProduct = PRODUCTS.find((p) => p.id === productId);
    const hasAndroid = Boolean(currentProduct?.slides.android?.length);
    setPlatformState(savedPlatform === "android" && hasAndroid ? "android" : "iphone");
  }, [productId, PRODUCTS]);

  useEffect(() => {
    const savedLocale = localStorage.getItem(`selectedLocale_${initialProductId}`);
    if (savedLocale) setLocaleState(savedLocale);

    const savedUiMode = localStorage.getItem("uiMode");
    if (savedUiMode === "light" || savedUiMode === "dark") {
      setUiModeState(savedUiMode);
    }

    try {
      const savedCtaScMap = localStorage.getItem("ctaScMap");
      if (savedCtaScMap) {
        setCtaScMap((prev) => ({ ...prev, ...JSON.parse(savedCtaScMap) }));
      }
    } catch { /* ignore */ }
  }, [initialProductId]);

  const setPlatform = useCallback((next: AppPlatform) => {
    setPlatformState(next);
    localStorage.setItem(`selectedPlatform_${productId}`, next);
  }, [productId]);

  const setCtaSc1 = useCallback((v: string) => setCtaScMap((m) => {
    const next = { ...m, [product.id]: { ...m[product.id], sc1: v } };
    localStorage.setItem("ctaScMap", JSON.stringify(next));
    return next;
  }), [product.id]);

  const setCtaSc2 = useCallback((v: string) => setCtaScMap((m) => {
    const next = { ...m, [product.id]: { ...m[product.id], sc2: v } };
    localStorage.setItem("ctaScMap", JSON.stringify(next));
    return next;
  }), [product.id]);

  const setCtaHeadline = useCallback((v: string) => setCtaHeadlineMap((m) => {
    const next = { ...m, [product.id]: { ...m[product.id], [locale]: v } };
    return next;
  }), [product.id, locale]);

  const saveCtaHeadline = useCallback(async () => {
    const headline = ctaHeadlineMap[product.id]?.[locale] ?? product.ctaImage?.headlineByLocale?.[locale] ?? product.ctaImage?.headline ?? product.name;
    const res = await fetch("/api/cta-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        locale,
        headline,
        sc1: ctaSc1,
        sc2: ctaSc2,
        ctaLabel: product.ctaImage?.ctaLabelByLocale?.[locale] ?? product.ctaImage?.ctaLabel ?? null,
      }),
    });
    if (res.ok) {
      router.refresh();
      return true;
    }
    return false;
  }, [ctaHeadlineMap, product.id, product.ctaImage, product.name, locale, ctaSc1, ctaSc2, router]);

  // Navigate when productId changes (swap the [productId] segment)
  const setProductId = useCallback((id: string) => {
    setProductIdState(id);
    localStorage.setItem("selectedProductId", id);
    const segments = pathname.split("/");
    // pathname is like /[productId]/screenshots — replace segment 1
    segments[1] = id;
    router.push(segments.join("/"));
  }, [pathname, router]);

  const setLocale = useCallback((code: string) => {
    setLocaleState(code);
    localStorage.setItem(`selectedLocale_${productId}`, code);
  }, [productId]);

  // Preload images when productId changes
  useEffect(() => {
    setReady(false);
    preloadImages(getImagePathsForProduct(product)).then(() => setReady(true));
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset locale if it doesn't exist on the new product
  const prevProductId = useRef(productId);
  useEffect(() => {
    if (prevProductId.current !== productId) {
      prevProductId.current = productId;
      if (!productLocales.find((l) => l.code === locale)) {
        setLocaleState(productLocales[0].code);
      }
    }
  }, [productId, productLocales, locale]);

  const handleRegenLocale = useCallback(async (locCode: string) => {
    const locDef = productLocales.find((l) => l.code === locCode);
    if (!locDef) return;
    const sourceLoc = productLocales[0];
    const rawProduct = rawProducts.find((p) => p.id === productId)!;
    const sourceMetadata =
      metadataMap[productId]?.[sourceLoc.code] ??
      { name: product.name, subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "", whatsNew: "" };
    const slides = rawProduct.slides.iphone.map((s) => ({
      slideKey: s.id,
      label:    s.copy.label,
      headline: segmentsToPlain(s.copy.headline as RichTextSegment[]),
      subtitle: segmentsToPlain(s.copy.subtitle as RichTextSegment[]),
    }));

    setRegenLocaleCode(locCode);
    try {
      const res = await fetch("/api/generate-locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          targetLocale: locDef.code,
          targetLabel:  locDef.label,
          targetFlag:   locDef.flag,
          sourceLocale: sourceLoc.code,
          sourceLabel:  sourceLoc.label,
          sourceFlag:   sourceLoc.flag,
          sourceMetadata,
          sourceSlides: slides,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; metadata?: MetadataConfig };
      if (res.ok && data.ok && data.metadata) {
        setMetadataMap((prev) => ({
          ...prev,
          [productId]: { ...prev[productId], [locCode]: data.metadata! },
        }));
        toast.success(`${locDef.label} regenerated`);
      } else {
        toast.error(data.error ?? `Failed to regenerate ${locDef.label}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Failed to regenerate ${locDef.label}`);
    } finally {
      setRegenLocaleCode(null);
    }
  }, [productLocales, rawProducts, productId, metadataMap, product.name]);

  const baseLocaleCodes = useMemo(
    () => new Set((product.locales ?? [{ code: "en" }]).map((l) => l.code)),
    [product.locales],
  );

  const removeLocale = useCallback(async (code: string) => {
    const res = await fetch("/api/locale", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, locale: code }),
    });
    if (!res.ok) {
      toast.error("Failed to remove language");
      return;
    }
    const remaining = productLocales.filter((l) => l.code !== code);
    if (locale === code) {
      setLocaleState(remaining[0]?.code ?? "en");
    }
    setExtraLocales((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? []).filter((l) => l.code !== code),
    }));
    toast.success("Language removed");
    router.refresh();
  }, [productId, locale, productLocales, router]);

  const value: ProductContextValue = {
    PRODUCTS: displayProducts,
    rawProducts,
    product,
    productId,
    setProductId,
    locale,
    setLocale,
    platform,
    setPlatform,
    productLocales,
    extraLocales,
    setExtraLocales,
    metadataMap,
    setMetadataMap,
    ctaScMap,
    ctaHeadlineMap,
    setCtaSc1,
    setCtaSc2,
    setCtaHeadline,
    saveCtaHeadline,
    ctaSc1,
    ctaSc2,
    ctaHeadline,
    ready,
    regenLocaleCode,
    handleRegenLocale,
    removeLocale,
    baseLocaleCodes,
    multiProduct: PRODUCTS.length > 1,
    uiMode,
    setUiMode,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}
