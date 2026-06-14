"use client";

import { useState, useCallback } from "react";
import type { CSSProperties } from "react";
import {
  Apple,
  Check,
  Copy,
  Download,
  Languages,
  Play,
  Save,
} from "lucide-react";
import type {
  AppPlatform,
  ThemeTokens,
  MetadataConfig,
  LocaleDef,
} from "@/lib/types";
import { toast } from "sonner";
import styles from "./metadata-panel.module.css";

type FieldDef = {
  id: keyof MetadataConfig;
  label: string;
  platform: string;
  maxLength: number;
  multiline: boolean;
  placeholder: string;
};

const FIELDS: FieldDef[] = [
  {
    id: "name",
    label: "App Name",
    platform: "Both",
    maxLength: 30,
    multiline: false,
    placeholder: "e.g. Lịch Ta",
  },
  {
    id: "subtitle",
    label: "App Store Subtitle",
    platform: "Apple",
    maxLength: 30,
    multiline: false,
    placeholder: "e.g. Vietnamese Lunar Calendar",
  },
  {
    id: "promoText",
    label: "Promotional Text",
    platform: "Apple",
    maxLength: 170,
    multiline: true,
    placeholder:
      "Current promo or highlight - can be updated without new release",
  },
  {
    id: "shortDescription",
    label: "Short Description",
    platform: "Google",
    maxLength: 80,
    multiline: false,
    placeholder: "One-line summary shown in search results",
  },
  {
    id: "keywords",
    label: "Keywords",
    platform: "Apple",
    maxLength: 100,
    multiline: false,
    placeholder: "comma,separated,keywords",
  },
  {
    id: "description",
    label: "Full Description",
    platform: "Both",
    maxLength: 4000,
    multiline: true,
    placeholder: "Full app description for store listing...",
  },
  {
    id: "whatsNew",
    label: "What's New in This Version",
    platform: "Apple",
    maxLength: 4000,
    multiline: true,
    placeholder: "Describe what's new in this version...",
  },
];

type SaveState = "idle" | "saving" | "saved" | "error";
type PublishState = "idle" | "publishing" | "published" | "error";
type TranslateAllState = "idle" | "loading" | "done" | "error";
type ButtonTone = "idle" | "success" | "error";

function getPublishTone(state: PublishState): ButtonTone {
  if (state === "published") return "success";
  if (state === "error") return "error";
  return "idle";
}

function getTranslateTone(state: TranslateAllState): ButtonTone {
  if (state === "done") return "success";
  if (state === "error") return "error";
  return "idle";
}

