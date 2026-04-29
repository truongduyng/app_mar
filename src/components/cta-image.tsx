"use client";

import React from "react";
import { Sparkles, Star, Zap, Heart, Flame, Diamond, Plus, Circle } from "lucide-react";
import { img } from "@/lib/images";
import { MK_W, MK_H, SC_L, SC_T, SC_W, SC_H, SC_RX, SC_RY } from "@/lib/constants";
import type { ThemeTokens } from "@/lib/types";

export const CTA_W = 1080;
export const CTA_H_1x1 = 1080;
export const CTA_H_4x5 = 1350;
export type CtaRatio = "1:1" | "4:5";

/* ── Phone mockup (same measurements as ui.tsx Phone) ── */
function CtaPhone({
  src,
  alt,
  style,
  mockupPath = "/mockup.png",
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  mockupPath?: string;
}) {
  return (
    <div style={{ aspectRatio: `${MK_W}/${MK_H}`, position: "relative", ...style }}>
      <img
        src={img(mockupPath)}
        alt=""
        style={{ display: "block", width: "100%", height: "100%" }}
        draggable={false}
      />
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          overflow: "hidden",
          left: `${SC_L}%`,
          top: `${SC_T}%`,
          width: `${SC_W}%`,
          height: `${SC_H}%`,
          borderRadius: `${SC_RX}% / ${SC_RY}%`,
        }}
      >
        <img
          src={img(src)}
          alt={alt}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}

/* ── Squiggly underline SVG decoration ── */
function Squiggle({ color, width = 220 }: { color: string; width?: number }) {
  const h = 14;
  const freq = 8;
  const amp = 5;
  const points: string[] = [];
  for (let x = 0; x <= width; x += 2) {
    const y = h / 2 + Math.sin((x / width) * Math.PI * freq) * amp;
    points.push(`${x},${y}`);
  }
  return (
    <svg
      width={width}
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}

/* ── Floating decoration icon ── */
function DecoIcon({
  icon: Icon,
  size = 24,
  color,
  opacity = 0.7,
  rotate = 0,
  style,
}: {
  icon: React.ElementType;
  size?: number;
  color: string;
  opacity?: number;
  rotate?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: "absolute", pointerEvents: "none", opacity, transform: `rotate(${rotate}deg)`, ...style }}>
      <Icon size={size} color={color} fill={color} strokeWidth={0} />
    </div>
  );
}

