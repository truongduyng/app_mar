"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  IPHONE_SIZES, IPHONE_W, IPHONE_H,
  ANDROID_W, ANDROID_H, ANDROID_SIZES,
} from "@/lib/constants";
import { exportAllToZip, captureAllAsBase64 } from "@/lib/export";
import { ScreenshotPreview } from "@/components/ui";
import { segmentsToMarkup, markupToSegments, renderRichText } from "@/lib/rich-text";
import type { RichTextSegment } from "@/lib/rich-text";
import type { AppPlatform, ProductConfig, ThemeTokens, SlideCopy } from "@/lib/types";

type Props = {
  product: ProductConfig;
  locale: string;
  multiProduct: boolean;
  platform: AppPlatform;
};

type CopyEdit = { label: string; headline: string; subtitle: string };
type SaveState = "idle" | "saving" | "saved" | "error";

/** Convert a SlideCopy (headline/subtitle may be React.ReactNode or RichTextSegment[]) to editable markup strings */
function copyToEdit(copy: SlideCopy): CopyEdit {
  const toMarkup = (v: React.ReactNode): string => {
    if (Array.isArray(v)) return segmentsToMarkup(v as RichTextSegment[]);
    if (typeof v === "string") return v;
    return "";
  };
  return {
    label: copy.label,
    headline: toMarkup(copy.headline),
    subtitle: toMarkup(copy.subtitle),
  };
}

/** Build a SlideCopy from markup strings for live preview */
function editToCopy(edit: CopyEdit, accentColor: string): SlideCopy {
  return {
    label: edit.label,
    headline: renderRichText(markupToSegments(edit.headline), accentColor),
    subtitle: renderRichText(markupToSegments(edit.subtitle), accentColor),
  };
}

