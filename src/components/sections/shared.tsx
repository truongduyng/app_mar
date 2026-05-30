import React from "react";
import type { ThemeTokens } from "@/lib/types";

type ExportPngButtonProps = {
  theme: ThemeTokens;
  onClick: () => void;
  style?: React.CSSProperties;
};

export function isLightTheme(T: ThemeTokens) {
  return T.bg === "#F6F7FB" || T.fg === "#17171C";
}

export function sectionChrome(T: ThemeTokens) {
  const light = isLightTheme(T);
  return {
    light,
    controlBg: light ? "#FFFFFF" : "rgba(255,255,255,0.06)",
    controlBgSoft: light ? "#E4E7EC" : "rgba(255,255,255,0.04)",
    controlHover: light ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.1)",
    inputBg: light ? "#FFFFFF" : "rgba(0,0,0,0.25)",
    panelBg: light ? "#FFFFFF" : "#111114",
    overlayBg: light ? "rgba(15,23,42,0.34)" : "rgba(0,0,0,0.7)",
    border: light ? "#C4CAD4" : "rgba(255,255,255,0.1)",
    borderSoft: light ? "#D0D5DD" : "rgba(255,255,255,0.08)",
    borderFaint: light ? "#D0D5DD" : "rgba(255,255,255,0.06)",
    textFaint: light ? "#667085" : "#555",
    shadow: light ? "0 24px 64px rgba(15,23,42,0.2)" : "0 32px 80px rgba(0,0,0,0.8)",
    previewShadow: light ? "0 16px 40px rgba(15,23,42,0.12)" : "none",
  };
}

export function ExportPngButton({ theme: T, onClick, style }: ExportPngButtonProps) {
  const chrome = sectionChrome(T);
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        background: chrome.controlBg,
        border: `1px solid ${chrome.border}`,
        borderRadius: 6, padding: "5px 12px",
        fontSize: 12, fontWeight: 700, color: chrome.light ? "#475467" : T.fgMuted,
        cursor: "pointer", transition: "all 0.15s",
        boxShadow: chrome.light ? "0 1px 2px rgba(15,23,42,0.08)" : "none",
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = chrome.controlHover;
        (e.currentTarget as HTMLButtonElement).style.color = T.fg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = chrome.controlBg;
        (e.currentTarget as HTMLButtonElement).style.color = T.fgMuted;
      }}
    >
      <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
        <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Export PNG
    </button>
  );
}
