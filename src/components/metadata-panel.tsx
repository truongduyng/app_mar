"use client";

import { useState, useCallback } from "react";
import type { AppPlatform, ThemeTokens, MetadataConfig, LocaleDef } from "@/lib/types";

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

type SaveState = "idle" | "saving" | "saved" | "error";
type PublishState = "idle" | "publishing" | "published" | "error";

export function MetadataPanel({
  theme: T,
  platform,
  locales,
  activeLocale,
  metadata,
  productId,
  bundleId,
  packageName,
  onUpdate,
  allLocaleData,
}: {
  theme: ThemeTokens;
  platform: AppPlatform;
  locales: LocaleDef[];
  activeLocale: string;
  metadata: MetadataConfig;
  productId: string;
  bundleId?: string;
  packageName?: string;
  onUpdate: (updated: MetadataConfig) => void;
  /** All locale data for JSON export - { [locale]: MetadataConfig } */
  allLocaleData: Record<string, MetadataConfig>;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [appleState, setAppleState] = useState<PublishState>("idle");
  const [googleState, setGoogleState] = useState<PublishState>("idle");
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [publishWarnings, setPublishWarnings] = useState<string[]>([]);
  const [localBundleId, setLocalBundleId] = useState(bundleId ?? "");
  const [localPackageName, setLocalPackageName] = useState(packageName ?? "");
  const isFieldVisible = useCallback(
    (field: FieldDef) => (
      field.platform === "Both" ||
      (platform === "iphone" && field.platform === "Apple") ||
      (platform === "android" && field.platform === "Google")
    ),
    [platform]
  );
  const visibleFields = FIELDS.filter(isFieldVisible);

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
    const text = visibleFields.map((f) => `${f.label}:\n${metadata[f.id]}`).join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedId("__all__");
    setTimeout(() => setCopiedId(null), 1500);
  }, [metadata, visibleFields]);

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    try {
      const [metaRes, idsRes] = await Promise.all([
        fetch("/api/metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, locale: activeLocale, metadata }),
        }),
        fetch("/api/product-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, bundleId: localBundleId, packageName: localPackageName }),
        }),
      ]);
      setSaveState(metaRes.ok && idsRes.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
    setTimeout(() => setSaveState("idle"), 2000);
  }, [productId, activeLocale, metadata, localBundleId, localPackageName]);

  const handlePublish = useCallback(async (store: "apple" | "google") => {
    const setState = store === "apple" ? setAppleState : setGoogleState;
    setState("publishing");
    setPublishErrors([]);
    setPublishWarnings([]);
    try {
      const res = await fetch(`/api/publish/${store}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, locale: activeLocale }),
      });
      const data = await res.json();
      if (data.warnings?.length) setPublishWarnings(data.warnings);
      if (res.ok && data.ok) {
        setState("published");
      } else {
        setPublishErrors(data.errors ?? [data.error ?? "Unknown error"]);
        setState("error");
      }
    } catch (e: unknown) {
      setPublishErrors([e instanceof Error ? e.message : String(e)]);
      setState("error");
    }
    setTimeout(() => setState("idle"), 4000);
  }, [productId]);

  const handleExportJson = useCallback(async () => {
    const pickVisibleFields = (entry: MetadataConfig) =>
      Object.fromEntries(visibleFields.map((field) => [field.id, entry[field.id]])) as MetadataConfig;

    // Export all locales, not just the active one
    const exportData = Object.keys(allLocaleData).length > 1
      ? Object.fromEntries(Object.entries(allLocaleData).map(([localeCode, entry]) => [localeCode, pickVisibleFields(entry)]))
      : { [activeLocale]: pickVisibleFields(metadata) };

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
  }, [metadata, allLocaleData, activeLocale, visibleFields]);

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
              background: "rgba(255,255,255,0.06)",
              color: T.fgMuted,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Export JSON
          </button>
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            style={{
              background: saveState === "error"
                ? "#EF4444"
                : `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: saveState === "saving" ? "not-allowed" : "pointer",
              boxShadow: `0 4px 16px ${T.accentGlow}`,
              opacity: saveState === "saving" ? 0.7 : 1,
              transition: "all 0.15s",
            }}
          >
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Error" : "Save"}
          </button>

          {localBundleId && (
            <button
              onClick={() => handlePublish("apple")}
              disabled={appleState === "publishing"}
              title="Publish all locales to App Store Connect"
              style={{
                background: appleState === "error" ? "#EF4444" : appleState === "published" ? "#22C55E" : "rgba(255,255,255,0.07)",
                color: appleState === "idle" ? T.fgMuted : "#fff",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: appleState === "publishing" ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: appleState === "publishing" ? 0.7 : 1,
                transition: "all 0.15s",
              }}
            >
              {/* Apple logo */}
              <svg width={13} height={13} viewBox="0 0 814 1000" fill="currentColor">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.8 133.4-317.7 264.8-317.7 60.5 0 110.8 39.7 148.2 39.7 35.5 0 91.7-42.1 160.9-42.1 28.7 0 108.2 2.6 168.7 100.5zm-234.5-191.1c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
              </svg>
              {appleState === "publishing" ? "Publishing…" : appleState === "published" ? "Published!" : appleState === "error" ? "Failed" : "Publish"}
            </button>
          )}

          {localPackageName && (
            <button
              onClick={() => handlePublish("google")}
              disabled={googleState === "publishing"}
              title="Publish all locales to Google Play"
              style={{
                background: googleState === "error" ? "#EF4444" : googleState === "published" ? "#22C55E" : "rgba(255,255,255,0.07)",
                color: googleState === "idle" ? T.fgMuted : "#fff",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: googleState === "publishing" ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: googleState === "publishing" ? 0.7 : 1,
                transition: "all 0.15s",
              }}
            >
              {/* Google Play triangle */}
              <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5c.5.3.5 1.2 0 1.5l-14 8.5c-.5.3-1.5.3-1.5-.5z"/>
              </svg>
              {googleState === "publishing" ? "Publishing…" : googleState === "published" ? "Published!" : googleState === "error" ? "Failed" : "Publish Google"}
            </button>
          )}
        </div>
      </div>

      {/* Publish error details */}
      {publishErrors.length > 0 && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#EF4444", marginBottom: 6 }}>
            Publishing errors:
          </div>
          {publishErrors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: "#FCA5A5", fontFamily: "monospace", lineHeight: 1.6 }}>
              {e}
            </div>
          ))}
        </div>
      )}

      {/* Publish warnings */}
      {publishWarnings.length > 0 && (
        <div
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F59E0B", marginBottom: 6 }}>
            Published with warnings:
          </div>
          {publishWarnings.map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: "#FCD34D", lineHeight: 1.6 }}>
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Store ID config */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: "18px 22px",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: T.fgMuted, marginBottom: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Store Identifiers
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, color: T.fgMuted, marginBottom: 6 }}>
              Apple Bundle ID
            </div>
            <input
              type="text"
              value={localBundleId}
              onChange={(e) => setLocalBundleId(e.target.value)}
              placeholder="com.example.myapp"
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: T.fg,
                fontFamily: "monospace",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, color: T.fgMuted, marginBottom: 6 }}>
              Google Play Package Name
            </div>
            <input
              type="text"
              value={localPackageName}
              onChange={(e) => setLocalPackageName(e.target.value)}
              placeholder="com.example.myapp"
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: T.fg,
                fontFamily: "monospace",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Field cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {visibleFields.map((field) => {
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
