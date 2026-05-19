"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  IPHONE_SIZES, IPHONE_W, IPHONE_H,
  ANDROID_W, ANDROID_H, ANDROID_SIZES,
} from "@/lib/constants";
import { exportAllToZip, captureAllAsBase64 } from "@/lib/export";
import { ScreenshotPreview } from "@/components/ui";
import { segmentsToMarkup, markupToSegments, renderRichText } from "@/lib/rich-text";
import { preloadImages, bustCache } from "@/lib/images";
import type { RichTextSegment } from "@/lib/rich-text";
import type { AppPlatform, ProductConfig, ThemeTokens, SlideCopy } from "@/lib/types";
import { SLIDE_STYLE_OPTIONS, defaultSlideStyleKey } from "@/components/component-registry";

type Props = {
  product: ProductConfig;
  locale: string;
  multiProduct: boolean;
  platform: AppPlatform;
  onSlidesChanged?: () => void;
};

type CopyEdit = { label: string; headline: string; subtitle: string };
type SaveState = "idle" | "saving" | "saved" | "error";

/** Convert a SlideCopy (headline/subtitle may be React.ReactNode or RichTextSegment[]) to editable markup strings */
function compressImage(dataUrl: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

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

export function ScreenshotsSection({ product, locale, multiProduct, platform, onSlidesChanged }: Props) {
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

  const [uploadError, setUploadError]     = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // New slide form state
  type PanelMode = "edit" | "create";
  const [panelMode, setPanelMode]         = useState<PanelMode>("edit");
  const [newStyleKey, setNewStyleKey]     = useState(defaultSlideStyleKey("iphone"));
  const [newLabel, setNewLabel]           = useState("");
  const [newHeadline, setNewHeadline]     = useState("");
  const [newSubtitle, setNewSubtitle]     = useState("");
  const [newImageFile, setNewImageFile]   = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [creating, setCreating]           = useState(false);
  const [createError, setCreateError]     = useState<string | null>(null);

  const [generatingCopy, setGeneratingCopy] = useState(false);

  const handleGenerateCopy = useCallback(async (slideId: string | null, isCreate: boolean, imagePath: string) => {
    const label = isCreate ? newLabel : copyEdits[slideId!]?.label ?? "";
    if (!label) return;
    setGeneratingCopy(true);
    try {
      // Convert image to base64 for vision model
      let screenshotBase64: string | undefined;
      const src = isCreate ? newImagePreview : imagePath;
      if (src) {
        try {
          let dataUrl: string;
          if (src.startsWith("data:")) {
            dataUrl = src;
          } else {
            const imgRes = await fetch(src);
            const blob = await imgRes.blob();
            dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(blob);
            });
          }
          screenshotBase64 = await compressImage(dataUrl);
        } catch { /* skip image if fetch fails */ }
      }

      const res = await fetch("/api/slides/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          productDescription: product.metadata?.description,
          label,
          currentHeadline: isCreate ? newHeadline : copyEdits[slideId!]?.headline,
          currentSubtitle: isCreate ? newSubtitle : copyEdits[slideId!]?.subtitle,
          locale,
          screenshotBase64,
        }),
      });
      const data = await res.json() as { ok?: boolean; headline?: string; subtitle?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Generation failed");
      if (isCreate) {
        setNewHeadline(data.headline ?? "");
        setNewSubtitle(data.subtitle ?? "");
      } else {
        setCopyEdits((prev) => ({
          ...prev,
          [slideId!]: {
            ...prev[slideId!],
            headline: data.headline ?? prev[slideId!]?.headline ?? "",
            subtitle: data.subtitle ?? prev[slideId!]?.subtitle ?? "",
          },
        }));
      }
    } catch {
      // silently fail
    }
    setGeneratingCopy(false);
  }, [product.name, locale, newLabel, newHeadline, newSubtitle, newImagePreview, copyEdits]);

  const activeSlides = product.slidesByLocale?.[locale] ?? product.slides;
  const activeDevice = platform === "android" && activeSlides.android?.length ? "android" : "iphone";
  const slides       = (activeDevice === "android" ? activeSlides.android : activeSlides.iphone) ?? [];
  const sizes        = activeDevice === "android" ? ANDROID_SIZES : IPHONE_SIZES;
  const canvasW      = activeDevice === "android" ? ANDROID_W : IPHONE_W;
  const canvasH      = activeDevice === "android" ? ANDROID_H : IPHONE_H;

  // imagePath overrides applied after upload, keyed by dbId
  const [imagePathOverrides, setImagePathOverrides] = useState<Record<number, string>>({});
  const getImagePath = (slide: typeof slides[number]) =>
    imagePathOverrides[slide.dbId] ?? slide.imagePath ?? "";

  // Reset selections when product/locale/device changes
  useEffect(() => { setSelectedSize(0); setSelectedSlideId(null); }, [activeDevice]);
  useEffect(() => { setNewStyleKey(defaultSlideStyleKey(activeDevice)); }, [activeDevice]);
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
      if (res.ok) {
        setSaveState("saved");
        setTimeout(() => { setSaveState("idle"); setSelectedSlideId(null); }, 800);
      } else {
        setSaveState("error");
        setTimeout(() => setSaveState("idle"), 2000);
      }
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2000);
    }
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

  const handleDeleteSlide = useCallback(async (dbId: number, slideKey: string) => {
    if (!confirm(`Delete slide "${slideKey}"? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/slides/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideId: dbId, slideKey, productId: product.id }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Delete failed");
      setSelectedSlideId(null);
      onSlidesChanged?.();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Delete failed");
    }
  }, [product.id, onSlidesChanged]);

  const handleDeleteImage = useCallback(async (dbId: number, currentImagePath: string) => {
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const res = await fetch("/api/screenshots/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideId: dbId, imagePath: currentImagePath }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Delete failed");
      setImagePathOverrides((prev) => ({ ...prev, [dbId]: "" }));
      setUploadSuccess("Removed");
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Delete failed");
    }
  }, []);

  const handleUpload = useCallback(async (dbId: number, file: File) => {
    setUploadError(null);
    setUploadSuccess(null);
    const form = new FormData();
    form.append("slideId", String(dbId));
    form.append("productId", product.id);
    form.append("file", file);
    try {
      const res  = await fetch("/api/screenshots/upload", { method: "POST", body: form });
      const data = await res.json() as { ok?: boolean; imagePath?: string; error?: string };
      if (!res.ok || !data.ok || !data.imagePath) throw new Error(data.error ?? "Upload failed");
      const freshPath = `${data.imagePath}?t=${Date.now()}`;
      bustCache(data.imagePath);
      await preloadImages([freshPath]);
      setImagePathOverrides((prev) => ({ ...prev, [dbId]: freshPath }));
      setUploadSuccess("Uploaded");
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    }
  }, [product.id]);

  const handleCreateSlide = useCallback(async () => {
    if (!newLabel || !newImageFile) {
      setCreateError("Screenshot image and label are required.");
      return;
    }
    const autoSlideKey = `${newLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;
    setCreateError(null);
    setCreating(true);
    const form = new FormData();
    form.append("productId",    product.id);
    form.append("componentKey", newStyleKey || defaultSlideStyleKey(activeDevice));
    form.append("device",       activeDevice);
    form.append("slideKey",     autoSlideKey);
    form.append("label",        newLabel);
    form.append("headline",     newHeadline);
    form.append("subtitle",     newSubtitle);
    form.append("file",         newImageFile);
    try {
      const res  = await fetch("/api/slides/add", { method: "POST", body: form });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Create failed");
      setNewLabel("");
      setNewHeadline(""); setNewSubtitle("");
      setNewImageFile(null); setNewImagePreview(null);
      setPanelMode("edit");
      onSlidesChanged?.();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Create failed");
    }
    setCreating(false);
  }, [product.id, activeDevice, newStyleKey, newLabel, newHeadline, newSubtitle, newImageFile, onSlidesChanged]);

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
          const baseCopy  = slide.copyByLocale?.[locale] ?? slide.copy;
          const copy      = getEffectiveCopy(slide.id, baseCopy);
          const isSelected = selectedSlideId === slide.id;
          const imagePath = getImagePath(slide);
          return (
            <div key={`${product.id}-${activeDevice}-${slide.id}-${locale}`} style={{ position: "relative" }}>
              <div
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
                  theme={T}
                  device={activeDevice}
                  onUpload={slide.dbId ? (file) => handleUpload(slide.dbId, file) : undefined}
                >
                  <slide.Component theme={T} imagePath={imagePath} copy={copy} />
                </ScreenshotPreview>
              </div>
              {slide.dbId && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteSlide(slide.dbId, slide.id); }}
                  title="Delete slide"
                  style={{
                    position: "absolute", top: 6, right: 6,
                    width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(239,68,68,0.85)", color: "#fff",
                    border: "none", fontSize: 13, lineHeight: 1,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0.7, transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* Add slide card */}
        <div
          onClick={() => { setSelectedSlideId(null); setPanelMode("create"); }}
          style={{ cursor: "pointer" }}
        >
          <div style={{
            width: "100%",
            aspectRatio: `${activeDevice === "android" ? ANDROID_W : IPHONE_W}/${activeDevice === "android" ? ANDROID_H : IPHONE_H}`,
            borderRadius: 12,
            border: "1.5px dashed rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.02)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "border-color 0.15s, background 0.15s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${T.accent}88`; (e.currentTarget as HTMLDivElement).style.background = `${T.accent}0a`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${T.accent}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, color: T.accent, lineHeight: 1 }}>+</span>
            </div>
            <div style={{ fontSize: 11, color: T.fgMuted, fontWeight: 500 }}>Add slide</div>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      {(panelMode === "create" || (selectedSlide && selectedIndex >= 0 && copyEdits[selectedSlide.id])) && (
        <div
          onClick={() => { setPanelMode("edit"); setSelectedSlideId(null); setCreateError(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(560px, calc(100vw - 48px))",
            maxHeight: "calc(100vh - 80px)",
            overflowY: "auto",
            background: "#1a1a20",
            border: `1px solid ${T.accent}44`,
            borderRadius: 16,
            padding: "24px 28px",
            boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
          }}>
          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.fg }}>
                {panelMode === "create" ? "Add Slide" : `Edit Slide ${selectedIndex + 1}`}
              </div>
              {panelMode === "edit" && (
                <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 2 }}>
                  Use <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4 }}>**text**</code> for accent,{" "}
                  <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4 }}>\n</code> for line break
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setPanelMode("edit"); setSelectedSlideId(null); setCreateError(null); }}
                style={{ background: "rgba(255,255,255,0.06)", color: T.fgMuted, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Close
              </button>
              {panelMode === "create" ? (
                <button
                  onClick={handleCreateSlide}
                  disabled={creating}
                  style={{
                    background: `linear-gradient(135deg, ${T.accent}, ${T.accent}dd)`,
                    color: "#fff", border: "none", borderRadius: 8, padding: "7px 18px",
                    fontSize: 13, fontWeight: 600, cursor: creating ? "not-allowed" : "pointer",
                    boxShadow: `0 4px 16px ${T.accentGlow}`, opacity: creating ? 0.7 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {creating ? "Creating…" : "Create Slide"}
                </button>
              ) : (
                <button
                  onClick={() => handleSaveCopy(selectedSlide!.id)}
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
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Screenshot image */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: T.fgMuted, fontWeight: 600 }}>Screenshot</div>
                {panelMode === "create" && <div style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>required</div>}
              </div>
              {panelMode === "create" ? (
                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                  {newImagePreview ? (
                    <img src={newImagePreview} alt="" style={{ width: 48, height: 80, objectFit: "cover", objectPosition: "top", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" }} />
                  ) : (
                    <div style={{ width: 48, height: 80, borderRadius: 6, border: "1px dashed rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 20, opacity: 0.3 }}>+</span>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>{newImagePreview ? "Replace image" : "Upload image"}</div>
                    <div style={{ fontSize: 11, color: T.fgMuted, marginTop: 2 }}>PNG or JPG</div>
                  </div>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setNewImageFile(f);
                    const reader = new FileReader();
                    reader.onload = (ev) => setNewImagePreview(ev.target?.result as string);
                    reader.readAsDataURL(f);
                  }} />
                </label>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                    {getImagePath(selectedSlide!) ? (
                      <img src={getImagePath(selectedSlide!)} alt="" style={{ width: 48, height: 80, objectFit: "cover", objectPosition: "top", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" }} />
                    ) : (
                      <div style={{ width: 48, height: 80, borderRadius: 6, border: "1px dashed rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 20, opacity: 0.3 }}>+</span>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>
                        {getImagePath(selectedSlide!) ? "Replace image" : "Upload image"}
                      </div>
                      <div style={{ fontSize: 11, color: T.fgMuted, marginTop: 2 }}>PNG or JPG</div>
                    </div>
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(selectedSlide!.dbId, f); }} />
                  </label>
                  {getImagePath(selectedSlide!) && (
                    <button
                      onClick={() => handleDeleteImage(selectedSlide!.dbId, getImagePath(selectedSlide!))}
                      title="Remove image"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 7, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
              {uploadError   && <div style={{ marginTop: 6, fontSize: 11, color: "#FCA5A5" }}>{uploadError}</div>}
              {uploadSuccess && <div style={{ marginTop: 6, fontSize: 11, color: "#86EFAC" }}>{uploadSuccess}</div>}
            </div>

            {/* Slide style — create only */}
            {panelMode === "create" && (
              <div>
                <div style={{ fontSize: 12, color: T.fgMuted, marginBottom: 6, fontWeight: 600 }}>Style</div>
                <select
                  value={newStyleKey}
                  onChange={(e) => setNewStyleKey(e.target.value)}
                  style={{ ...inputStyle, resize: "none" }}
                >
                  {SLIDE_STYLE_OPTIONS
                    .filter((style) => !style.platforms || style.platforms.includes(activeDevice))
                    .map((style) => (
                      <option key={style.key} value={style.key}>{style.label}</option>
                    ))}
                </select>
                <div style={{ fontSize: 11, color: T.fgMuted, marginTop: 6 }}>
                  {SLIDE_STYLE_OPTIONS.find((style) => style.key === newStyleKey)?.description}
                </div>
              </div>
            )}

            {/* Label */}
            <div>
              <div style={{ fontSize: 12, color: T.fgMuted, marginBottom: 6, fontWeight: 600 }}>Label</div>
              <input
                type="text"
                value={panelMode === "create" ? newLabel : copyEdits[selectedSlide!.id]?.label ?? ""}
                onChange={(e) => panelMode === "create" ? setNewLabel(e.target.value) : handleCopyChange(selectedSlide!.id, "label", e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Headline + Subtitle with AI generate */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: T.fgMuted, fontWeight: 600 }}>Headline</div>
                <button
                  onClick={() => handleGenerateCopy(panelMode === "edit" ? selectedSlide!.id : null, panelMode === "create", panelMode === "edit" ? getImagePath(selectedSlide!) : "")}
                  disabled={generatingCopy || !(panelMode === "create" ? newLabel : copyEdits[selectedSlide!.id]?.label)}
                  title="Generate headline & subtitle with AI"
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: generatingCopy ? "rgba(255,255,255,0.04)" : `${T.accent}22`,
                    color: generatingCopy ? T.fgMuted : T.accent,
                    border: `1px solid ${T.accent}44`,
                    borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600,
                    cursor: generatingCopy ? "not-allowed" : "pointer",
                    opacity: (panelMode === "create" ? !newLabel : !copyEdits[selectedSlide!.id]?.label) ? 0.4 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {generatingCopy ? (
                    <>
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L9.1 9.1 2 12l7.1 2.9L12 22l2.9-7.1L22 12l-7.1-2.9z"/>
                      </svg>
                      AI Generate
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={panelMode === "create" ? newHeadline : copyEdits[selectedSlide!.id]?.headline ?? ""}
                onChange={(e) => panelMode === "create" ? setNewHeadline(e.target.value) : handleCopyChange(selectedSlide!.id, "headline", e.target.value)}
                rows={3}
                style={inputStyle}
              />
            </div>

            {/* Subtitle */}
            <div>
              <div style={{ fontSize: 12, color: T.fgMuted, marginBottom: 6, fontWeight: 600 }}>Subtitle</div>
              <textarea
                value={panelMode === "create" ? newSubtitle : copyEdits[selectedSlide!.id]?.subtitle ?? ""}
                onChange={(e) => panelMode === "create" ? setNewSubtitle(e.target.value) : handleCopyChange(selectedSlide!.id, "subtitle", e.target.value)}
                rows={3}
                style={inputStyle}
              />
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

            {createError && <div style={{ fontSize: 12, color: "#FCA5A5" }}>{createError}</div>}
          </div>
        </div>
        </div>
      )}

      {/* Offscreen export container */}
      <div ref={offscreenRef} style={{ position: "absolute", left: -9999, top: 0, fontFamily: "inherit" }}>
        {slides.map((slide) => {
          const baseCopy = slide.copyByLocale?.[locale] ?? slide.copy;
          const copy = getEffectiveCopy(slide.id, baseCopy);
          return (
            <div key={`export-${product.id}-${activeDevice}-${slide.id}-${locale}`}
              style={{ width: canvasW, height: canvasH, position: "absolute", left: -9999, fontFamily: "inherit" }}>
              <slide.Component theme={T} imagePath={getImagePath(slide)} copy={copy} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