export function ScreenshotsSection({ product, locale, multiProduct, platform }: Props) {
  const T: ThemeTokens = product.theme;
  const offscreenRef = useRef<HTMLDivElement>(null);

  const [selectedSize, setSelectedSize] = useState(0);
  const [exporting, setExporting]       = useState(false);
  const [progress, setProgress]         = useState<{ done: number; total: number } | null>(null);

  type PublishState = "idle" | "capturing" | "uploading" | "done" | "error";
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [publishError, setPublishError] = useState<string | null>(null);

  // Copy editing state
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [copyEdits, setCopyEdits] = useState<Record<string, CopyEdit>>({}); // slideId → edit
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const activeSlides   = product.slidesByLocale?.[locale] ?? product.slides;
  const activeDevice   = platform === "android" && activeSlides.android?.length ? "android" : "iphone";
  const slides         = (activeDevice === "android" ? activeSlides.android : activeSlides.iphone) ?? [];
  const sizes          = activeDevice === "android" ? ANDROID_SIZES : IPHONE_SIZES;
  const canvasW        = activeDevice === "android" ? ANDROID_W : IPHONE_W;
  const canvasH        = activeDevice === "android" ? ANDROID_H : IPHONE_H;
  const screenshotBase = product.screenshotBaseByLocale?.[locale] ?? product.screenshotBase;

  // Reset selections when product/locale/device changes
  useEffect(() => { setSelectedSize(0); setSelectedSlideId(null); }, [activeDevice]);
  useEffect(() => { setSelectedSlideId(null); setCopyEdits({}); }, [product.id, locale]);

  const selectedSlide = selectedSlideId ? slides.find((s) => s.id === selectedSlideId) : null;
  const selectedIndex = selectedSlideId ? slides.findIndex((s) => s.id === selectedSlideId) : -1;

  /** Get the effective copy for a slide (edited > locale > default) */
  const getEffectiveCopy = useCallback((slideId: string, baseCopy: SlideCopy): SlideCopy => {
    const edit = copyEdits[slideId];
    if (!edit) return baseCopy;
    return editToCopy(edit, T.accent);
  }, [copyEdits, T.accent]);

  const handleSlideClick = useCallback(async (slideId: string, baseCopy: SlideCopy) => {
    if (selectedSlideId === slideId) {
      setSelectedSlideId(null);
      return;
    }
    setSelectedSlideId(slideId);
    setSaveState("idle");
    // If already edited in this session, keep the in-progress edits
    if (copyEdits[slideId]) return;
    // Try to load saved copy from DB; fall back to current copy
    try {
      const res = await fetch(`/api/slide-copy?productId=${encodeURIComponent(product.id)}&slideKey=${encodeURIComponent(slideId)}&locale=${encodeURIComponent(locale)}`);
      const data = res.ok ? await res.json() : null;
      if (data?.label !== undefined) {
        setCopyEdits((prev) => ({
          ...prev,
          [slideId]: {
            label: data.label,
            headline: segmentsToMarkup(data.headline ?? []),
            subtitle: segmentsToMarkup(data.subtitle ?? []),
          },
        }));
        return;
      }
    } catch { /* ignore, fall back */ }
    setCopyEdits((prev) => ({ ...prev, [slideId]: copyToEdit(baseCopy) }));
  }, [selectedSlideId, copyEdits, product.id, locale]);

  const handleCopyChange = useCallback((slideId: string, field: keyof CopyEdit, value: string) => {
    setCopyEdits((prev) => ({ ...prev, [slideId]: { ...prev[slideId], [field]: value } }));
  }, []);

  const handleSaveCopy = useCallback(async (slideId: string) => {
    const edit = copyEdits[slideId];
    if (!edit) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/slide-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          slideKey:  slideId,
          locale,
          label:     edit.label,
          headline:  markupToSegments(edit.headline),
          subtitle:  markupToSegments(edit.subtitle),
        }),
      });
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
    setTimeout(() => setSaveState("idle"), 2000);
  }, [copyEdits, product.id, locale]);

  const handlePublishScreenshots = async () => {
    if (!offscreenRef.current || publishState !== "idle") return;
    setPublishError(null);
    setPublishState("capturing");
    const resolvedSlides = slides.map((s) => {
      const base = s.copyByLocale?.[locale] ?? s.copy;
      return { ...s, copy: getEffectiveCopy(s.id, base) };
    });
    try {
      const captured = await captureAllAsBase64(
        offscreenRef.current,
        resolvedSlides.map((s) => ({ label: s.copy.label || s.id })),
        activeDevice,
        (done, total) => setProgress({ done, total }),
      );
      setProgress(null);
      setPublishState("uploading");
      const res = await fetch("/api/publish/apple/screenshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, locale, slides: captured }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPublishState("done");
      } else {
        setPublishError(data.error ?? data.detail ?? "Upload failed");
        setPublishState("error");
      }
    } catch (e: unknown) {
      setPublishError(e instanceof Error ? e.message : String(e));
      setPublishState("error");
    }
    setTimeout(() => { setPublishState("idle"); setProgress(null); }, 5000);
  };

  const handleExport = async () => {
    if (!offscreenRef.current || exporting) return;
    setExporting(true);
    setProgress({ done: 0, total: slides.length });
    const exportSizes    = selectedSize === -1 ? [...sizes] : [sizes[selectedSize]];
    const resolvedSlides = slides.map((s) => {
      const base = s.copyByLocale?.[locale] ?? s.copy;
      return { ...s, copy: getEffectiveCopy(s.id, base) };
    });
    await exportAllToZip({
      container: offscreenRef.current,
      slides: resolvedSlides.map((s) => ({ label: s.copy.label || s.id })),
      sizes: exportSizes,
      productId: product.id,
      multiProduct,
      device: activeDevice,
      onProgress: (done, total) => setProgress({ done, total }),
    });
    setExporting(false);
    setProgress(null);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    color: T.fg,
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical" as const,
    boxSizing: "border-box",
    lineHeight: 1.5,
  };

  return (
    <div style={{ padding: "24px 24px 32px", maxWidth: 1600, margin: "0 auto" }}>
      {/* Toolbar row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <select value={selectedSize} onChange={(e) => setSelectedSize(Number(e.target.value))} disabled={exporting}
          style={{ background: "rgba(255,255,255,0.06)", color: T.fg, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 10px", fontSize: 12, fontWeight: 500, cursor: exporting ? "wait" : "pointer", outline: "none", opacity: exporting ? 0.5 : 1 }}>
          {sizes.map((s, i) => (
            <option key={i} value={i}>{activeDevice === "iphone" ? "iPhone" : "Android"} {s.label} · {s.w}×{s.h}</option>
          ))}
          {sizes.length > 1 && <option value={-1}>All sizes</option>}
        </select>
        {activeDevice === "iphone" && product.bundleId && (
          <button
            onClick={handlePublishScreenshots}
            disabled={publishState !== "idle" || exporting}
            title="Capture slides and upload to App Store Connect"
            style={{
              background: publishState === "error" ? "#EF4444" : publishState === "done" ? "#22C55E" : "rgba(255,255,255,0.07)",
              color: publishState === "idle" ? T.fgMuted : "#fff",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 7, padding: "7px 14px", fontSize: 13, fontWeight: 600,
              cursor: publishState !== "idle" ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
              opacity: publishState !== "idle" && publishState !== "done" && publishState !== "error" ? 0.7 : 1,
              transition: "all 0.15s",
            }}
          >
            <svg width={13} height={13} viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.8 133.4-317.7 264.8-317.7 60.5 0 110.8 39.7 148.2 39.7 35.5 0 91.7-42.1 160.9-42.1 28.7 0 108.2 2.6 168.7 100.5zm-234.5-191.1c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            {publishState === "capturing" ? `Capturing ${progress ? `${progress.done}/${progress.total}` : ""}…`
              : publishState === "uploading" ? "Uploading…"
              : publishState === "done" ? "Uploaded!"
              : publishState === "error" ? "Failed"
              : "Publish Screenshots"}
          </button>
        )}
        <button onClick={handleExport} disabled={exporting}
          style={{
            position: "relative", overflow: "hidden",
            background: exporting ? T.accentSoft : `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`,
            color: "#fff", border: "none", borderRadius: 7, padding: "7px 18px",
            fontSize: 13, fontWeight: 600, minWidth: 120,
            cursor: exporting ? "wait" : "pointer", transition: "all 0.2s",
            boxShadow: exporting ? "none" : `0 4px 20px ${T.accentGlow}`,
          }}>
          {progress && exporting && (
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${(progress.done / progress.total) * 100}%`,
              background: "rgba(255,255,255,0.15)", transition: "width 0.2s ease", pointerEvents: "none",
            }} />
          )}
          <span style={{ position: "relative", zIndex: 1 }}>
            {progress && exporting ? `${progress.done}/${progress.total}…` : "Export All"}
          </span>
        </button>
      </div>

      {/* Screenshot publish error */}
      {publishError && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#FCA5A5", fontFamily: "monospace" }}>
          {publishError}
        </div>
      )}

      {/* Slide grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 220px))",
        justifyContent: "center",
        gap: 24,
      }}>
        {slides.map((slide, i) => {
          const baseCopy = slide.copyByLocale?.[locale] ?? slide.copy;
          const copy = getEffectiveCopy(slide.id, baseCopy);
          const isSelected = selectedSlideId === slide.id;
          return (
            <div
              key={`${product.id}-${activeDevice}-${slide.id}-${locale}`}
              onClick={() => handleSlideClick(slide.id, baseCopy)}
              style={{
                cursor: "pointer",
                borderRadius: 14,
                outline: isSelected ? `2px solid ${T.accent}` : "2px solid transparent",
                outlineOffset: 4,
                transition: "outline-color 0.15s",
              }}
            >
              <ScreenshotPreview
                index={i}
                label={copy.label || slide.id}
                exportRef={offscreenRef}
                theme={T}
                productId={product.id}
                multiProduct={multiProduct}
                device={activeDevice}
                selectedSize={selectedSize}
              >
                <slide.Component theme={T} base={screenshotBase} copy={copy} />
              </ScreenshotPreview>
            </div>
          );
        })}
      </div>

      {/* Copy editor panel */}
      {selectedSlide && selectedIndex >= 0 && (() => {
        const edit = copyEdits[selectedSlide.id];
        if (!edit) return null;
        return (
          <div style={{
            marginTop: 32,
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${T.accent}44`,
            borderRadius: 14,
            padding: "20px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.fg }}>
                  Edit Slide {selectedIndex + 1} Copy
                </div>
                <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 2 }}>
                  Use <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4 }}>**text**</code> for accent color,{" "}
                  <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4 }}>\n</code> for line break
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setSelectedSlideId(null)}
                  style={{ background: "rgba(255,255,255,0.06)", color: T.fgMuted, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Close
                </button>
                <button
                  onClick={() => handleSaveCopy(selectedSlide.id)}
                  disabled={saveState === "saving"}
                  style={{
                    background: saveState === "saved" ? "#22C55E" : saveState === "error" ? "#EF4444" : `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`,
                    color: "#fff", border: "none", borderRadius: 8, padding: "7px 18px",
                    fontSize: 13, fontWeight: 600, cursor: saveState === "saving" ? "not-allowed" : "pointer",
                    boxShadow: `0 4px 16px ${T.accentGlow}`, opacity: saveState === "saving" ? 0.7 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved!" : saveState === "error" ? "Error" : "Save"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: T.fgMuted, marginBottom: 6, fontWeight: 600 }}>Label</div>
                <input
                  type="text"
                  value={edit.label}
                  onChange={(e) => handleCopyChange(selectedSlide.id, "label", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: T.fgMuted, marginBottom: 6, fontWeight: 600 }}>Headline</div>
                <textarea
                  value={edit.headline}
                  onChange={(e) => handleCopyChange(selectedSlide.id, "headline", e.target.value)}
                  rows={3}
                  style={inputStyle}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: T.fgMuted, marginBottom: 6, fontWeight: 600 }}>Subtitle</div>
                <textarea
                  value={edit.subtitle}
                  onChange={(e) => handleCopyChange(selectedSlide.id, "subtitle", e.target.value)}
                  rows={3}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Offscreen export container */}
      <div ref={offscreenRef} style={{ position: "absolute", left: -9999, top: 0, fontFamily: "inherit" }}>
        {slides.map((slide) => {
          const baseCopy = slide.copyByLocale?.[locale] ?? slide.copy;
          const copy = getEffectiveCopy(slide.id, baseCopy);
          return (
            <div key={`export-${product.id}-${activeDevice}-${slide.id}-${locale}`}
              style={{ width: canvasW, height: canvasH, position: "absolute", left: -9999, fontFamily: "inherit" }}>
              <slide.Component theme={T} base={screenshotBase} copy={copy} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
