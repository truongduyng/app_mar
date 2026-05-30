"use client";

import React, { useRef, useEffect, useState } from "react";
import { useProduct } from "@/components/ProductContext";
import { OG_W, OG_H } from "@/lib/constants";
import { exportSingle } from "@/lib/export";
import { SocialOgImage } from "@/components/social-og";
import { ExportPngButton } from "@/components/sections/shared";

export default function SocialOgPage() {
  const { product, multiProduct } = useProduct();
  const T = product.theme;
  const offscreenRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ padding: "24px 24px 32px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <ExportPngButton theme={T} onClick={async () => {
          if (!offscreenRef.current) return;
          await exportSingle(offscreenRef.current, 0, "social-og", undefined, product.id, multiProduct, "social-og");
        }} />
      </div>
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: T.bg }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: `${OG_W}/${OG_H}`, overflow: "hidden" }}>
          <ScaledSocialOg theme={T} iconPath={product.iconPath}
            tagline={product.socialOg?.tagline ?? product.name}
            subtitle={product.socialOg?.subtitle}
            productName={product.name} />
        </div>
      </div>
      {/* Offscreen */}
      <div ref={offscreenRef} style={{ position: "absolute", left: -9999, top: 0, fontFamily: "inherit" }}>
        <div style={{ width: OG_W, height: OG_H, position: "absolute", left: -9999, fontFamily: "inherit" }}>
          <SocialOgImage theme={T} iconPath={product.iconPath}
            tagline={product.socialOg?.tagline ?? product.name}
            subtitle={product.socialOg?.subtitle}
            productName={product.name} />
        </div>
      </div>
    </div>
  );
}

function ScaledSocialOg(props: React.ComponentProps<typeof SocialOgImage>) {
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