export function MetadataPanel({
  theme: T,
  platform,
  locales,
  activeLocale,
  metadata,
  productId,
  bundleId,
  packageName,
  privacyPolicyUrl,
  supportUrl,
  onUpdate,
  onUpdateLocale,
  onUpdateLocales,
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
  privacyPolicyUrl?: string;
  supportUrl?: string;
  onUpdate: (updated: MetadataConfig) => void;
  onUpdateLocale?: (locale: string, updated: MetadataConfig) => void;
  onUpdateLocales?: (
    fieldId: keyof MetadataConfig,
    translations: Record<string, string>,
  ) => void;
  /** All locale data for JSON export - { [locale]: MetadataConfig } */
  allLocaleData: Record<string, MetadataConfig>;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [appleState, setAppleState] = useState<PublishState>("idle");
  const [appleAllState, setAppleAllState] = useState<PublishState>("idle");
  const [googleState, setGoogleState] = useState<PublishState>("idle");
  const [googleAllState, setGoogleAllState] = useState<PublishState>("idle");
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [publishWarnings, setPublishWarnings] = useState<string[]>([]);
  const [localBundleId, setLocalBundleId] = useState(bundleId ?? "");
  const [localPackageName, setLocalPackageName] = useState(packageName ?? "");
  const [localPrivacyUrl, setLocalPrivacyUrl] = useState(
    privacyPolicyUrl ?? "",
  );
  const [localSupportUrl, setLocalSupportUrl] = useState(supportUrl ?? "");
  const [translateAllState, setTranslateAllState] =
    useState<TranslateAllState>("idle");
  const isFieldVisible = useCallback(
    (field: FieldDef) =>
      field.platform === "Both" ||
      (platform === "iphone" && field.platform === "Apple") ||
      (platform === "android" && field.platform === "Google"),
    [platform],
  );
  const visibleFields = FIELDS.filter(isFieldVisible);
  const isLight = T.bg === "#F6F7FB" || T.fg === "#17171C";
  const controlBorder = isLight
    ? "rgba(15,23,42,0.13)"
    : "rgba(255,255,255,0.06)";
  const panelStyle = {
    "--metadata-fg": T.fg,
    "--metadata-muted": T.fgMuted,
    "--metadata-accent": T.accent,
    "--metadata-accent-glow": T.accentGlow,
    "--metadata-surface": isLight ? "#FFFFFF" : "rgba(255,255,255,0.03)",
    "--metadata-surface-border": isLight
      ? "rgba(15,23,42,0.08)"
      : "rgba(255,255,255,0.07)",
    "--metadata-surface-shadow": isLight
      ? "0 10px 28px rgba(15,23,42,0.06)"
      : "none",
    "--metadata-control-bg": isLight ? "#FFFFFF" : "rgba(0,0,0,0.25)",
    "--metadata-control-border": controlBorder,
    "--metadata-button-bg": isLight
      ? "rgba(15,23,42,0.04)"
      : "rgba(255,255,255,0.06)",
    "--metadata-button-border": isLight
      ? "rgba(15,23,42,0.1)"
      : "rgba(255,255,255,0.08)",
    "--metadata-publish-bg": isLight
      ? "rgba(15,23,42,0.045)"
      : "rgba(255,255,255,0.07)",
    "--metadata-publish-border": isLight
      ? "rgba(15,23,42,0.1)"
      : "rgba(255,255,255,0.12)",
    "--metadata-progress-track": isLight
      ? "rgba(15,23,42,0.08)"
      : "rgba(255,255,255,0.06)",
    "--metadata-warning-text": isLight ? "#B45309" : "#FCD34D",
    "--metadata-error-text": isLight ? "#B91C1C" : "#FCA5A5",
  } as CSSProperties;

  const handleCopy = useCallback(async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const handleChange = useCallback(
    (id: keyof MetadataConfig, value: string) => {
      onUpdate({ ...metadata, [id]: value });
    },
    [metadata, onUpdate],
  );

  const handleCopyAll = useCallback(async () => {
    const text = visibleFields
      .map((f) => `${f.label}:\n${metadata[f.id]}`)
      .join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedId("__all__");
    toast.success("Copied metadata");
    setTimeout(() => setCopiedId(null), 1500);
  }, [metadata, visibleFields]);

  const [translateAllError, setTranslateAllError] = useState<string | null>(
    null,
  );

  const handleTranslateAll = useCallback(
    async (fieldId: keyof MetadataConfig) => {
      const sourceLocale = locales[0]?.code ?? activeLocale;
      const sourceMetadata =
        sourceLocale === activeLocale
          ? metadata
          : (allLocaleData[sourceLocale] ?? metadata);
      const sourceValue = sourceMetadata[fieldId] ?? "";
      const targetLocales = locales
        .filter((l) => l.code !== sourceLocale)
        .map((l) => l.code);
      setTranslateAllError(null);
      setTranslateAllState("loading");
      try {
        const res = await fetch("/api/translate-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            fieldId,
            sourceLocale,
            sourceValue,
            targetLocales,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          translations?: Record<string, string>;
          error?: string;
        };
        if (res.ok && data.ok) {
          if (data.translations && onUpdateLocales) {
            onUpdateLocales(fieldId, data.translations);
          } else if (data.translations && onUpdateLocale) {
            Object.entries(data.translations).forEach(
              ([locale, translated]) => {
                const existing = allLocaleData[locale] ?? metadata;
                onUpdateLocale(locale, { ...existing, [fieldId]: translated });
              },
            );
          }
          setTranslateAllState("done");
          toast.success("Translations generated");
        } else {
          const message = data.error ?? "Failed";
          setTranslateAllError(message);
          setTranslateAllState("error");
          toast.error(message);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed";
        setTranslateAllError(message);
        setTranslateAllState("error");
        toast.error(message);
      }
      setTimeout(() => {
        setTranslateAllState("idle");
        setTranslateAllError(null);
      }, 4000);
    },
    [
      activeLocale,
      allLocaleData,
      locales,
      metadata,
      onUpdateLocale,
      onUpdateLocales,
      productId,
    ],
  );

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
          body: JSON.stringify({
            productId,
            bundleId: localBundleId,
            packageName: localPackageName,
            privacyPolicyUrl: localPrivacyUrl,
            supportUrl: localSupportUrl,
          }),
        }),
      ]);
      const ok = metaRes.ok && idsRes.ok;
      setSaveState(ok ? "saved" : "error");
      if (ok) {
        toast.success("Metadata saved");
      } else {
        toast.error("Failed to save metadata");
      }
    } catch (e) {
      setSaveState("error");
      toast.error(e instanceof Error ? e.message : "Failed to save metadata");
    }
    setTimeout(() => setSaveState("idle"), 2000);
  }, [
    productId,
    activeLocale,
    metadata,
    localBundleId,
    localPackageName,
    localPrivacyUrl,
    localSupportUrl,
  ]);

  const handlePublish = useCallback(
    async (store: "apple" | "google", all = false) => {
      const setState = all
        ? store === "apple"
          ? setAppleAllState
          : setGoogleAllState
        : store === "apple"
          ? setAppleState
          : setGoogleState;
      setState("publishing");
      setPublishErrors([]);
      setPublishWarnings([]);
      try {
        const res = await fetch(`/api/publish/${store}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            locale: all ? null : activeLocale,
          }),
        });
        const data = await res.json();
        if (data.warnings?.length) setPublishWarnings(data.warnings);
        if (res.ok && data.ok) {
          setState("published");
          toast.success(
            `${store === "apple" ? "Apple" : "Google"} metadata published`,
          );
        } else {
          const messages = data.errors ?? [data.error ?? "Unknown error"];
          setPublishErrors(messages);
          setState("error");
          toast.error(messages[0]);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        setPublishErrors([message]);
        setState("error");
        toast.error(message);
      }
      setTimeout(() => setState("idle"), 4000);
    },
    [productId, activeLocale],
  );

  const handleExportJson = useCallback(async () => {
    const pickVisibleFields = (entry: MetadataConfig) =>
      Object.fromEntries(
        visibleFields.map((field) => [field.id, entry[field.id]]),
      ) as MetadataConfig;

    // Export all locales, not just the active one
    const exportData =
      Object.keys(allLocaleData).length > 1
        ? Object.fromEntries(
            Object.entries(allLocaleData).map(([localeCode, entry]) => [
              localeCode,
              pickVisibleFields(entry),
            ]),
          )
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
    toast.success("Metadata JSON exported");
  }, [metadata, allLocaleData, activeLocale, visibleFields]);

  return (
    <div className={styles.panel} style={panelStyle}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Store Metadata</h1>
          <p className={styles.subtitle}>
            Edit your app listing text. Changes are saved per session.
          </p>
        </div>

        <div className={styles.toolbar}>
          <button
            className={styles.secondaryButton}
            data-active={copiedId === "__all__"}
            onClick={handleCopyAll}
          >
            {copiedId === "__all__" ? <Check size={13} /> : <Copy size={13} />}
            {copiedId === "__all__" ? "Copied All" : "Copy All"}
          </button>
          <button className={styles.secondaryButton} onClick={handleExportJson}>
            <Download size={13} />
            Export JSON
          </button>
          <button
            className={styles.saveButton}
            data-state={saveState}
            onClick={handleSave}
            disabled={saveState === "saving"}
          >
            <Save size={13} />
            {saveState === "saving"
              ? "Saving..."
              : saveState === "saved"
                ? "Saved"
                : saveState === "error"
                  ? "Error"
                  : "Save"}
          </button>

          {localBundleId && (
            <>
              <button
                className={styles.publishButton}
                data-tone={getPublishTone(appleState)}
                onClick={() => handlePublish("apple")}
                disabled={appleState === "publishing"}
                title="Publish current locale to App Store Connect"
              >
                <Apple size={13} />
                {appleState === "publishing"
                  ? "Publishing..."
                  : appleState === "published"
                    ? "Published!"
                    : appleState === "error"
                      ? "Failed"
                      : "Publish"}
              </button>
              <button
                className={styles.publishButton}
                data-tone={getPublishTone(appleAllState)}
                onClick={() => handlePublish("apple", true)}
                disabled={appleAllState === "publishing"}
                title="Publish all locales to App Store Connect"
              >
                <Apple size={13} />
                {appleAllState === "publishing"
                  ? "Publishing..."
                  : appleAllState === "published"
                    ? "All Published!"
                    : appleAllState === "error"
                      ? "Failed"
                      : "Publish All"}
              </button>
            </>
          )}

          {localPackageName && (
            <>
              <button
                className={styles.publishButton}
                data-tone={getPublishTone(googleState)}
                onClick={() => handlePublish("google")}
                disabled={googleState === "publishing"}
                title="Publish current locale to Google Play"
              >
                <Play size={13} fill="currentColor" />
                {googleState === "publishing"
                  ? "Publishing..."
                  : googleState === "published"
                    ? "Published!"
                    : googleState === "error"
                      ? "Failed"
                      : "Publish Google"}
              </button>
              <button
                className={styles.publishButton}
                data-tone={getPublishTone(googleAllState)}
                onClick={() => handlePublish("google", true)}
                disabled={googleAllState === "publishing"}
                title="Publish all locales to Google Play"
              >
                <Play size={13} fill="currentColor" />
                {googleAllState === "publishing"
                  ? "Publishing..."
                  : googleAllState === "published"
                    ? "All Published!"
                    : googleAllState === "error"
                      ? "Failed"
                      : "Publish All"}
              </button>
            </>
          )}
        </div>
      </div>

      {publishErrors.length > 0 && (
        <div className={styles.alert} data-tone="error">
          <div className={styles.alertTitle}>Publishing errors:</div>
          {publishErrors.map((e, i) => (
            <div className={styles.alertCode} key={i}>
              {e}
            </div>
          ))}
        </div>
      )}

      {publishWarnings.length > 0 && (
        <div className={styles.alert} data-tone="warning">
          <div className={styles.alertTitle}>Published with warnings:</div>
          {publishWarnings.map((w, i) => (
            <div className={styles.alertLine} key={i}>
              {w}
            </div>
          ))}
        </div>
      )}

      <section className={styles.card}>
        <div className={styles.sectionTitle}>Store Identifiers</div>
        <div className={styles.settingsGrid}>
          <label className={styles.settingField}>
            <span>Apple Bundle ID</span>
            <input
              className={`${styles.input} ${styles.monoInput}`}
              type="text"
              value={localBundleId}
              onChange={(e) => setLocalBundleId(e.target.value)}
              placeholder="com.example.myapp"
            />
          </label>
          <label className={styles.settingField}>
            <span>Google Play Package Name</span>
            <input
              className={`${styles.input} ${styles.monoInput}`}
              type="text"
              value={localPackageName}
              onChange={(e) => setLocalPackageName(e.target.value)}
              placeholder="com.example.myapp"
            />
          </label>
          <label className={styles.settingField}>
            <span>Privacy Policy URL</span>
            <input
              className={`${styles.input} ${styles.monoInput}`}
              type="text"
              autoComplete="off"
              value={localPrivacyUrl}
              onChange={(e) => setLocalPrivacyUrl(e.target.value)}
              placeholder="https://example.com/privacy"
            />
          </label>
          <label className={styles.settingField}>
            <span>Support URL</span>
            <input
              className={`${styles.input} ${styles.monoInput}`}
              type="text"
              autoComplete="off"
              value={localSupportUrl}
              onChange={(e) => setLocalSupportUrl(e.target.value)}
              placeholder="https://example.com/support"
            />
          </label>
        </div>
      </section>

      <div className={styles.fieldList}>
        {visibleFields.map((field) => {
          const value = metadata[field.id] ?? "";
          const charCount = value.length;
          const isOver = charCount > field.maxLength;
          const pct = Math.min(100, (charCount / field.maxLength) * 100);
          const InputComponent = field.multiline ? "textarea" : "input";

          return (
            <section className={styles.card} key={field.id}>
              <div className={styles.fieldHeader}>
                <span className={styles.fieldLabel}>{field.label}</span>
                <div className={styles.fieldActions}>
                  {locales.length > 1 && (
                    <button
                      className={styles.smallButton}
                      data-tone={getTranslateTone(translateAllState)}
                      onClick={() => handleTranslateAll(field.id)}
                      disabled={translateAllState === "loading"}
                    >
                      <Languages size={11} />
                      {translateAllState === "loading"
                        ? "Translating..."
                        : translateAllState === "done"
                          ? "Done!"
                          : translateAllState === "error"
                            ? (translateAllError ?? "Failed")
                            : "Translate for all langs"}
                    </button>
                  )}
                  <button
                    className={styles.smallButton}
                    data-active={copiedId === field.id}
                    onClick={() => handleCopy(field.id, value)}
                  >
                    {copiedId === field.id ? (
                      <Check size={11} />
                    ) : (
                      <Copy size={11} />
                    )}
                    {copiedId === field.id ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <InputComponent
                className={styles.input}
                data-invalid={isOver}
                type={field.multiline ? undefined : "text"}
                autoComplete="off"
                value={value}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={field.multiline ? (field.id === "description" ? 8 : 3) : undefined}
              />

              <div className={styles.counterRow}>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressBar}
                    data-over={isOver}
                    data-warning={!isOver && pct > 85}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={styles.counter} data-over={isOver}>
                  {charCount}/{field.maxLength}
                </span>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
