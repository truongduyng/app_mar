"use client";

import { useState, useCallback } from "react";
import type { ThemeTokens, MetadataConfig, LocaleDef } from "@/lib/types";

type FieldDef = {
  id: keyof MetadataConfig;
  label: string;
  platform: string;
  maxLength: number;
  multiline: boolean;
  placeholder: string;
};

const FIELDS: FieldDef[] = [
  { id: "name",             label: "App Name",                       platform: "Both",   maxLength: 30,   multiline: false, placeholder: "e.g. Lịch Ta" },
  { id: "subtitle",         label: "App Store Subtitle",             platform: "Apple",  maxLength: 30,   multiline: false, placeholder: "e.g. Vietnamese Lunar Calendar" },
  { id: "promoText",        label: "Promotional Text",               platform: "Apple",  maxLength: 170,  multiline: true,  placeholder: "Current promo or highlight - can be updated without new release" },
  { id: "shortDescription", label: "Short Description",              platform: "Google", maxLength: 80,   multiline: false, placeholder: "One-line summary shown in search results" },
  { id: "keywords",         label: "Keywords",                       platform: "Apple",  maxLength: 100,  multiline: false, placeholder: "comma,separated,keywords" },
  { id: "description",      label: "Full Description",               platform: "Both",   maxLength: 4000, multiline: true,  placeholder: "Full app description for store listing..." },
];

export function MetadataPanel({
  theme: T,
  locales,
  activeLocale,
  metadata,
  onUpdate,
  allLocaleData,
}: {
  theme: ThemeTokens;
  locales: LocaleDef[];
  activeLocale: string;
  metadata: MetadataConfig;
  onUpdate: (updated: MetadataConfig) => void;
  /** All locale data for JSON export - { [locale]: MetadataConfig } */
  allLocaleData: Record<string, MetadataConfig>;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback(async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const handleChange = useCallback(
    (id: keyof MetadataConfig, value: string) => {
      onUpdate({ ...metadata, [id]: value });
    },
    [metadata, onUpdate]
  );

  const handleCopyAll = useCallback(async () => {
    const text = FIELDS.map((f) => `${f.label}:\n${metadata[f.id]}`).join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedId("__all__");
    setTimeout(() => setCopiedId(null), 1500);
  }, [metadata]);

  const handleExportJson = useCallback(async () => {
    // Export all locales, not just the active one
    const exportData = Object.keys(allLocaleData).length > 1
      ? allLocaleData
      : { [activeLocale]: metadata };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "store-metadata.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [metadata, allLocaleData, activeLocale]);

  const showLocaleTabs = locales.length > 1;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.fg }}>
            Store Metadata
          </div>
          <div style={{ fontSize: 14, color: T.fgMuted, marginTop: 4 }}>
            Edit your app listing text. Changes are saved per session.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleCopyAll}
            style={{
              background: "rgba(255,255,255,0.06)",
              color: copiedId === "__all__" ? T.accent : T.fgMuted,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {copiedId === "__all__" ? (
              <>
                <svg width={13} height={13} viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied All
              </>
            ) : (
              <>
                <svg width={13} height={13} viewBox="0 0 12 12" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={1.2} />
                  <path d="M9 3V2.5A1.5 1.5 0 0 0 7.5 1H2.5A1.5 1.5 0 0 0 1 2.5V7.5A1.5 1.5 0 0 0 2.5 9H3" stroke="currentColor" strokeWidth={1.2} />
                </svg>
                Copy All
              </>
            )}
          </button>
          <button
            onClick={handleExportJson}
            style={{
              background: `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 4px 16px ${T.accentGlow}`,
              transition: "all 0.15s",
            }}
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Field cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {FIELDS.map((field) => {
          const value = metadata[field.id];
          const charCount = value.length;
          const isOver = charCount > field.maxLength;
          const pct = Math.min(100, (charCount / field.maxLength) * 100);

          return (
            <div
              key={field.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "20px 22px",
                transition: "border-color 0.15s",
              }}
            >
              {/* Label row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.fg }}>
                    {field.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background:
                        field.platform === "Apple"
                          ? "rgba(59,130,246,0.12)"
                          : field.platform === "Google"
                          ? "rgba(52,211,153,0.12)"
                          : "rgba(168,85,247,0.12)",
                      color:
                        field.platform === "Apple"
                          ? "#60A5FA"
                          : field.platform === "Google"
                          ? "#6EE7B7"
                          : "#C084FC",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {field.platform}
                  </span>
                  {/* Locale badge */}
                  {showLocaleTabs && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.05)",
                        color: T.fgMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {activeLocale}
                    </span>
                  )}
                </div>

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(field.id, value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: copiedId === field.id ? T.accent : T.fgMuted,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {copiedId === field.id ? (
                    <>
                      <svg width={11} height={11} viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg width={11} height={11} viewBox="0 0 12 12" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={1.2} />
                        <path d="M9 3V2.5A1.5 1.5 0 0 0 7.5 1H2.5A1.5 1.5 0 0 0 1 2.5V7.5A1.5 1.5 0 0 0 2.5 9H3" stroke="currentColor" strokeWidth={1.2} />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Input */}
              {field.multiline ? (
                <textarea
                  value={value}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.id === "description" ? 8 : 3}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.25)",
                    border: `1px solid ${isOver ? "#EF4444" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 14,
                    color: T.fg,
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                    transition: "border-color 0.15s",
                    lineHeight: 1.6,
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    if (!isOver)
                      (e.target as HTMLTextAreaElement).style.borderColor = `${T.accent}66`;
                  }}
                  onBlur={(e) => {
                    if (!isOver)
                      (e.target as HTMLTextAreaElement).style.borderColor =
                        "rgba(255,255,255,0.06)";
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.25)",
                    border: `1px solid ${isOver ? "#EF4444" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 14,
                    color: T.fg,
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "border-color 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    if (!isOver)
                      (e.target as HTMLInputElement).style.borderColor = `${T.accent}66`;
                  }}
                  onBlur={(e) => {
                    if (!isOver)
                      (e.target as HTMLInputElement).style.borderColor =
                        "rgba(255,255,255,0.06)";
                  }}
                />
              )}

              {/* Character counter bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                {/* Progress bar */}
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 2,
                    overflow: "hidden",
                    marginRight: 12,
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: isOver
                        ? "#EF4444"
                        : pct > 85
                        ? "#F59E0B"
                        : T.accent,
                      borderRadius: 2,
                      transition: "width 0.2s, background 0.2s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: isOver ? "#EF4444" : T.fgMuted,
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {charCount}/{field.maxLength}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
