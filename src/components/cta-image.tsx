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
  sc1Path,
  sc2Path,
  headline,
  subheadline,
  productName,
  mockupPath = "/mockup.png",
  ratio = "1:1",
}: {
  theme: ThemeTokens;
  iconPath: string;
  sc1Path: string;
  sc2Path: string;
  headline: string;
  subheadline?: string;
  productName: string;
  mockupPath?: string;
  ratio?: CtaRatio;
}) {
  const ctaH = ratio === "4:5" ? CTA_H_4x5 : CTA_H_1x1;

  /* Phone aspect ratio MK_W/MK_H ≈ 0.491 */
  const bottomBarH = ctaH * 0.22;
  const headlineH = ctaH * 0.18;
  const headlineTop = ctaH * 0.035;
  /* Phones fill the middle — top of phone = bottom of headline zone */
  const phoneTop = headlineTop + headlineH + ctaH * 0.035;
  const phoneH = ctaH - bottomBarH - phoneTop;
  const phoneW = phoneH * (MK_W / MK_H);

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
            fontSize: CTA_W * 0.05,
            fontWeight: 400,
            color: T.fg,
            lineHeight: 1.12,
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
        src={sc1Path}
        alt="Screenshot 1"
        mockupPath={mockupPath}
        style={{
          position: "absolute",
          top: phoneTop,
          left: CTA_W * 0.5 - phoneW * 1.1,
          width: phoneW,
          transform: "rotate(-6deg)",
          zIndex: 2,
          filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.22))",
        }}
      />
      {/* Right phone: front, upright */}
      <CtaPhone
        src={sc2Path}
        alt="Screenshot 2"
        mockupPath={mockupPath}
        style={{
          position: "absolute",
          top: phoneTop,
          right: CTA_W * 0.5 - phoneW * 1.2,
          width: phoneW,
          transform: "rotate(5deg)",
          zIndex: 3,
          filter: "drop-shadow(0 32px 60px rgba(0,0,0,0.28))",
        }}
      />

      {/* ── Bottom bar: app identity ── */}
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
          gap: ctaH * 0.012,
          paddingBottom: ctaH * 0.04,
          background: `linear-gradient(transparent, ${T.bg}F0 28%)`,
        }}
      >
        {/* App icon + name + subheadline */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src={img(iconPath)}
            alt=""
            style={{
              width: CTA_W * 0.08,
              height: CTA_W * 0.08,
              borderRadius: CTA_W * 0.018,
              boxShadow: `0 4px 16px ${hexToRgba(T.accent, 0.35)}`,
            }}
            draggable={false}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div
              style={{
                fontSize: CTA_W * 0.03,
                fontWeight: 600,
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
