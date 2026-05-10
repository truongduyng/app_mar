"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { preloadImages, getImagePathsForProduct, img } from "@/lib/images";
import { MetadataPanel } from "@/components/metadata-panel";
import { ScreenshotsSection } from "@/components/sections/ScreenshotsSection";
import { FeatureGraphicSection } from "@/components/sections/FeatureGraphicSection";
import { SocialOgSection } from "@/components/sections/SocialOgSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { COMPONENT_REGISTRY } from "@/components/component-registry";
import { hydrateProducts } from "@/lib/product-hydration";
import { segmentsToMarkup } from "@/lib/rich-text";
import type { SerializableProductConfig, MetadataConfig, LocaleDef, AppPlatform } from "@/lib/types";
import type { RichTextSegment } from "@/lib/rich-text";

// Common App Store / Play Store locales for the picker
const COMMON_LOCALES: LocaleDef[] = [
  { code: "ar",      label: "Arabic",                   flag: "🇸🇦" },
  { code: "cs",      label: "Czech",                    flag: "🇨🇿" },
  { code: "da",      label: "Danish",                   flag: "🇩🇰" },
  { code: "en",      label: "English",                  flag: "🇬🇧" },
  { code: "de",      label: "German",                   flag: "🇩🇪" },
  { code: "el",      label: "Greek",                    flag: "🇬🇷" },
  { code: "es",      label: "Spanish",                  flag: "🇪🇸" },
  { code: "fi",      label: "Finnish",                  flag: "🇫🇮" },
  { code: "fil",     label: "Filipino",                 flag: "🇵🇭" },
  { code: "fr",      label: "French",                   flag: "🇫🇷" },
  { code: "he",      label: "Hebrew",                   flag: "🇮🇱" },
  { code: "hr",      label: "Croatian",                 flag: "🇭🇷" },
  { code: "hu",      label: "Hungarian",                flag: "🇭🇺" },
  { code: "id",      label: "Indonesian",               flag: "🇮🇩" },
  { code: "it",      label: "Italian",                  flag: "🇮🇹" },
  { code: "ja",      label: "Japanese",                 flag: "🇯🇵" },
  { code: "ko",      label: "Korean",                   flag: "🇰🇷" },
  { code: "ms",      label: "Malay",                    flag: "🇲🇾" },
  { code: "nl",      label: "Dutch",                    flag: "🇳🇱" },
  { code: "no",      label: "Norwegian",                flag: "🇳🇴" },
  { code: "pl",      label: "Polish",                   flag: "🇵🇱" },
  { code: "pt",      label: "Portuguese",               flag: "🇵🇹" },
  { code: "ro",      label: "Romanian",                 flag: "🇷🇴" },
  { code: "ru",      label: "Russian",                  flag: "🇷🇺" },
  { code: "sk",      label: "Slovak",                   flag: "🇸🇰" },
  { code: "sv",      label: "Swedish",                  flag: "🇸🇪" },
  { code: "th",      label: "Thai",                     flag: "🇹🇭" },
  { code: "tr",      label: "Turkish",                  flag: "🇹🇷" },
  { code: "uk",      label: "Ukrainian",                flag: "🇺🇦" },
  { code: "vi",      label: "Vietnamese",               flag: "🇻🇳" },
  { code: "zh-Hans", label: "Simplified Chinese",       flag: "🇨🇳" },
  { code: "zh-Hant", label: "Traditional Chinese",      flag: "🇹🇼" },
];

function segmentsToPlain(segments: RichTextSegment[]): string {
  return segmentsToMarkup(segments);
}

type Section = "screenshots" | "feature-graphic" | "social-og" | "cta" | "metadata";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "screenshots",     label: "Screenshots" },
  { id: "feature-graphic", label: "Feature Graphic" },
  { id: "social-og",       label: "Social OG" },
  { id: "cta",             label: "CTA Image" },
  { id: "metadata",        label: "Store Metadata" },
];

function getProductLocales(product: ReturnType<typeof hydrateProducts>[number]): LocaleDef[] {
  return product.locales ?? [{ code: "en", label: "English", flag: "🇺🇸" }];
}

