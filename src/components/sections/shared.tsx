import React from "react";
import type { ThemeTokens } from "@/lib/types";

type ExportPngButtonProps = {
  theme: ThemeTokens;
  onClick: () => void;
  style?: React.CSSProperties;
};

export function ExportPngButton({ theme: T, onClick, style }: ExportPngButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 6, padding: "5px 12px",
        fontSize: 12, fontWeight: 600, color: T.fgMuted,
        cursor: "pointer", transition: "all 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
        (e.currentTarget as HTMLButtonElement).style.color = T.fg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
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
