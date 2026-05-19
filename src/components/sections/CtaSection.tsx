"use client";

import React, { useRef, useEffect, useState } from "react";
import { CtaImage, CTA_W, CTA_H_1x1, CTA_H_4x5, type CtaRatio } from "@/components/cta-image";
import { exportCtaImage } from "@/lib/export";
import type { AppPlatform, ProductConfig } from "@/lib/types";
import { ExportPngButton } from "./shared";

type Props = {
  product: ProductConfig;
  locale: string;
  platform: AppPlatform;
  ctaSc1: string;
  ctaSc2: string;
  ctaHeadline?: string;
  onSc1Change: (v: string) => void;
  onSc2Change: (v: string) => void;
  onHeadlineChange?: (v: string) => void;
  onHeadlineSave?: () => Promise<boolean>;
};

export function CtaSection({
  product,
  locale,
  platform,
  ctaSc1,
  ctaSc2,
  ctaHeadline,
  onSc1Change,
  onSc2Change,
  onHeadlineChange,
  onHeadlineSave,
}: Props) {
  const T = product.theme;
  const offscreenRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<CtaRatio>("4:5");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const ctaH = ratio === "4:5" ? CTA_H_4x5 : CTA_H_1x1;

  const localizedSlides = product.slidesByLocale?.[locale] ?? product.slides;
  const allSlides = platform === "android" && localizedSlides.android?.length
    ? localizedSlides.android
    : localizedSlides.iphone;
  const slideImagePaths = allSlides.map((s) => s.imagePath).filter(Boolean) as string[];
  const uniquePaths     = [...new Set(slideImagePaths)];

  const headline = ctaHeadline ?? product.ctaImage?.headlineByLocale?.[locale] ?? product.ctaImage?.headline ?? product.name;
  const subheadline = product.metadataByLocale?.[locale]?.subtitle ?? product.metadata?.subtitle;
  const ctaLabel    = product.ctaImage?.ctaLabelByLocale?.[locale] ?? product.ctaImage?.ctaLabel;

  const selectStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)", color: T.fg,
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
    padding: "5px 10px", fontSize: 12, cursor: "pointer",
  };

  async function handleSaveHeadline() {
    if (!onHeadlineSave) return;
    setSaveState("saving");
    try {
      const ok = await onHeadlineSave();
      setSaveState(ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
    window.setTimeout(() => setSaveState("idle"), 2000);
  }

  return (
    <div style={{ padding: "24px 24px 32px", maxWidth: 620, margin: "0 auto" }}>
      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={ctaSc1} onChange={(e) => onSc1Change(e.target.value)} style={selectStyle}>
          {uniquePaths.map((p) => <option key={p} value={p}>{p.split("/").pop()} (left)</option>)}
        </select>
        <select value={ctaSc2} onChange={(e) => onSc2Change(e.target.value)} style={selectStyle}>
          {uniquePaths.map((p) => <option key={p} value={p}>{p.split("/").pop()} (right)</option>)}
        </select>
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: 3 }}>
          {(["1:1", "4:5"] as CtaRatio[]).map((r) => (
            <button key={r} onClick={() => setRatio(r)}
              style={{
                background: ratio === r ? T.accent : "transparent",
                color: ratio === r ? "#fff" : T.fgMuted,
                border: "none", borderRadius: 4, padding: "4px 10px",
                fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}>{r}</button>
          ))}
        </div>
        <ExportPngButton theme={T} style={{ marginLeft: "auto" }} onClick={async () => {
          if (!offscreenRef.current) return;
          await exportCtaImage(offscreenRef.current, CTA_W, ctaH, `${product.id}-cta-${CTA_W}x${ctaH}.png`);
        }} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={headline}
          onChange={(e) => onHeadlineChange?.(e.target.value)}
          placeholder="CTA headline"
          style={{
            flex: 1,
            minWidth: 0,
            background: "rgba(255,255,255,0.06)",
            color: T.fg,
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 13,
            outline: "none",
            opacity: onHeadlineChange ? 1 : 0.6,
          }}
          disabled={!onHeadlineChange}
        />
        {onHeadlineSave && (
          <button
            onClick={handleSaveHeadline}
            disabled={saveState === "saving"}
            style={{
              background: saveState === "saved" ? T.accent : "rgba(255,255,255,0.06)",
              color: saveState === "saved" ? "#fff" : T.fg,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: saveState === "saving" ? "default" : "pointer",
              opacity: saveState === "saving" ? 0.7 : 1,
              minWidth: 72,
            }}
          >
            {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveState === "error" ? "Retry" : "Save"}
          </button>
        )}
      </div>

      {/* Preview */}
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: T.bg }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: `${CTA_W}/${ctaH}`, overflow: "hidden" }}>
          <ScaledCtaImage theme={T} iconPath={product.iconPath}
            sc1Path={ctaSc1} sc2Path={ctaSc2} headline={headline} productName={product.name}
            subheadline={subheadline} ratio={ratio} />
        </div>
      </div>

      {/* Offscreen */}
      <div ref={offscreenRef} style={{ position: "fixed", top: 0, fontFamily: "inherit", pointerEvents: "none" }}>
        <div style={{ width: CTA_W, height: ctaH, position: "absolute", left: -9999, fontFamily: "inherit" }}>
          <CtaImage theme={T} iconPath={product.iconPath}
            sc1Path={ctaSc1} sc2Path={ctaSc2} headline={headline} productName={product.name}
            subheadline={subheadline} ratio={ratio} />
        </div>
      </div>
    </div>
  );
}

function ScaledCtaImage(props: React.ComponentProps<typeof CtaImage>) {
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
