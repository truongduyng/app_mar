"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  IPHONE_SIZES, IPHONE_W, IPHONE_H,
  ANDROID_W, ANDROID_H, ANDROID_SIZES,
} from "@/lib/constants";
import { exportAllToZip } from "@/lib/export";
import { ScreenshotPreview } from "@/components/ui";
import type { AppPlatform, ProductConfig, ThemeTokens } from "@/lib/types";

type Props = {
  product: ProductConfig;
  locale: string;
  multiProduct: boolean;
  platform: AppPlatform;
};

export function ScreenshotsSection({ product, locale, multiProduct, platform }: Props) {
  const T: ThemeTokens = product.theme;
  const offscreenRef = useRef<HTMLDivElement>(null);

  const [selectedSize, setSelectedSize] = useState(0);
  const [exporting, setExporting]       = useState(false);
  const [progress, setProgress]         = useState<{ done: number; total: number } | null>(null);

  const activeSlides = product.slidesByLocale?.[locale] ?? product.slides;
  const activeDevice = platform === "android" && activeSlides.android?.length ? "android" : "iphone";
  const slides       = (activeDevice === "android" ? activeSlides.android : activeSlides.iphone) ?? [];
  const sizes        = activeDevice === "android" ? ANDROID_SIZES : IPHONE_SIZES;
  const canvasW      = activeDevice === "android" ? ANDROID_W : IPHONE_W;
  const canvasH      = activeDevice === "android" ? ANDROID_H : IPHONE_H;
  const screenshotBase = product.screenshotBaseByLocale?.[locale] ?? product.screenshotBase;

  useEffect(() => { setSelectedSize(0); }, [activeDevice]);

  const handleExport = async () => {
    if (!offscreenRef.current || exporting) return;
    setExporting(true);
    setProgress({ done: 0, total: slides.length });
    const exportSizes    = selectedSize === -1 ? [...sizes] : [sizes[selectedSize]];
    const resolvedSlides = slides.map((s) => ({ ...s, copy: s.copyByLocale?.[locale] ?? s.copy }));
    await exportAllToZip({
      container: offscreenRef.current,
      slides: resolvedSlides.map((s) => ({ label: s.copy.label || s.id })),
      sizes: exportSizes,
      productId: product.id,
      multiProduct,
      device: activeDevice,
      onProgress: (done, total) => setProgress({ done, total }),
    });
    setExporting(false);
    setProgress(null);
  };

  return (
    <div style={{ padding: "24px 24px 32px", maxWidth: 1600, margin: "0 auto" }}>
      {/* Toolbar row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <select value={selectedSize} onChange={(e) => setSelectedSize(Number(e.target.value))} disabled={exporting}
          style={{ background: "rgba(255,255,255,0.06)", color: T.fg, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 10px", fontSize: 12, fontWeight: 500, cursor: exporting ? "wait" : "pointer", outline: "none", opacity: exporting ? 0.5 : 1 }}>
          {sizes.map((s, i) => (
            <option key={i} value={i}>{activeDevice === "iphone" ? "iPhone" : "Android"} {s.label} · {s.w}×{s.h}</option>
          ))}
          {sizes.length > 1 && <option value={-1}>All sizes</option>}
        </select>
        <button onClick={handleExport} disabled={exporting}
          style={{
            position: "relative", overflow: "hidden",
            background: exporting ? T.accentSoft : `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`,
            color: "#fff", border: "none", borderRadius: 7, padding: "7px 18px",
            fontSize: 13, fontWeight: 600, minWidth: 120,
            cursor: exporting ? "wait" : "pointer", transition: "all 0.2s",
            boxShadow: exporting ? "none" : `0 4px 20px ${T.accentGlow}`,
          }}>
          {progress && (
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${(progress.done / progress.total) * 100}%`,
              background: "rgba(255,255,255,0.15)", transition: "width 0.2s ease", pointerEvents: "none",
            }} />
          )}
          <span style={{ position: "relative", zIndex: 1 }}>
            {progress ? `${progress.done}/${progress.total}…` : "Export All"}
          </span>
        </button>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 220px))",
        justifyContent: "center",
        gap: 24,
      }}>
        {slides.map((slide, i) => {
          const copy = slide.copyByLocale?.[locale] ?? slide.copy;
          return (
            <ScreenshotPreview
              key={`${product.id}-${activeDevice}-${slide.id}-${locale}`}
              index={i}
              label={copy.label || slide.id}
              exportRef={offscreenRef}
              theme={T}
              productId={product.id}
              multiProduct={multiProduct}
              device={activeDevice}
              selectedSize={selectedSize}
            >
              <slide.Component theme={T} base={screenshotBase} copy={copy} />
            </ScreenshotPreview>
          );
        })}
      </div>

      {/* Offscreen export container */}
      <div ref={offscreenRef} style={{ position: "absolute", left: -9999, top: 0, fontFamily: "inherit" }}>
        {slides.map((slide) => {
          const copy = slide.copyByLocale?.[locale] ?? slide.copy;
          return (
            <div key={`export-${product.id}-${activeDevice}-${slide.id}-${locale}`}
              style={{ width: canvasW, height: canvasH, position: "absolute", left: -9999, fontFamily: "inherit" }}>
              <slide.Component theme={T} base={screenshotBase} copy={copy} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
