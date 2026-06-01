"use client";

import React, { useRef, useEffect, useState } from "react";
import { useProduct } from "@/components/ProductContext";
import { FG_W, FG_H } from "@/lib/constants";
import { exportSingle } from "@/lib/export";
import { FeatureGraphic } from "@/components/feature-graphic";
import { ExportPngButton } from "@/components/sections/shared";

export default function FeatureGraphicPage() {
  const { product, multiProduct, locale, productId } = useProduct();
  const T = product.theme;
  const offscreenRef = useRef<HTMLDivElement>(null);

  const [tagline, setTagline] = useState(product.featureGraphic?.tagline ?? product.name);
  const [subtitle, setSubtitle] = useState(product.featureGraphic?.subtitle ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTagline(product.featureGraphic?.tagline ?? product.name);
    setSubtitle(product.featureGraphic?.subtitle ?? "");
  }, [product]);

  async function save() {
    setSaving(true);
    await fetch("/api/feature-graphic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        locale,
        tagline,
        subtitle: subtitle || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle = (fontSize: number): React.CSSProperties => ({
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8,
    color: T.fg,
    fontSize,
    fontWeight: fontSize >= 20 ? 700 : 400,
    padding: "8px 12px",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
  });

  return (
    <div style={{ padding: "24px 24px 32px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            background: saved ? T.accent + "33" : "rgba(255,255,255,0.1)",
            border: `1px solid ${saved ? T.accent : "rgba(255,255,255,0.15)"}`,
            borderRadius: 8,
            color: saved ? T.accent : T.fg,
            fontSize: 13,
            fontWeight: 600,
            padding: "7px 16px",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </button>
        <ExportPngButton theme={T} onClick={async () => {
          if (!offscreenRef.current) return;
          await exportSingle(offscreenRef.current, 0, "feature-graphic", undefined, product.id, multiProduct, "feature-graphic");
        }} />
      </div>

      {/* Text editors */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        <input
          value={tagline}
          onChange={e => setTagline(e.target.value)}
          placeholder="Tagline"
          style={inputStyle(20)}
        />
        <input
          value={subtitle}
          onChange={e => setSubtitle(e.target.value)}
          placeholder="Subtitle (optional)"
          style={inputStyle(14)}
        />
      </div>

      {/* Preview */}
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: T.bg }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: `${FG_W}/${FG_H}`, overflow: "hidden" }}>
          <ScaledFeatureGraphic theme={T} iconPath={product.iconPath}
            tagline={tagline || product.name}
            subtitle={subtitle || undefined} />
        </div>
      </div>

      {/* Offscreen */}
      <div ref={offscreenRef} style={{ position: "absolute", left: -9999, top: 0, fontFamily: "inherit" }}>
        <div style={{ width: FG_W, height: FG_H, position: "absolute", left: -9999, fontFamily: "inherit" }}>
          <FeatureGraphic theme={T} iconPath={product.iconPath}
            tagline={tagline || product.name}
            subtitle={subtitle || undefined} />
        </div>
      </div>
    </div>
  );
}

function ScaledFeatureGraphic(props: React.ComponentProps<typeof FeatureGraphic>) {
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