export function CtaImage({
  theme: T,
  iconPath,
  screenshotBase,
  sc1,
  sc2,
  headline,
  subheadline,
  productName,
  ctaLabel = "↑ link in bio",
  mockupPath = "/mockup.png",
  ratio = "1:1",
}: {
  theme: ThemeTokens;
  iconPath: string;
  screenshotBase: string;
  sc1: string;
  sc2: string;
  headline: string;
  subheadline?: string;
  productName: string;
  ctaLabel?: string;
  mockupPath?: string;
  ratio?: CtaRatio;
}) {
  const ctaH = ratio === "4:5" ? CTA_H_4x5 : CTA_H_1x1;

  /* Phones are anchored at the bottom bar and sized to fill ~55% of canvas height.
     Phone aspect ratio MK_W/MK_H ≈ 0.491, so phoneW = phoneH * 0.491. */
  const phoneH = ctaH * 0.5;
  const phoneW = phoneH * (MK_W / MK_H);

  /* Layout zones */
  const headlineTop = ctaH * 0.02;
  const headlineH = ctaH * 0.20;       // headline: 2% → 22%
  const bottomBarH = ctaH * 0.3;      // bottom bar: 80% → 100%

  return (
    <div
      style={{
        width: CTA_W,
        height: ctaH,
        background: T.gradients.hero,
        position: "relative",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      {/* Soft radial glow behind phones */}
      <div
        style={{
          position: "absolute",
          width: CTA_W * 0.9,
          height: CTA_W * 0.9,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${hexToRgba(T.accent, 0.13)} 0%, transparent 70%)`,
          top: "35%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Decorative icons */}
      <DecoIcon icon={Sparkles}  size={28} color={T.accent} opacity={0.8}  style={{ top: "7%",   left: "5%",   zIndex: 1 }} />
      <DecoIcon icon={Star}      size={16} color={T.accent} opacity={0.55} style={{ top: "15%",  left: "12%",  zIndex: 1 }} />
      <DecoIcon icon={Plus}      size={20} color={T.fgMuted} opacity={0.35} rotate={15} style={{ top: "22%",  left: "4%",   zIndex: 1 }} />
      <DecoIcon icon={Zap}       size={22} color={T.accent} opacity={0.7}  style={{ top: "6%",   right: "6%",  zIndex: 1 }} />
      <DecoIcon icon={Star}      size={13} color={T.accent} opacity={0.5}  style={{ top: "14%",  right: "13%", zIndex: 1 }} />
      <DecoIcon icon={Diamond}   size={18} color={T.fgMuted} opacity={0.3}  rotate={20} style={{ top: "20%",  right: "5%",  zIndex: 1 }} />
      <DecoIcon icon={Heart}     size={20} color={T.accent} opacity={0.6}  style={{ bottom: "22%", left: "4%",   zIndex: 1 }} />
      <DecoIcon icon={Circle}    size={12} color={T.fgMuted} opacity={0.25} style={{ bottom: "28%", left: "11%",  zIndex: 1 }} />
      <DecoIcon icon={Flame}     size={22} color={T.accent} opacity={0.65} style={{ bottom: "21%", right: "5%",  zIndex: 1 }} />
      <DecoIcon icon={Plus}      size={14} color={T.fgMuted} opacity={0.3}  rotate={30} style={{ bottom: "27%", right: "12%", zIndex: 1 }} />

      {/* ── Headline zone: top 7%–33% ── */}
      <div
        style={{
          position: "absolute",
          top: headlineTop,
          left: CTA_W * 0.07,
          right: CTA_W * 0.07,
          height: headlineH,
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            fontSize: CTA_W * 0.06,
            fontWeight: 800,
            color: T.fg,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            textAlign: "center",
          }}
        >
          {headline}
        </div>
        <Squiggle color={T.accent} width={CTA_W * 0.28} />
      </div>

      {/* ── Phones zone: 30% → 80% of canvas height ── */}
      {/* ── Phones: anchored at bottom bar, overflow upward behind headline ── */}
      {/* Left phone: slightly behind, tilted left */}
      <CtaPhone
        src={`${screenshotBase}/${sc1}`}
        alt="Screenshot 1"
        mockupPath={mockupPath}
        style={{
          position: "absolute",
          bottom: bottomBarH,
          left: CTA_W * 0.5 - phoneW * 1.2, // 0.86 is empirically determined to create a nice overlap
          width: phoneW,
          transform: "rotate(-5deg) translateY(4%)",
          zIndex: 2,
          filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.22))",
        }}
      />
      {/* Right phone: front, upright */}
      <CtaPhone
        src={`${screenshotBase}/${sc2}`}
        alt="Screenshot 2"
        mockupPath={mockupPath}
        style={{
          position: "absolute",
          bottom: bottomBarH,
          right: CTA_W * 0.5 - phoneW - phoneW * 0.07,
          width: phoneW,
          transform: "rotate(5deg) translateY(0%)",
          zIndex: 2,
          filter: "drop-shadow(0 32px 60px rgba(0,0,0,0.28))",
        }}
      />

      {/* ── Bottom bar: app name + CTA button ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: bottomBarH,
          zIndex: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: ctaH * 0.022,
          paddingBottom: ctaH * 0.032,
          background: `linear-gradient(transparent, ${T.bg}F0 28%)`,
        }}
      >
        {/* App icon + name + subheadline */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src={img(iconPath)}
            alt=""
            style={{
              width: CTA_W * 0.054,
              height: CTA_W * 0.054,
              borderRadius: CTA_W * 0.012,
              boxShadow: `0 4px 16px ${hexToRgba(T.accent, 0.35)}`,
            }}
            draggable={false}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div
              style={{
                fontSize: CTA_W * 0.04,
                fontWeight: 800,
                color: T.accent,
                letterSpacing: "-0.015em",
                lineHeight: 1.1,
              }}
            >
              {productName}
            </div>
            {subheadline && (
              <div
                style={{
                  fontSize: CTA_W * 0.028,
                  fontWeight: 500,
                  color: T.fgMuted,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                {subheadline}
              </div>
            )}
          </div>
        </div>

        {/* CTA pill */}
        <div
          style={{
            background: T.accent,
            borderRadius: 100,
            padding: `${ctaH * 0.01}px ${CTA_W * 0.1}px`,
            fontSize: CTA_W * 0.03,
            fontWeight: 700,
            color: T.bg,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            boxShadow: `0 4px 20px ${hexToRgba(T.accent, 0.4)}`,
          }}
        >
          {ctaLabel}
        </div>
      </div>
    </div>
  );
}

/* ── Color helpers ───────────────────────────────────────── */

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

