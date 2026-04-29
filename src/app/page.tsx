"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  IPHONE_SIZES, IPHONE_W, IPHONE_H,
  ANDROID_W, ANDROID_H, ANDROID_SIZES,
  FG_W, FG_H,
  OG_W, OG_H,
} from "@/lib/constants";
import { preloadImages, getImagePathsForProduct, img } from "@/lib/images";
import { exportSingle, exportAllToZip, exportCtaImage } from "@/lib/export";
import { ScreenshotPreview } from "@/components/ui";
import { FeatureGraphic } from "@/components/feature-graphic";
import { SocialOgImage } from "@/components/social-og";
import { CtaImage, CTA_W, CTA_H_1x1, CTA_H_4x5, type CtaRatio } from "@/components/cta-image";
import { MetadataPanel } from "@/components/metadata-panel";
import { PRODUCTS } from "@/products";
import type { MetadataConfig, LocaleDef } from "@/lib/types";

/** Build the initial per-product, per-locale metadata map */
function buildMetadataMap(): Record<string, Record<string, MetadataConfig>> {
  const map: Record<string, Record<string, MetadataConfig>> = {};
  const empty: MetadataConfig = { name: "", subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "" };

  for (const p of PRODUCTS) {
    const localeMap: Record<string, MetadataConfig> = {};
    const locales = p.locales ?? [{ code: "en", label: "English", flag: "🇺🇸" }];

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
}

/** Get locale defs for a product, defaulting to [en] */
function getProductLocales(product: typeof PRODUCTS[number]): LocaleDef[] {
  return product.locales ?? [{ code: "en", label: "English", flag: "🇺🇸" }];
}

/* ── Section header ────────────────────────────────────────── */
function SectionHeader({
  title,
  subtitle,
  accentColor,
  right,
}: {
  title: string;
  subtitle: string;
  accentColor: string;
  right?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      gap: 16, flexWrap: "wrap", marginBottom: 20,
    }}>
      <div>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
          color: accentColor, textTransform: "uppercase", marginBottom: 4,
        }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "#8A8A94", fontWeight: 400 }}>
          {subtitle}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ── Divider ───────────────────────────────────────────────── */
function SectionDivider() {
  return (
    <div style={{
      height: 1,
      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent 100%)",
      margin: "8px 24px 0",
    }} />
  );
}

