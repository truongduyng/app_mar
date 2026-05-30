"use client";

import React, { useRef, useEffect, useState } from "react";
import { useProduct } from "@/components/ProductContext";
import { CtaImage, CTA_W, CTA_H_1x1, CTA_H_4x5, type CtaRatio } from "@/components/cta-image";
import { exportCtaImage } from "@/lib/export";
import { ExportPngButton, sectionChrome } from "@/components/sections/shared";
import { toast } from "sonner";

export default function CtaPage() {
  const { product, locale, platform, ctaSc1, ctaSc2, ctaHeadline, setCtaSc1, setCtaSc2, setCtaHeadline, saveCtaHeadline } = useProduct();
  const T = product.theme;
  const chrome = sectionChrome(T);
  const offscreenRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<CtaRatio>("4:5");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const ctaH = ratio === "4:5" ? CTA_H_4x5 : CTA_H_1x1;

  const localizedSlides = product.slidesByLocale?.[locale] ?? product.slides;
  const allSlides = platform === "android" && localizedSlides.android?.length
    ? localizedSlides.android
    : localizedSlides.iphone;
  const uniquePaths = [...new Set(allSlides.map((s) => s.imagePath).filter(Boolean) as string[])];

  const headline = ctaHeadline ?? product.ctaImage?.headlineByLocale?.[locale] ?? product.ctaImage?.headline ?? product.name;
  const subheadline = product.metadataByLocale?.[locale]?.subtitle ?? product.metadata?.subtitle;

  const controlText = chrome.light ? "#1D2939" : T.fg;
  const inputBg = chrome.light ? "#FFFFFF" : "rgba(255,255,255,0.1)";
  const inputBorder = chrome.light ? "#C4CAD4" : "rgba(255,255,255,0.2)";
  const ratioToggleBg = chrome.light ? "#E4E7EC" : "rgba(255,255,255,0.04)";
  const ratioToggleBorder = chrome.light ? "#C4CAD4" : "rgba(255,255,255,0.08)";

  const selectWrapStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: 8,
    height: 34,
    maxWidth: 210,
    boxShadow: chrome.light ? "0 1px 3px rgba(15,23,42,0.1)" : "inset 0 1px 0 rgba(255,255,255,0.06)",
  };

  const selectStyle: React.CSSProperties = {
    appearance: "none",
    WebkitAppearance: "none",
    background: "transparent",
    color: controlText,
    border: "none",
    outline: "none",
    width: "100%",
    height: "100%",
    padding: "0 28px 0 12px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  };

  async function handleSave() {
    setSaveState("saving");
    try {
      const ok = await saveCtaHeadline();
      setSaveState(ok ? "saved" : "error");
      if (ok) toast.success("CTA headline saved");
      else toast.error("Failed to save CTA headline");
    } catch (e) {
      setSaveState("error");
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
    window.setTimeout(() => setSaveState("idle"), 2000);
  }

  return (
    <div style={{ padding: "24px 24px 32px", maxWidth: 680, margin: "0 auto" }}>
      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        {([{ value: ctaSc1, onChange: setCtaSc1, label: "left" }, { value: ctaSc2, onChange: setCtaSc2, label: "right" }] as const).map(({ value, onChange, label }) => (
          <div key={label} style={selectWrapStyle}>
            <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
              {uniquePaths.map((p) => <option key={p} value={p}>{p.split("/").pop()} ({label})</option>)}
            </select>
            <svg style={{ position: "absolute", right: 8, pointerEvents: "none" }} width={12} height={12} viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke={chrome.light ? "#667085" : "#aaa"} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, height: 34, background: ratioToggleBg, borderRadius: 8, padding: 3, border: `1px solid ${ratioToggleBorder}` }}>
          {(["1:1", "4:5"] as CtaRatio[]).map((r) => (
            <button key={r} onClick={() => setRatio(r)} style={{
              background: ratio === r ? T.accent : "transparent",
              color: ratio === r ? "#fff" : controlText,
              border: "none", borderRadius: 6, minWidth: 42, padding: "0 10px",
              fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
            }}>{r}</button>
          ))}
        </div>
        <ExportPngButton theme={T} style={{ marginLeft: "auto", height: 34, borderRadius: 8, padding: "0 14px", fontSize: 13 }} onClick={async () => {
          if (!offscreenRef.current) return;
          await exportCtaImage(offscreenRef.current, CTA_W, ctaH, `${product.id}-cta-${CTA_W}x${ctaH}.png`);
          toast.success("CTA image exported");
        }} />
      </div>

      {/* Headline row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={headline}
          onChange={(e) => setCtaHeadline(e.target.value)}
          placeholder="CTA headline"
          style={{
            flex: 1, minWidth: 0, background: inputBg, color: controlText,
            border: `1px solid ${inputBorder}`, borderRadius: 8, height: 36,
            padding: "0 14px", fontSize: 13, fontWeight: 500, outline: "none",
            boxShadow: chrome.light ? "0 1px 3px rgba(15,23,42,0.12)" : "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        />
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          style={{
            background: saveState === "saved" ? "#16A34A" : saveState === "error" ? "#DC2626" : T.accent,
            color: "#fff", border: "none", borderRadius: 8, height: 36, padding: "0 16px",
            fontSize: 13, fontWeight: 600, cursor: saveState === "saving" ? "default" : "pointer",
            opacity: saveState === "saving" ? 0.65 : 1, minWidth: 80,
            boxShadow: saveState === "saving" ? "none" : "0 1px 3px rgba(0,0,0,0.18)",
            transition: "background 0.15s, opacity 0.15s",
          }}
        >
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : saveState === "error" ? "Retry" : "Save"}
        </button>
      </div>

      {/* Preview */}
      <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${chrome.borderSoft}`, background: T.bg, boxShadow: chrome.previewShadow }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: `${CTA_W}/${ctaH}`, overflow: "hidden" }}>
          <ScaledCtaImage theme={T} iconPath={product.iconPath}
            sc1Path={ctaSc1} sc2Path={ctaSc2} headline={headline} productName={product.name}
            subheadline={subheadline} ratio={ratio} />
        </div>
      </div>

      {/* Offscreen export */}
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
