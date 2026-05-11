"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  MK_W, MK_H, SC_L, SC_T, SC_W, SC_H, SC_RX, SC_RY,
  IPHONE_W, IPHONE_H, ANDROID_W, ANDROID_H,
  FG_W, FG_H, OG_W, OG_H,
  IPHONE_SIZES, ANDROID_SIZES, FG_SIZES, OG_SIZES,
} from "@/lib/constants";
import { img } from "@/lib/images";
import { exportSingle } from "@/lib/export";
import type { ThemeTokens } from "@/lib/types";

type DeviceType = "iphone" | "android" | "feature-graphic" | "social-og";

/* ── Phone ──────────────────────────────────────────────── */
export function Phone({
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
        {src && (
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
        )}
      </div>
    </div>
  );
}

/* ── AndroidPhone (CSS-only) ────────────────────── */
export function AndroidPhone({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", aspectRatio: "9/19.5", ...style }}>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: "8% / 4%",
        background: "linear-gradient(160deg, #2a2a2e 0%, #18181b 100%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.55)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Punch-hole camera */}
        <div style={{
          position: "absolute", top: "1.5%", left: "50%",
          transform: "translateX(-50%)", width: "3%", height: "1.4%",
          borderRadius: "50%", background: "#0d0d0f",
          border: "1px solid rgba(255,255,255,0.06)", zIndex: 20,
        }} />
        {/* Screen */}
        <div style={{
          position: "absolute", left: "3.5%", top: "2%",
          width: "93%", height: "96%",
          borderRadius: "5.5% / 2.6%", overflow: "hidden", background: "#000",
        }}>
          {src && <img src={img(src)} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} draggable={false} />}
        </div>
      </div>
    </div>
  );
}

/* ── Caption ────────────────────────────────────────────── */
export function Caption({
  label,
  headline,
  canvasW,
  align = "center",
  style,
  theme,
}: {
  label: string;
  headline: React.ReactNode;
  canvasW: number;
  align?: "center" | "left";
  style?: React.CSSProperties;
  theme: ThemeTokens;
}) {
  return (
    <div style={{ textAlign: align, ...style }}>
      <div
        style={{
          fontSize: canvasW * 0.088,
          fontWeight: 700,
          color: theme.fg,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        {headline}
      </div>
    </div>
  );
}

/* ── OrbGlow ────────────────────────────────────────────── */
export function OrbGlow({
  color,
  size = 600,
  top,
  left,
  right,
  bottom,
}: {
  color: string;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(80px)",
        top,
        left,
        right,
        bottom,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ── GridPattern ────────────────────────────────────────── */
export function GridPattern({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ── DiagonalLine ───────────────────────────────────────── */
export function DiagonalLine({
  top,
  left,
  width = 400,
  rotate = -30,
  opacity = 0.08,
  accentColor,
}: {
  top: string;
  left: string;
  width?: number;
  rotate?: number;
  opacity?: number;
  accentColor: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        opacity,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "left center",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

/* ── Helper to get canvas dimensions by device type ────── */
function getCanvasDimsForDevice(device: DeviceType) {
  switch (device) {
    case "android":         return { cW: ANDROID_W, cH: ANDROID_H };
    case "feature-graphic": return { cW: FG_W,      cH: FG_H };
    case "social-og":       return { cW: OG_W,      cH: OG_H };
    default:                return { cW: IPHONE_W,  cH: IPHONE_H };
  }
}

function getSizesForDevice(device: DeviceType) {
  switch (device) {
    case "android":         return ANDROID_SIZES;
    case "feature-graphic": return FG_SIZES;
    case "social-og":       return OG_SIZES;
    default:                return IPHONE_SIZES;
  }
}

/* ── ScreenshotPreview ─────────────────────────── */
export function ScreenshotPreview({
  children,
  index,
  label,
  exportRef,
  theme,
  productId,
  multiProduct,
  device = "iphone",
  selectedSize = 0,
}: {
  children: React.ReactNode;
  index: number;
  label: string;
  exportRef: React.RefObject<HTMLDivElement | null>;
  theme: ThemeTokens;
  productId: string;
  multiProduct: boolean;
  device?: DeviceType;
  selectedSize?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  const { cW: canvasW, cH: canvasH } = getCanvasDimsForDevice(device);
  const sizes = getSizesForDevice(device);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScale(entry.contentRect.width / canvasW);
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [canvasW]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          aspectRatio: `${canvasW}/${canvasH}`,
          position: "relative",
          overflow: "hidden",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          background: theme.bg,
        }}
      >
        <div
          style={{
            width: canvasW,
            height: canvasH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {children}
        </div>
      </div>
      {/* Label + export button row */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 8, paddingInline: 2,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: theme.fgMuted,
            fontWeight: 500,
          }}
        >
          {String(index + 1).padStart(2, "0")} - {label}
        </div>
        <button
          onClick={async () => {
            if (!exportRef.current) return;
            const sizeEntry = sizes[Math.max(0, selectedSize)];
            await exportSingle(exportRef.current, index, label, sizeEntry, productId, multiProduct, device);
          }}
          title={`Export "${label}"`}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6, padding: "4px 10px",
            fontSize: 12, fontWeight: 600, color: theme.fgMuted,
            cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = theme.fg;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLButtonElement).style.color = theme.fgMuted;
          }}
        >
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
}