export default function ScreenshotsPage() {
  const ssOffscreenRef = useRef<HTMLDivElement>(null);
  const fgOffscreenRef = useRef<HTMLDivElement>(null);
  const ogOffscreenRef = useRef<HTMLDivElement>(null);
  const ctaOffscreenRef = useRef<HTMLDivElement>(null);

  const [selectedSize, setSelectedSize] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [productId, setProductId] = useState(() => {
    if (typeof window === "undefined") return PRODUCTS[0].id;
    const saved = localStorage.getItem("selectedProductId");
    return PRODUCTS.find((p) => p.id === saved) ? saved! : PRODUCTS[0].id;
  });
  const [ready, setReady] = useState(false);
  const [device, setDevice] = useState<"iphone" | "android">("iphone");
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);

  // Per-product, per-locale state (single locale controls both slides + metadata)
  const [metadataMap, setMetadataMap] = useState<Record<string, Record<string, MetadataConfig>>>(buildMetadataMap);
  const [locale, setLocale] = useState<string>(() => {
    return getProductLocales(PRODUCTS[0])[0].code;
  });

  const product = PRODUCTS.find((p) => p.id === productId)!;
  const T = product.theme;

  // CTA screenshot selectors — persisted per product in localStorage
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
  const ctaSc1 = ctaScMap[product.id]?.sc1 ?? product.ctaImage?.sc1 ?? "sc1.png";
  const ctaSc2 = ctaScMap[product.id]?.sc2 ?? product.ctaImage?.sc2 ?? "sc2.png";
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
  const [ctaRatio, setCtaRatio] = useState<CtaRatio>("4:5");
  const ctaH = ctaRatio === "4:5" ? CTA_H_4x5 : CTA_H_1x1;

  const activeSlides = product.slidesByLocale?.[locale] ?? product.slides;
  const hasAndroid = Boolean(activeSlides.android?.length);
  const activeDevice = hasAndroid ? device : "iphone";
  const slides = (activeDevice === "android" ? activeSlides.android : activeSlides.iphone) ?? [];
  const sizes = activeDevice === "android" ? ANDROID_SIZES : IPHONE_SIZES;
  const canvasW = activeDevice === "android" ? ANDROID_W : IPHONE_W;
  const canvasH = activeDevice === "android" ? ANDROID_H : IPHONE_H;
  const screenshotBase = product.screenshotBaseByLocale?.[locale] ?? product.screenshotBase;

  // Preload images whenever the active product changes
  useEffect(() => {
    setReady(false);

    // Include CTA screenshot paths in preload
    const ctaBase = product.screenshotBase;
    const extraPaths = product.ctaImage
      ? [`${ctaBase}/${product.ctaImage.sc1}`, `${ctaBase}/${product.ctaImage.sc2}`]
      : [];
    preloadImages([...getImagePathsForProduct(product), ...extraPaths]).then(() => setReady(true));

    // Reset locale and CTA selectors when product changes
    const locales = getProductLocales(product);
    if (!locales.find((l) => l.code === locale)) {
      setLocale(locales[0].code);
    }
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close product menu when clicking outside
  useEffect(() => {
    if (!productMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (productMenuRef.current && !productMenuRef.current.contains(e.target as Node)) {
        setProductMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [productMenuOpen]);

  // Reset selected size when device changes
  useEffect(() => {
    setSelectedSize(0);
  }, [activeDevice]);

  const exportAllScreenshots = useCallback(async () => {
    if (!ssOffscreenRef.current || exporting) return;
    setExporting(true);
    setProgress({ done: 0, total: slides.length });

    const exportSizes = selectedSize === -1
      ? [...sizes]
      : [sizes[selectedSize]];

    const resolvedSlides = slides.map((s) => ({
      ...s,
      copy: s.copyByLocale?.[locale] ?? s.copy,
    }));

    await exportAllToZip({
      container: ssOffscreenRef.current,
      slides: resolvedSlides.map((s) => ({ label: s.copy.label || s.id })),
      sizes: exportSizes,
      productId: product.id,
      multiProduct: PRODUCTS.length > 1,
      device: activeDevice,
      onProgress: (done, total) => setProgress({ done, total }),
    });

    setExporting(false);
    setProgress(null);
  }, [selectedSize, exporting, slides, locale, product.id, activeDevice, sizes]);

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: "#09090B", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A8A94", fontSize: 16, fontFamily: "inherit" }}>
        Loading images…
      </div>
    );
  }

  const deviceTabBtn = (d: "iphone" | "android", label: string) => (
    <button
      key={d}
      onClick={() => setDevice(d)}
      style={{
        background: device === d ? T.accent : "rgba(255,255,255,0.06)",
        color: device === d ? "#fff" : T.fgMuted,
        border: "none", borderRadius: 6, padding: "6px 14px",
        fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
        boxShadow: device === d ? `0 2px 10px ${T.accentGlow}` : "none",
      }}
    >
      {label}
    </button>
  );

  const exportBtnLabel = () => {
    if (progress) return `Exporting ${progress.done}/${progress.total}…`;
    return "Export ZIP";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", color: T.fg, fontFamily: "inherit" }}>

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(9,9,11,0.85)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Left: product dropdown trigger */}
        <div ref={productMenuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setProductMenuOpen((o) => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: productMenuOpen ? "rgba(255,255,255,0.08)" : "transparent",
              border: "1px solid",
              borderColor: productMenuOpen ? "rgba(255,255,255,0.14)" : "transparent",
              borderRadius: 10, padding: "6px 10px 6px 6px",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <img
              src={img(product.iconPath)}
              alt={product.name}
              style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span style={{ fontWeight: 700, fontSize: 16, color: T.fg, whiteSpace: "nowrap" }}>
              {product.name}
            </span>
            <svg
              width={14} height={14}
              viewBox="0 0 14 14" fill="none"
              style={{ marginLeft: 2, opacity: 0.5, flexShrink: 0, transform: productMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {productMenuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 200,
              background: "rgba(24,24,28,0.97)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
              padding: 6, minWidth: 220,
              boxShadow: "0 16px 60px rgba(0,0,0,0.6)",
              display: "flex", flexDirection: "column", gap: 2,
            }}>
              {PRODUCTS.map((p) => {
                const active = p.id === productId;
                return (
                  <button
                    key={p.id}
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
                    <img
                      src={img(p.iconPath)}
                      alt={p.name}
                      style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span style={{ fontSize: 14, fontWeight: active ? 700 : 500, color: active ? T.fg : "#9999a8", flex: 1 }}>
                      {p.name}
                    </span>
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

        {/* Center: device tabs (only when product has Android) */}
        {hasAndroid && (
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 8 }}>
            {deviceTabBtn("iphone", "iPhone")}
            {deviceTabBtn("android", "Android")}
          </div>
        )}

        {/* Center-right: language picker (when product has multiple locales) */}
        {getProductLocales(product).length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.fgMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Language
            </span>
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 8 }}>
              {getProductLocales(product).map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => setLocale(loc.code)}
                  style={{
                    background: locale === loc.code ? T.accent : "rgba(255,255,255,0.06)",
                    color: locale === loc.code ? "#fff" : T.fgMuted,
                    border: "none", borderRadius: 6,
                    padding: "5px 11px",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 5,
                    boxShadow: locale === loc.code ? `0 2px 10px ${T.accentGlow}` : "none",
                  }}
                >
                  {loc.flag && <span style={{ fontSize: 13 }}>{loc.flag}</span>}
                  {loc.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right: size picker + export */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(Number(e.target.value))}
            disabled={exporting}
            style={{ background: "rgba(255,255,255,0.06)", color: T.fg, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 500, cursor: exporting ? "wait" : "pointer", outline: "none", opacity: exporting ? 0.5 : 1 }}
          >
            {sizes.map((s, i) => (
              <option key={i} value={i}>{activeDevice === "iphone" ? "iPhone" : "Android"} {s.label} - {s.w}×{s.h}</option>
            ))}
            {sizes.length > 1 && (
              <option value={-1}>All sizes</option>
            )}
          </select>

          <button
            onClick={exportAllScreenshots}
            disabled={exporting}
            style={{
              position: "relative", overflow: "hidden",
              background: exporting ? T.accentSoft : `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`,
              color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px",
              fontSize: 14, fontWeight: 600, minWidth: 140,
              cursor: exporting ? "wait" : "pointer", transition: "all 0.2s",
              boxShadow: exporting ? "none" : `0 4px 20px ${T.accentGlow}`,
            }}
          >
            {progress && (
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${(progress.done / progress.total) * 100}%`,
                background: "rgba(255,255,255,0.15)",
                transition: "width 0.2s ease",
                pointerEvents: "none",
              }} />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>
              {exportBtnLabel()}
            </span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 1: SCREENSHOTS
         ══════════════════════════════════════════════════════ */}
      <div style={{ padding: "32px 24px 0", maxWidth: 1600, margin: "0 auto" }}>
        <SectionHeader
          title="Screenshots"
          subtitle={`${slides.length} slides · ${activeDevice === "iphone" ? "iPhone" : "Android"}`}
          accentColor={T.accent}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24, padding: "0 24px 40px",
          maxWidth: 1600, margin: "0 auto",
        }}
      >
        {slides.map((slide, i) => {
          const copy = slide.copyByLocale?.[locale] ?? slide.copy;
          return (
            <ScreenshotPreview
              key={`${product.id}-${activeDevice}-${slide.id}-${locale}`}
              index={i}
              label={copy.label || slide.id}
              exportRef={ssOffscreenRef}
              theme={T}
              productId={product.id}
              multiProduct={PRODUCTS.length > 1}
              device={activeDevice}
              selectedSize={selectedSize}
            >
              <slide.Component theme={T} base={screenshotBase} copy={copy} />
            </ScreenshotPreview>
          );
        })}
      </div>

      {/* Offscreen export container for screenshots */}
      <div ref={ssOffscreenRef} style={{ position: "absolute", left: -9999, top: 0, fontFamily: "inherit" }}>
        {slides.map((slide) => {
          const copy = slide.copyByLocale?.[locale] ?? slide.copy;
          return (
            <div
              key={`export-${product.id}-${activeDevice}-${slide.id}-${locale}`}
              style={{ width: canvasW, height: canvasH, position: "absolute", left: -9999, fontFamily: "inherit" }}
            >
              <slide.Component theme={T} base={screenshotBase} copy={copy} />
            </div>
          );
        })}
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          SECTION 2: FEATURE GRAPHIC
         ══════════════════════════════════════════════════════ */}
      <div style={{ padding: "32px 24px 0", maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          title="Feature Graphic"
          subtitle="Google Play Store banner · 1024×500"
          accentColor="#6EE7B7"
          right={
            <button
              onClick={async () => {
                if (!fgOffscreenRef.current) return;
                await exportSingle(fgOffscreenRef.current, 0, "feature-graphic", undefined, product.id, PRODUCTS.length > 1, "feature-graphic");
              }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6, padding: "5px 12px",
                fontSize: 12, fontWeight: 600, color: T.fgMuted,
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = T.fg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = T.fgMuted; }}
            >
              <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export PNG
            </button>
          }
        />
      </div>
      <div style={{ padding: "0 24px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          background: T.bg,
        }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: `${FG_W}/${FG_H}`, overflow: "hidden" }}>
            <FeatureGraphicScaled
              theme={T}
              iconPath={product.iconPath}
              tagline={product.featureGraphic?.tagline ?? product.name}
              subtitle={product.featureGraphic?.subtitle}
            />
          </div>
        </div>
      </div>

      {/* Offscreen export for Feature Graphic */}
      <div ref={fgOffscreenRef} style={{ position: "absolute", left: -9999, top: 0, fontFamily: "inherit" }}>
        <div style={{ width: FG_W, height: FG_H, position: "absolute", left: -9999, fontFamily: "inherit" }}>
          <FeatureGraphic
            theme={T}
            iconPath={product.iconPath}
            tagline={product.featureGraphic?.tagline ?? product.name}
            subtitle={product.featureGraphic?.subtitle}
          />
        </div>
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          SECTION 3: SOCIAL OG IMAGE
         ══════════════════════════════════════════════════════ */}
      <div style={{ padding: "32px 24px 0", maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          title="Social OG Image"
          subtitle="Open Graph / Twitter Card · 1200×630"
          accentColor="#60A5FA"
          right={
            <button
              onClick={async () => {
                if (!ogOffscreenRef.current) return;
                await exportSingle(ogOffscreenRef.current, 0, "social-og", undefined, product.id, PRODUCTS.length > 1, "social-og");
              }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6, padding: "5px 12px",
                fontSize: 12, fontWeight: 600, color: T.fgMuted,
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = T.fg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = T.fgMuted; }}
            >
              <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export PNG
            </button>
          }
        />
      </div>
      <div style={{ padding: "0 24px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          background: T.bg,
        }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: `${OG_W}/${OG_H}`, overflow: "hidden" }}>
            <SocialOgScaled
              theme={T}
              iconPath={product.iconPath}
              tagline={product.socialOg?.tagline ?? product.name}
              subtitle={product.socialOg?.subtitle}
              productName={product.name}
            />
          </div>
        </div>
      </div>

      {/* Offscreen export for Social OG */}
      <div ref={ogOffscreenRef} style={{ position: "absolute", left: -9999, top: 0, fontFamily: "inherit" }}>
        <div style={{ width: OG_W, height: OG_H, position: "absolute", left: -9999, fontFamily: "inherit" }}>
          <SocialOgImage
            theme={T}
            iconPath={product.iconPath}
            tagline={product.socialOg?.tagline ?? product.name}
            subtitle={product.socialOg?.subtitle}
            productName={product.name}
          />
        </div>
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          SECTION 4: CTA IMAGE
         ══════════════════════════════════════════════════════ */}
      <div style={{ padding: "32px 24px 0", maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          title="CTA Image"
          subtitle={`Social post · ${CTA_W}×${ctaH}`}
          accentColor="#F472B6"
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Screenshot selectors */}
              {(() => {
                const base = product.screenshotBase;
                const allSlides = product.slides.iphone;
                const scFiles = allSlides.map((_, i) => {
                  // derive filename from each slide component's slide index
                  // we just offer sc1..scN based on how many slides exist
                  const n = i + 1;
                  // detect prefix from ctaImage defaults
                  const defaultSc = product.ctaImage?.sc1 ?? "sc1.png";
                  const prefix = defaultSc.replace(/\d+\.png$/, "");
                  return `${prefix}${n}.png`;
                });
                const uniqueFiles = [...new Set([...(product.ctaImage ? [product.ctaImage.sc1, product.ctaImage.sc2] : []), ...scFiles])];
                return (
                  <>
                    <select
                      value={ctaSc1}
                      onChange={(e) => setCtaSc1(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.06)", color: T.fg, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}
                    >
                      {uniqueFiles.map((f) => (
                        <option key={f} value={f}>{f} (left)</option>
                      ))}
                    </select>
                    <select
                      value={ctaSc2}
                      onChange={(e) => setCtaSc2(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.06)", color: T.fg, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}
                    >
                      {uniqueFiles.map((f) => (
                        <option key={f} value={f}>{f} (right)</option>
                      ))}
                    </select>
                    {/* suppress unused warning — base used in JSX above */}
                    <span style={{ display: "none" }}>{base}</span>
                  </>
                );
              })()}
              {/* Ratio toggle */}
              <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: 3 }}>
                {(["1:1", "4:5"] as CtaRatio[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setCtaRatio(r)}
                    style={{
                      background: ctaRatio === r ? T.accent : "transparent",
                      color: ctaRatio === r ? "#fff" : T.fgMuted,
                      border: "none", borderRadius: 4, padding: "4px 10px",
                      fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                    }}
                  >{r}</button>
                ))}
              </div>
              <button
                onClick={async () => {
                  if (!ctaOffscreenRef.current) return;
                  await exportCtaImage(ctaOffscreenRef.current, CTA_W, ctaH, `${product.id}-cta-${CTA_W}x${ctaH}.png`);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6, padding: "5px 12px",
                  fontSize: 12, fontWeight: 600, color: T.fgMuted,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = T.fg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = T.fgMuted; }}
              >
                <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Export PNG
              </button>
            </div>
          }
        />
      </div>
      <div style={{ padding: "0 24px 40px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{
          borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          background: T.bg,
        }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: `${CTA_W}/${ctaH}`, overflow: "hidden" }}>
            <CtaImageScaled
              theme={T}
              iconPath={product.iconPath}
              screenshotBase={product.screenshotBase}
              sc1={ctaSc1}
              sc2={ctaSc2}
              headline={product.ctaImage?.headlineByLocale?.[locale] ?? product.ctaImage?.headline ?? product.name}
              productName={product.name}
              subheadline={product.metadataByLocale?.[locale]?.subtitle ?? product.metadata?.subtitle}
              ctaLabel={product.ctaImage?.ctaLabelByLocale?.[locale] ?? product.ctaImage?.ctaLabel}
              ratio={ctaRatio}
            />
          </div>
        </div>
      </div>

      {/* Offscreen export for CTA Image */}
      <div ref={ctaOffscreenRef} style={{ position: "absolute", top: 0, fontFamily: "inherit", pointerEvents: "none" }}>
        <div style={{ width: CTA_W, height: ctaH, position: "absolute", left: -9999, fontFamily: "inherit" }}>
          <CtaImage
            theme={T}
            iconPath={product.iconPath}
            screenshotBase={product.screenshotBase}
            sc1={ctaSc1}
            sc2={ctaSc2}
            headline={product.ctaImage?.headlineByLocale?.[locale] ?? product.ctaImage?.headline ?? product.name}
            productName={product.name}
            subheadline={product.metadataByLocale?.[locale]?.subtitle ?? product.metadata?.subtitle}
            ctaLabel={product.ctaImage?.ctaLabelByLocale?.[locale] ?? product.ctaImage?.ctaLabel}
            ratio={ctaRatio}
          />
        </div>
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          SECTION 5: STORE METADATA
         ══════════════════════════════════════════════════════ */}
      <MetadataPanel
        theme={T}
        locales={getProductLocales(product)}
        activeLocale={locale}
        onLocaleChange={setLocale}
        metadata={
          metadataMap[product.id]?.[locale] ??
          metadataMap[product.id]?.[getProductLocales(product)[0].code] ??
          { name: product.name, subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "" }
        }
        onUpdate={(updated) =>
          setMetadataMap((prev) => ({
            ...prev,
            [product.id]: { ...prev[product.id], [locale]: updated },
          }))
        }
        allLocaleData={metadataMap[product.id] ?? {}}
      />

    </div>
  );
}

/* ── Scaled preview wrappers (ResizeObserver-based) ────────── */
function FeatureGraphicScaled(props: React.ComponentProps<typeof FeatureGraphic>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setScale(entry.contentRect.width / FG_W);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{ width: FG_W, height: FG_H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        <FeatureGraphic {...props} />
      </div>
    </div>
  );
}

function SocialOgScaled(props: React.ComponentProps<typeof SocialOgImage>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setScale(entry.contentRect.width / OG_W);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{ width: OG_W, height: OG_H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        <SocialOgImage {...props} />
      </div>
    </div>
  );
}

function CtaImageScaled(props: React.ComponentProps<typeof CtaImage>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const h = props.ratio === "4:5" ? CTA_H_4x5 : CTA_H_1x1;

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setScale(entry.contentRect.width / CTA_W);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{ width: CTA_W, height: h, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        <CtaImage {...props} />
      </div>
    </div>
  );
}
