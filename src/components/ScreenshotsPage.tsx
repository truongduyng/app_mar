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
import type { SerializableProductConfig, MetadataConfig, LocaleDef } from "@/lib/types";

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

  const [section, setSection]   = useState<Section>("screenshots");
  const [productId, setProductId] = useState(() => {
    if (typeof window === "undefined") return PRODUCTS[0].id;
    const saved = localStorage.getItem("selectedProductId");
    return PRODUCTS.find((p) => p.id === saved) ? saved! : PRODUCTS[0].id;
  });
  const [locale, setLocale]     = useState<string>(() => getProductLocales(PRODUCTS[0])[0].code);
  const [ready, setReady]       = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);

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
  const productLocales = getProductLocales(product);
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
    setReady(false);
    const ctaBase    = product.screenshotBase;
    const extraPaths = product.ctaImage
      ? [`${ctaBase}/${product.ctaImage.sc1}`, `${ctaBase}/${product.ctaImage.sc2}`]
      : [];
    preloadImages([...getImagePathsForProduct(product), ...extraPaths]).then(() => setReady(true));
    if (!productLocales.find((l) => l.code === locale)) setLocale(productLocales[0].code);
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

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
        {productLocales.length > 1 && (
          <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", padding: 3, borderRadius: 8, marginLeft: "auto" }}>
            {productLocales.map((loc) => (
              <button key={loc.code} onClick={() => setLocale(loc.code)}
                style={{
                  background: locale === loc.code ? T.accent : "rgba(255,255,255,0.06)",
                  color: locale === loc.code ? "#fff" : T.fgMuted,
                  border: "none", borderRadius: 6, padding: "5px 10px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 4,
                  boxShadow: locale === loc.code ? `0 2px 10px ${T.accentGlow}` : "none",
                }}
              >
                {loc.flag && <span style={{ fontSize: 13 }}>{loc.flag}</span>}
                {loc.code.toUpperCase()}
              </button>
            ))}
          </div>
        )}
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
            <ScreenshotsSection product={product} locale={locale} multiProduct={PRODUCTS.length > 1} />
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
              ctaSc1={ctaSc1}
              ctaSc2={ctaSc2}
              onSc1Change={setCtaSc1}
              onSc2Change={setCtaSc2}
            />
          )}
          {section === "metadata" && (
            <MetadataPanel
              theme={T}
              locales={productLocales}
              activeLocale={locale}
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
