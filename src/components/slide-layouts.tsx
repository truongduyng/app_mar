"use client";

import React, { type ReactNode } from "react";
import { IPHONE_W, IPHONE_H, ANDROID_W, ANDROID_H } from "@/lib/constants";
import { Phone, AndroidPhone, Caption, OrbGlow } from "@/components/ui";
import type { ThemeTokens } from "@/lib/types";

/* ── Shared types ─────────────────────────────────────────── */
export type Platform = "iphone" | "android";
export type SlideProps = {
  theme: ThemeTokens;
  imagePath: string;
  copy: import("@/lib/types").SlideCopy;
};
export type OrbDef = {
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  color: string;
};

/* ── Platform helpers ─────────────────────────────────────── */
export function dims(p: Platform) {
  return p === "iphone"
    ? { W: IPHONE_W, H: IPHONE_H }
    : { W: ANDROID_W, H: ANDROID_H };
}

export function PhoneFrame({
  platform,
  ...rest
}: {
  platform: Platform;
  src: string;
  alt: string;
  style?: React.CSSProperties;
}) {
  return platform === "iphone" ? (
    <Phone {...rest} />
  ) : (
    <AndroidPhone {...rest} />
  );
}

/** Scale orb sizes for the smaller Android canvas */
export function scaleOrbs(orbs: OrbDef[], platform: Platform): OrbDef[] {
  if (platform === "iphone") return orbs;
  return orbs.map((o) => ({ ...o, size: Math.round(o.size * 0.82) }));
}

/* ── Decoration helpers ───────────────────────────────────── */
export function DotGrid({
  color = "rgba(255,255,255,0.06)",
  gap = "52px",
}: {
  color?: string;
  gap?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${color} 1px, transparent 0)`,
        backgroundSize: `${gap} ${gap}`,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export function Rings({
  sizes,
  color = "rgba(255,255,255,0.07)",
  fadeStep = 0.018,
}: {
  sizes: number[];
  color?: string;
  fadeStep?: number;
}) {
  // Extract base opacity from the color or use 0.07
  const baseOpacity = parseFloat(color.split(",").pop()?.replace(")", "") ?? "0.07");
  return (
    <>
      {sizes.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: s,
            height: s,
            borderRadius: "50%",
            border: `1px solid ${color.replace(
              String(baseOpacity),
              String(Math.max(0, baseOpacity - i * fadeStep))
            )}`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}

export function AccentLine({
  canvasW,
  accentColor,
  bottom = "5%",
  opacity = 0.45,
}: {
  canvasW: number;
  accentColor: string;
  bottom?: string;
  opacity?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom,
        left: "50%",
        transform: "translateX(-50%)",
        width: canvasW * 0.3,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        opacity,
        zIndex: 4,
        borderRadius: 2,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────
   LAYOUT COMPONENTS
───────────────────────────────────────────────────────────────── */

/**
 * Centered layout: caption centered at top, single phone below.
 * Used for hero, detail, and single-phone showcase slides.
 */
export function CenteredSlide({
  theme: T,
  imagePath,
  platform = "iphone",
  gradient,
  orbs,
  decoration,
  label,
  headline,
  alt,
  phoneWidth,
  phoneTy,
  captionMt,
  extras,
  fadeH = "8%",
}: {
  theme: ThemeTokens;
  imagePath: string;
  platform?: Platform;
  gradient: string;
  orbs: OrbDef[];
  decoration?: ReactNode;
  label: string;
  headline: ReactNode;
  alt: string;
  phoneWidth?: string;
  phoneTy?: string;
  captionMt?: number;
  extras?: ReactNode;
  fadeH?: string;
}) {
  const { W, H } = dims(platform);
  const isIP = platform === "iphone";
  const scaled = scaleOrbs(orbs, platform);
  const pw = phoneWidth ?? (isIP ? "82%" : "58%");
  const ty = phoneTy ?? (isIP ? "-5%" : "-7%");
  const mt = 0.05;

  return (
    <div
      style={{
        width: W,
        height: H,
        background: gradient,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "inherit",
      }}
    >
      {scaled.map((o, i) => (
        <OrbGlow key={i} {...o} />
      ))}
      {decoration}

      <div style={{ zIndex: 2, position: "relative", marginTop: H * mt }}>
        <Caption label={label} headline={headline} canvasW={W} theme={T} />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: `translateX(-50%) translateY(${ty})`,
          width: pw,
          zIndex: 2,
        }}
      >
        <PhoneFrame
          platform={platform}
          src={imagePath}
          alt={alt}
        />
      </div>
      {extras}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: fadeH,
          background: `linear-gradient(transparent, ${T.bg})`,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/**
 * Side layout: caption left-aligned, phone(s) passed as children.
 * Used for dual-phone and side-phone slides.
 */
export function SideSlide({
  theme: T,
  platform = "iphone",
  gradient,
  orbs,
  decoration,
  label,
  headline,
  phones,
  captionMt,
  fadeH = "6%",
}: {
  theme: ThemeTokens;
  imagePath: string;
  platform?: Platform;
  gradient: string;
  orbs: OrbDef[];
  decoration?: ReactNode;
  label: string;
  headline: ReactNode;
  phones: ReactNode;
  captionMt?: number;
  fadeH?: string;
}) {
  const { W, H } = dims(platform);
  const isIP = platform === "iphone";
  const scaled = scaleOrbs(orbs, platform);
  const px = W * (isIP ? 0.08 : 0.07);

  return (
    <div
      style={{
        width: W,
        height: H,
        background: gradient,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "inherit",
      }}
    >
      {scaled.map((o, i) => (
        <OrbGlow key={i} {...o} />
      ))}
      {decoration}
      {phones}

      <div
        style={{
          zIndex: 5,
          position: "relative",
          marginTop: H * (captionMt ?? (isIP ? 0.05 : 0.05)),
          paddingLeft: px,
          paddingRight: px,
        }}
      >
        <Caption
          label={label}
          headline={headline}
          canvasW={W}
          align="left"
          theme={T}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: fadeH,
          background: `linear-gradient(transparent, ${T.bg})`,
          zIndex: 6,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
