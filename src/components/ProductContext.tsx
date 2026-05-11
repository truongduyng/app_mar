"use client";

import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { hydrateProducts } from "@/lib/product-hydration";
import { COMPONENT_REGISTRY } from "@/components/component-registry";
import { preloadImages, getImagePathsForProduct } from "@/lib/images";
import type { SerializableProductConfig, MetadataConfig, LocaleDef, AppPlatform } from "@/lib/types";

export type HydratedProduct = ReturnType<typeof hydrateProducts>[number];

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
  setCtaSc1: (v: string) => void;
  setCtaSc2: (v: string) => void;
  ctaSc1: string;
  ctaSc2: string;
  ready: boolean;
  regenLocaleCode: string | null;
  handleRegenLocale: (locCode: string) => Promise<void>;
  removeLocale: (code: string) => Promise<void>;
  baseLocaleCodes: Set<string>;
  multiProduct: boolean;
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
  const [platform, setPlatform] = useState<AppPlatform>("iphone");
  const [ready, setReady] = useState(false);
  const [extraLocales, setExtraLocales] = useState<Record<string, LocaleDef[]>>({});
  const [regenLocaleCode, setRegenLocaleCode] = useState<string | null>(null);

  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];

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
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("ctaScMap") : null;
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return defaults;
  });

  const productLocales = useMemo(
    () => getProductLocales(product, extraLocales),
    [product, extraLocales],
  );

  const ctaSc1 = ctaScMap[product.id]?.sc1 ?? product.ctaImage?.sc1 ?? "sc1.png";
  const ctaSc2 = ctaScMap[product.id]?.sc2 ?? product.ctaImage?.sc2 ?? "sc2.png";

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
  }, []);

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
      }
    } finally {
      setRegenLocaleCode(null);
    }
  }, [productLocales, rawProducts, productId, metadataMap, product.name]);

  const baseLocaleCodes = useMemo(
    () => new Set((product.locales ?? [{ code: "en" }]).map((l) => l.code)),
    [product.locales],
  );

  const removeLocale = useCallback(async (code: string) => {
    await fetch("/api/locale", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, locale: code }),
    });
    const remaining = productLocales.filter((l) => l.code !== code);
    if (locale === code) {
      setLocaleState(remaining[0]?.code ?? "en");
    }
    setExtraLocales((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? []).filter((l) => l.code !== code),
    }));
    router.refresh();
  }, [productId, locale, productLocales, router]);

  const value: ProductContextValue = {
    PRODUCTS,
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
    setCtaSc1,
    setCtaSc2,
    ctaSc1,
    ctaSc2,
    ready,
    regenLocaleCode,
    handleRegenLocale,
    removeLocale,
    baseLocaleCodes,
    multiProduct: PRODUCTS.length > 1,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}