export function ScreenshotsPage({ rawProducts }: { rawProducts: SerializableProductConfig[] }) {
  const PRODUCTS = useMemo(
    () => hydrateProducts(rawProducts, COMPONENT_REGISTRY),
    [rawProducts],
  );

  const [section, setSection]   = useState<Section>(() => {
    if (typeof window === "undefined") return "screenshots";
    const p = new URLSearchParams(window.location.hash.slice(1));
    const s = p.get("section");
    return (["screenshots","feature-graphic","social-og","cta","metadata"] as Section[]).includes(s as Section) ? s as Section : "screenshots";
  });
  const [productId, setProductId] = useState(() => {
    if (typeof window === "undefined") return PRODUCTS[0].id;
    const p = new URLSearchParams(window.location.hash.slice(1));
    const fromHash = p.get("product");
    if (fromHash && PRODUCTS.find((p) => p.id === fromHash)) return fromHash;
    const saved = localStorage.getItem("selectedProductId");
    return PRODUCTS.find((p) => p.id === saved) ? saved! : PRODUCTS[0].id;
  });
  const [locale, setLocale]     = useState<string>(() => {
    if (typeof window === "undefined") return getProductLocales(PRODUCTS[0])[0].code;
    const p = new URLSearchParams(window.location.hash.slice(1));
    return p.get("locale") ?? getProductLocales(PRODUCTS[0])[0].code;
  });
  const [platform, setPlatform] = useState<AppPlatform>("iphone");
  const [ready, setReady]       = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);

  // Extra locales added at runtime via AI generation (keyed by productId)
  const [extraLocales, setExtraLocales] = useState<Record<string, LocaleDef[]>>({});
  const [addLocaleOpen, setAddLocaleOpen] = useState(false);
  const [regenLocaleCode, setRegenLocaleCode] = useState<string | null>(null);

  const [metadataMap, setMetadataMap] = useState<Record<string, Record<string, MetadataConfig>>>(() => {
    const empty: MetadataConfig = { name: "", subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "" };
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

  const product        = PRODUCTS.find((p) => p.id === productId)!;
  const T              = product.theme;
  const productLocales = useMemo(() => {
    const base  = getProductLocales(product);
    const extra = extraLocales[product.id] ?? [];
    const seen  = new Set(base.map((l) => l.code));
    return [...base, ...extra.filter((l) => !seen.has(l.code))];
  }, [product, extraLocales]);
  const ctaSc1         = ctaScMap[product.id]?.sc1 ?? product.ctaImage?.sc1 ?? "sc1.png";
  const ctaSc2         = ctaScMap[product.id]?.sc2 ?? product.ctaImage?.sc2 ?? "sc2.png";

  const setCtaSc1 = (v: string) => setCtaScMap((m) => {
    const next = { ...m, [product.id]: { ...m[product.id], sc1: v } };
    localStorage.setItem("ctaScMap", JSON.stringify(next));
    return next;
  });
  const setCtaSc2 = (v: string) => setCtaScMap((m) => {
    const next = { ...m, [product.id]: { ...m[product.id], sc2: v } };
    localStorage.setItem("ctaScMap", JSON.stringify(next));
    return next;
  });

  useEffect(() => {
    const params = new URLSearchParams({ section, product: productId, locale });
    window.history.replaceState(null, "", `#${params}`);
  }, [section, productId, locale]);

  useEffect(() => {
    setReady(false);
    const ctaBase    = product.screenshotBase;
    const extraPaths = product.ctaImage
      ? [`${ctaBase}/${product.ctaImage.sc1}`, `${ctaBase}/${product.ctaImage.sc2}`]
      : [];
    preloadImages([...getImagePathsForProduct(product), ...extraPaths]).then(() => setReady(true));
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset locale to first when switching products (but never when adding a new locale)
  useEffect(() => {
    if (!productLocales.find((l) => l.code === locale)) {
      setLocale(productLocales[0].code);
    }
  }, [productId, productLocales]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRegenLocale(locCode: string) {
    const locDef = productLocales.find((l) => l.code === locCode);
    if (!locDef) return;
    const sourceLoc = productLocales[0];
    const rawProduct = rawProducts.find((p) => p.id === productId)!;
    const sourceMetadata =
      metadataMap[productId]?.[sourceLoc.code] ??
      { name: product.name, subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "" };
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
  }

  useEffect(() => {
    if (!productMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (productMenuRef.current && !productMenuRef.current.contains(e.target as Node))
        setProductMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [productMenuOpen]);

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: "#09090B", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A8A94", fontSize: 16, fontFamily: "inherit" }}>
        Loading images…
      </div>
    );
  }

  const SIDEBAR_W = 200;
  const TOPBAR_H  = 57;

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", color: T.fg, fontFamily: "inherit" }}>

      {/* ── Top bar: product picker + lang picker ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: TOPBAR_H,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 16px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        {/* Product picker */}
        <div ref={productMenuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setProductMenuOpen((o) => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: productMenuOpen ? "rgba(255,255,255,0.08)" : "transparent",
              border: "1px solid", borderColor: productMenuOpen ? "rgba(255,255,255,0.14)" : "transparent",
              borderRadius: 10, padding: "6px 10px 6px 6px",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <img src={img(product.iconPath)} alt={product.name}
              style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: T.fg, whiteSpace: "nowrap" }}>{product.name}</span>
            <svg width={13} height={13} viewBox="0 0 14 14" fill="none"
              style={{ marginLeft: 2, opacity: 0.5, flexShrink: 0, transform: productMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {productMenuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 200,
              background: "rgba(24,24,28,0.97)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
              padding: 6, minWidth: 220, boxShadow: "0 16px 60px rgba(0,0,0,0.6)",
              display: "flex", flexDirection: "column", gap: 2,
            }}>
              {PRODUCTS.map((p) => {
                const active = p.id === productId;
                return (
                  <button key={p.id}
                    onClick={() => { setProductId(p.id); localStorage.setItem("selectedProductId", p.id); setProductMenuOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: active ? "rgba(255,255,255,0.08)" : "transparent",
                      border: "none", borderRadius: 8, padding: "8px 10px",
                      cursor: "pointer", transition: "background 0.12s", width: "100%", textAlign: "left",
                    }}
                    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <img src={img(p.iconPath)} alt={p.name}
                      style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span style={{ fontSize: 14, fontWeight: active ? 700 : 500, color: active ? T.fg : "#9999a8", flex: 1 }}>{p.name}</span>
                    {active && (
                      <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                        <path d="M3 7l3 3 5-5" stroke={T.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Language picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", padding: 3, borderRadius: 8 }}>
            {productLocales.map((loc) => {
              const isActive = locale === loc.code;
              const isRegen  = regenLocaleCode === loc.code;
              return (
                <div key={loc.code} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <button onClick={() => setLocale(loc.code)}
                    style={{
                      background: isActive ? T.accent : "rgba(255,255,255,0.06)",
                      color: isActive ? "#fff" : T.fgMuted,
                      border: "none", borderRadius: 6, padding: isActive ? "5px 26px 5px 10px" : "5px 10px",
                      fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 4,
                      boxShadow: isActive ? `0 2px 10px ${T.accentGlow}` : "none",
                    }}
                  >
                    {loc.flag && <span style={{ fontSize: 13 }}>{loc.flag}</span>}
                    {loc.code.toUpperCase()}
                  </button>
                  {isActive && (
                    <button
                      onClick={() => handleRegenLocale(loc.code)}
                      disabled={isRegen}
                      title="Re-generate with AI"
                      className={isRegen ? "animate-spin" : ""}
                      style={{
                        position: "absolute", right: 5,
                        background: "none", border: "none", padding: "2px",
                        cursor: isRegen ? "not-allowed" : "pointer",
                        color: isRegen ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.7)",
                        display: "flex", alignItems: "center",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setAddLocaleOpen(true)}
            title="Add language with AI"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: 7,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: T.fgMuted, cursor: "pointer", fontSize: 16, lineHeight: 1,
              transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = T.fgMuted; }}
          >+</button>
        </div>
      </div>

      {/* ── Body: sidebar + main ── */}
      <div style={{ display: "flex", paddingTop: TOPBAR_H }}>

        {/* Left sidebar */}
        <aside style={{
          position: "fixed", top: TOPBAR_H, left: 0, bottom: 0,
          width: SIDEBAR_W, zIndex: 90,
          background: "rgba(13,13,15,0.95)", backdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          padding: "16px 10px",
          gap: 2,
          overflowY: "auto",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.fgMuted, textTransform: "uppercase", padding: "2px 8px 8px" }}>
            Assets
          </div>
          {SECTIONS.map((s) => {
            const active = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  background: active ? T.accentSoft : "transparent",
                  border: active ? `1px solid ${T.accent}33` : "1px solid transparent",
                  borderRadius: 8, padding: "8px 10px",
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? T.fg : T.fgMuted,
                  cursor: "pointer", transition: "all 0.15s", textAlign: "left", width: "100%",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <SectionIcon id={s.id} active={active} color={active ? T.accent : T.fgMuted} />
                {s.label}
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main style={{ marginLeft: SIDEBAR_W, flex: 1, minWidth: 0 }}>
          {section === "screenshots" && (
            <ScreenshotsSection product={product} locale={locale} platform={platform} multiProduct={PRODUCTS.length > 1} />
          )}
          {section === "feature-graphic" && (
            <FeatureGraphicSection product={product} multiProduct={PRODUCTS.length > 1} />
          )}
          {section === "social-og" && (
            <SocialOgSection product={product} multiProduct={PRODUCTS.length > 1} />
          )}
          {section === "cta" && (
            <CtaSection
              product={product}
              locale={locale}
              platform={platform}
              ctaSc1={ctaSc1}
              ctaSc2={ctaSc2}
              onSc1Change={setCtaSc1}
              onSc2Change={setCtaSc2}
            />
          )}
          {section === "metadata" && (
            <MetadataPanel
              theme={T}
              platform={platform}
              locales={productLocales}
              activeLocale={locale}
              productId={product.id}
              bundleId={product.bundleId}
              packageName={product.packageName}
              metadata={
                metadataMap[product.id]?.[locale] ??
                metadataMap[product.id]?.[productLocales[0].code] ??
                { name: product.name, subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "" }
              }
              onUpdate={(updated) =>
                setMetadataMap((prev) => ({ ...prev, [product.id]: { ...prev[product.id], [locale]: updated } }))
              }
              allLocaleData={metadataMap[product.id] ?? {}}
            />
          )}
        </main>
      </div>

      {addLocaleOpen && (
        <AddLocaleModal
          theme={T}
          productId={product.id}
          existingCodes={productLocales.map((l) => l.code)}
          sourceLoc={productLocales[0]}
          sourceMetadata={
            metadataMap[product.id]?.[productLocales[0].code] ??
            { name: product.name, subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "" }
          }
          rawProduct={rawProducts.find((p) => p.id === product.id)!}
          onClose={() => setAddLocaleOpen(false)}
          onAdded={(newLoc, metadata) => {
            setExtraLocales((prev) => ({
              ...prev,
              [product.id]: [...(prev[product.id] ?? []), newLoc],
            }));
            setMetadataMap((prev) => ({
              ...prev,
              [product.id]: { ...prev[product.id], [newLoc.code]: metadata },
            }));
            setLocale(newLoc.code);
            setAddLocaleOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Add Locale Modal ─────────────────────────────────────────────────────────

type AddLocaleModalProps = {
  theme: ReturnType<typeof hydrateProducts>[number]["theme"];
  productId: string;
  existingCodes: string[];
  sourceLoc: LocaleDef;
  sourceMetadata: MetadataConfig;
  rawProduct: SerializableProductConfig;
  onClose: () => void;
  onAdded: (locale: LocaleDef, metadata: MetadataConfig) => void;
};

function AddLocaleModal({ theme: T, productId, existingCodes, sourceLoc, sourceMetadata, rawProduct, onClose, onAdded }: AddLocaleModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LocaleDef | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = COMMON_LOCALES.filter(
    (l) =>
      !existingCodes.includes(l.code) &&
      (l.label.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase())),
  );

  async function handleGenerate() {
    if (!selected) return;
    setGenerating(true);
    setError(null);

    // Flatten slide copy to plain markup strings for the AI prompt
    const slides = rawProduct.slides.iphone.map((s) => ({
      slideKey: s.id,
      label:    s.copy.label,
      headline: segmentsToPlain(s.copy.headline as RichTextSegment[]),
      subtitle: segmentsToPlain(s.copy.subtitle as RichTextSegment[]),
    }));

    try {
      const res = await fetch("/api/generate-locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          targetLocale: selected.code,
          targetLabel:  selected.label,
          targetFlag:   selected.flag,
          sourceLocale: sourceLoc.code,
          sourceLabel:  sourceLoc.label,
          sourceFlag:   sourceLoc.flag,
          sourceMetadata,
          sourceSlides: slides,
        }),
      });

      const data = await res.json() as { ok?: boolean; error?: string; metadata?: MetadataConfig };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Generation failed");
        setGenerating(false);
        return;
      }

      onAdded(selected, data.metadata!);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setGenerating(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#111114", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
        width: 380, maxHeight: "80vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Add language</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>AI generates ASO-optimised copy</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 16px 8px" }}>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search language…"
            style={{
              width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#fff",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 8px" }}>
          {filtered.length === 0 && (
            <div style={{ color: "#555", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No languages found</div>
          )}
          {filtered.map((loc) => {
            const active = selected?.code === loc.code;
            return (
              <button key={loc.code} onClick={() => setSelected(loc)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", background: active ? T.accentSoft : "transparent",
                  border: active ? `1px solid ${T.accent}44` : "1px solid transparent",
                  borderRadius: 8, padding: "8px 12px", cursor: "pointer", transition: "all 0.12s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{loc.flag}</span>
                <span style={{ fontSize: 13, color: active ? "#fff" : "#ccc", fontWeight: active ? 600 : 400 }}>{loc.label}</span>
                <span style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>{loc.code}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {error && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>{error}</div>}
          <button
            onClick={handleGenerate}
            disabled={!selected || generating}
            style={{
              width: "100%", padding: "9px 16px", borderRadius: 9, border: "none",
              background: selected && !generating ? T.accent : "rgba(255,255,255,0.08)",
              color: selected && !generating ? "#fff" : "#555",
              fontWeight: 700, fontSize: 13, cursor: selected && !generating ? "pointer" : "not-allowed",
              transition: "all 0.15s",
              boxShadow: selected && !generating ? `0 2px 14px ${T.accentGlow}` : "none",
            }}
          >
            {generating
              ? "Generating with AI…"
              : selected
              ? `Generate ${selected.flag ?? ""} ${selected.label}`
              : "Select a language"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionIcon({ id, color }: { id: string; active: boolean; color: string }) {
  const s = { stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const size = 15;
  switch (id) {
    case "screenshots":     return <svg width={size} height={size} viewBox="0 0 16 16"><rect x="2" y="1" width="8" height="14" rx="1.5" {...s}/><line x1="4" y1="13.5" x2="8" y2="13.5" {...s}/></svg>;
    case "feature-graphic": return <svg width={size} height={size} viewBox="0 0 16 16"><rect x="1" y="4" width="14" height="8" rx="1.5" {...s}/><circle cx="5" cy="8" r="1.5" {...s}/><path d="M8 10l2-2 3 2" {...s}/></svg>;
    case "social-og":       return <svg width={size} height={size} viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" rx="1.5" {...s}/><circle cx="5.5" cy="7" r="1.5" {...s}/><path d="M9 10l2-3 3 3" {...s}/></svg>;
    case "cta":             return <svg width={size} height={size} viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="1.5" {...s}/><path d="M5 8h6M8 5v6" {...s}/></svg>;
    case "metadata":        return <svg width={size} height={size} viewBox="0 0 16 16"><path d="M3 4h10M3 8h7M3 12h5" {...s}/></svg>;
    default:                return null;
  }
}
