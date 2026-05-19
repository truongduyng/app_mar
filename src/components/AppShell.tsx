"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { img } from "@/lib/images";
import { useProduct } from "@/components/ProductContext";
import type { LocaleDef, MetadataConfig } from "@/lib/types";
import { segmentsToMarkup } from "@/lib/rich-text";
import type { RichTextSegment } from "@/lib/rich-text";
import { ChevronDown, RefreshCw, Plus, Check, Smartphone, Image, Share2, MousePointerClick, AlignLeft, Settings } from "lucide-react";

// Common App Store / Play Store locales
const COMMON_LOCALES: LocaleDef[] = [
  { code: "ar",      label: "Arabic",               flag: "🇸🇦" },
  { code: "cs",      label: "Czech",                flag: "🇨🇿" },
  { code: "da",      label: "Danish",               flag: "🇩🇰" },
  { code: "en",      label: "English",              flag: "🇬🇧" },
  { code: "de",      label: "German",               flag: "🇩🇪" },
  { code: "el",      label: "Greek",                flag: "🇬🇷" },
  { code: "es",      label: "Spanish",              flag: "🇪🇸" },
  { code: "fi",      label: "Finnish",              flag: "🇫🇮" },
  { code: "fil",     label: "Filipino",             flag: "🇵🇭" },
  { code: "fr",      label: "French",               flag: "🇫🇷" },
  { code: "he",      label: "Hebrew",               flag: "🇮🇱" },
  { code: "hr",      label: "Croatian",             flag: "🇭🇷" },
  { code: "hu",      label: "Hungarian",            flag: "🇭🇺" },
  { code: "id",      label: "Indonesian",           flag: "🇮🇩" },
  { code: "it",      label: "Italian",              flag: "🇮🇹" },
  { code: "ja",      label: "Japanese",             flag: "🇯🇵" },
  { code: "ko",      label: "Korean",               flag: "🇰🇷" },
  { code: "ms",      label: "Malay",                flag: "🇲🇾" },
  { code: "nl",      label: "Dutch",                flag: "🇳🇱" },
  { code: "no",      label: "Norwegian",            flag: "🇳🇴" },
  { code: "pl",      label: "Polish",               flag: "🇵🇱" },
  { code: "pt",      label: "Portuguese",           flag: "🇵🇹" },
  { code: "ro",      label: "Romanian",             flag: "🇷🇴" },
  { code: "ru",      label: "Russian",              flag: "🇷🇺" },
  { code: "sk",      label: "Slovak",               flag: "🇸🇰" },
  { code: "sv",      label: "Swedish",              flag: "🇸🇪" },
  { code: "th",      label: "Thai",                 flag: "🇹🇭" },
  { code: "tr",      label: "Turkish",              flag: "🇹🇷" },
  { code: "uk",      label: "Ukrainian",            flag: "🇺🇦" },
  { code: "vi",      label: "Vietnamese",           flag: "🇻🇳" },
  { code: "zh-Hans", label: "Simplified Chinese",   flag: "🇨🇳" },
  { code: "zh-Hant", label: "Traditional Chinese",  flag: "🇹🇼" },
];

type Section = "screenshots" | "feature-graphic" | "social-og" | "cta" | "metadata";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "screenshots",     label: "Screenshots" },
  { id: "feature-graphic", label: "Feature Graphic" },
  { id: "social-og",       label: "Social OG" },
  { id: "cta",             label: "CTA Image" },
  { id: "metadata",        label: "Store Metadata" },
];

function segmentsToPlain(segments: RichTextSegment[]): string {
  return segmentsToMarkup(segments);
}

export function AppShell({ children }: { children: ReactNode }) {
  const {
    PRODUCTS, rawProducts, product, productId, setProductId,
    locale, setLocale, productLocales, extraLocales, setExtraLocales,
    metadataMap, setMetadataMap, regenLocaleCode, handleRegenLocale,
    removeLocale,
    ready,
  } = useProduct();

  const pathname = usePathname();
  const router = useRouter();

  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);
  const [addLocaleOpen, setAddLocaleOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);

  const T = product.theme;

  const activeSection = ((): Section => {
    const seg = pathname.split("/")[2] as Section;
    return SECTIONS.find((s) => s.id === seg) ? seg : "screenshots";
  })();

  useEffect(() => {
    if (!productMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (productMenuRef.current && !productMenuRef.current.contains(e.target as Node))
        setProductMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [productMenuOpen]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-[#8A8A94] text-base">
        Loading images…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B]" style={{ color: T.fg }}>

      {/* ── Top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-100 h-14.25 bg-[rgba(9,9,11,0.92)] backdrop-blur-md border-b border-white/6 px-4 flex items-center gap-3">

        {/* Product picker */}
        <div ref={productMenuRef} className="relative">
          <button
            onClick={() => setProductMenuOpen((o) => !o)}
            className={`flex items-center gap-2.5 border rounded-[10px] px-2.5 py-1.5 cursor-pointer transition-all duration-150 ${
              productMenuOpen
                ? "bg-white/8 border-white/[0.14]"
                : "bg-transparent border-transparent"
            }`}
          >
            <img
              src={img(product.iconPath)}
              alt={product.name}
              className="w-7.5 h-7.5 rounded-lg shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="font-bold text-[15px] whitespace-nowrap" style={{ color: T.fg }}>{product.name}</span>
            <ChevronDown
              size={13}
              className={`ml-0.5 opacity-50 shrink-0 transition-transform duration-200 ${productMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {productMenuOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-200 bg-[rgba(24,24,28,0.97)] backdrop-blur-xl border border-white/10 rounded-xl p-1.5 min-w-55 shadow-[0_16px_60px_rgba(0,0,0,0.6)] flex flex-col gap-0.5">
              {PRODUCTS.map((p) => {
                const active = p.id === productId;
                return (
                  <div key={p.id} className="flex items-center gap-0.5">
                    <button
                      onClick={() => { setProductId(p.id); setProductMenuOpen(false); }}
                      className={`flex items-center gap-2.5 border-none rounded-lg px-2.5 py-2 cursor-pointer transition-colors duration-120 flex-1 text-left hover:bg-white/5 ${
                        active ? "bg-white/8" : "bg-transparent"
                      }`}
                    >
                      <img
                        src={img(p.iconPath)}
                        alt={p.name}
                        className="w-7 h-7 rounded-md shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className={`text-sm flex-1 ${active ? "font-bold" : "font-medium text-[#9999a8]"}`} style={active ? { color: T.fg } : undefined}>
                        {p.name}
                      </span>
                      {active && <Check size={14} color={T.accent} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setProductId(p.id); setProductMenuOpen(false); setEditProductOpen(true); }}
                      title="Edit product"
                      className="flex items-center justify-center w-6 h-6 rounded-md border-none bg-transparent text-[#555] cursor-pointer transition-colors hover:bg-white/8 hover:text-[#999] shrink-0"
                    >
                      <Settings size={12} />
                    </button>
                  </div>
                );
              })}
              <div className="border-t border-white/8 mt-0.5 pt-0.5">
                <button
                  onClick={() => { setProductMenuOpen(false); setAddProductOpen(true); }}
                  className="flex items-center gap-2.5 border-none rounded-lg px-2.5 py-2 cursor-pointer transition-colors duration-120 w-full text-left hover:bg-white/5 bg-transparent text-[#9999a8]"
                >
                  <div className="w-7 h-7 rounded-md shrink-0 flex items-center justify-center bg-white/6 border border-white/10">
                    <Plus size={13} />
                  </div>
                  <span className="text-sm font-medium">Add product</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language picker */}
        <LocaleDropdown
          locales={productLocales}
          locale={locale}
          regenLocaleCode={regenLocaleCode}
          theme={T}
          onSelect={setLocale}
          onRegen={handleRegenLocale}
          onAdd={() => setAddLocaleOpen(true)}
          onRemove={removeLocale}
        />
      </div>

      {/* ── Body: sidebar + main ── */}
      <div className="flex pt-14.25">

        {/* Left sidebar */}
        <aside className="fixed top-14.25 left-0 bottom-0 w-50 z-90 bg-[rgba(13,13,15,0.95)] backdrop-blur-md border-r border-white/6 flex flex-col p-4 gap-0.5 overflow-y-auto">
          <div className="text-[10px] font-bold tracking-widest uppercase px-2 pb-2" style={{ color: T.fgMuted }}>
            Assets
          </div>
          {SECTIONS.map((s) => {
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => router.push(`/${productId}/${s.id}`)}
                className={`flex items-center gap-2 border rounded-lg px-2.5 py-2 text-[13px] cursor-pointer transition-all duration-150 text-left w-full hover:bg-white/4 ${
                  active ? "font-semibold" : "font-normal"
                }`}
                style={{
                  background: active ? T.accentSoft : undefined,
                  borderColor: active ? `${T.accent}33` : "transparent",
                  color: active ? T.fg : T.fgMuted,
                }}
              >
                <SectionIcon id={s.id} active={active} color={active ? T.accent : T.fgMuted} />
                {s.label}
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="ml-50 flex-1 min-w-0">
          {children}
        </main>
      </div>

      {editProductOpen && (
        <EditProductModal
          theme={T}
          product={product}
          onClose={() => setEditProductOpen(false)}
          onSaved={() => { setEditProductOpen(false); router.refresh(); }}
        />
      )}

      {addProductOpen && (
        <AddProductModal
          theme={T}
          onClose={() => setAddProductOpen(false)}
          onCreated={(id: string) => {
            setAddProductOpen(false);
            router.push(`/${id}/screenshots`);
            router.refresh();
          }}
        />
      )}

      {addLocaleOpen && (
        <AddLocaleModal
          theme={T}
          productId={product.id}
          existingCodes={productLocales.map((l) => l.code)}
          sourceLoc={productLocales[0]}
          sourceMetadata={
            metadataMap[product.id]?.[productLocales[0].code] ??
            { name: product.name, subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "" }
          }
          rawProduct={rawProducts.find((p) => p.id === product.id)!}
          onClose={() => setAddLocaleOpen(false)}
          onAdded={(newLoc, metadata) => {
            setExtraLocales((prev) => ({
              ...prev,
              [product.id]: [...(prev[product.id] ?? []), newLoc],
            }));
            setMetadataMap((prev) => ({
              ...prev,
              [product.id]: { ...prev[product.id], [newLoc.code]: metadata },
            }));
            setLocale(newLoc.code);
          }}
        />
      )}
    </div>
  );
}

// ─── Locale Dropdown ──────────────────────────────────────────────────────────

import type { HydratedProduct } from "@/components/ProductContext";

function LocaleDropdown({ locales, locale, regenLocaleCode, theme: T, onSelect, onRegen, onAdd, onRemove }: {
  locales: LocaleDef[];
  locale: string;
  regenLocaleCode: string | null;
  theme: HydratedProduct["theme"];
  onSelect: (code: string) => void;
  onRegen: (code: string) => Promise<void>;
  onAdd: () => void;
  onRemove: (code: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const active = locales.find((l) => l.code === locale) ?? locales[0];
  const isRegen = regenLocaleCode === locale;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setConfirmDelete(null); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center gap-1.5 ml-auto">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-white/6 border border-white/10 rounded-lg px-2.5 py-1.25 cursor-pointer text-white text-[13px] font-semibold transition-all duration-150"
      >
        {active.flag && <span className="text-[15px]">{active.flag}</span>}
        <span>{active.label}</span>
        <ChevronDown size={12} className="opacity-50 ml-0.5" />
      </button>

      <button
        onClick={() => onRegen(locale)}
        disabled={!!regenLocaleCode}
        title="Re-generate with AI"
        className="flex items-center justify-center w-7 h-7 rounded-[7px] bg-white/6 border border-white/10 transition-all duration-150 disabled:cursor-not-allowed"
        style={{ color: isRegen ? "rgba(255,255,255,0.35)" : T.fgMuted }}
      >
        <RefreshCw size={12} className={isRegen ? "animate-spin" : ""} />
      </button>

      <button
        onClick={onAdd}
        title="Add language with AI"
        className="flex items-center justify-center w-7 h-7 rounded-[7px] bg-white/6 border border-white/10 cursor-pointer transition-all duration-150"
        style={{ color: T.fgMuted }}
      >
        <Plus size={14} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] right-0 z-300 bg-[#111114] border border-white/10 rounded-[10px] p-1 min-w-45 shadow-[0_16px_48px_rgba(0,0,0,0.7)]">
          {locales.map((loc) => {
            const isCurrent = loc.code === locale;
            const canRemove = locales.length > 1;
            const isPendingDelete = confirmDelete === loc.code;
            return (
              <div key={loc.code} className="flex items-center gap-1">
                <button
                  onClick={() => { if (!isPendingDelete) { onSelect(loc.code); setOpen(false); } }}
                  className={`flex items-center gap-2.5 flex-1 border rounded-[7px] px-2.5 py-1.75 text-left transition-colors duration-100 ${
                    isPendingDelete
                      ? "bg-red-500/10 border-red-500/30 cursor-default"
                      : isCurrent
                      ? "border-transparent cursor-pointer hover:bg-white/5"
                      : "bg-transparent border-transparent cursor-pointer hover:bg-white/5"
                  }`}
                  style={isCurrent && !isPendingDelete ? { background: T.accentSoft } : undefined}
                >
                  <span className="text-base">{loc.flag}</span>
                  {isPendingDelete
                    ? <span className="text-xs text-red-400 flex-1">Delete {loc.label}?</span>
                    : <span className={`text-[13px] flex-1 ${isCurrent ? "text-white font-semibold" : "text-[#ccc] font-normal"}`}>{loc.label}</span>
                  }
                  {isCurrent && !isPendingDelete && <Check size={13} color={T.accent} />}
                </button>
                {canRemove && (
                  isPendingDelete ? (
                    <div className="flex gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove(loc.code); setConfirmDelete(null); }}
                        title="Confirm delete"
                        className="flex items-center justify-center w-5.5 h-5.5 rounded-[5px] shrink-0 bg-red-500/20 border-none text-red-400 cursor-pointer text-[13px]"
                      >✓</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                        title="Cancel"
                        className="flex items-center justify-center w-5.5 h-5.5 rounded-[5px] shrink-0 bg-transparent border-none text-[#555] cursor-pointer text-sm"
                      >×</button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(loc.code); }}
                      title="Remove language"
                      className="flex items-center justify-center w-5.5 h-5.5 rounded-[5px] shrink-0 bg-transparent border-none text-[#555] cursor-pointer text-sm transition-all duration-100 hover:bg-red-500/15 hover:text-red-400"
                    >×</button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Add Locale Modal ─────────────────────────────────────────────────────────

import type { SerializableProductConfig } from "@/lib/types";

type AddLocaleModalProps = {
  theme: HydratedProduct["theme"];
  productId: string;
  existingCodes: string[];
  sourceLoc: LocaleDef;
  sourceMetadata: MetadataConfig;
  rawProduct: SerializableProductConfig;
  onClose: () => void;
  onAdded: (locale: LocaleDef, metadata: MetadataConfig) => void;
};

function AddLocaleModal({ theme: T, productId, existingCodes, sourceLoc, sourceMetadata, rawProduct, onClose, onAdded }: AddLocaleModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; current: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = COMMON_LOCALES.filter(
    (l) => l.label.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleLocale(loc: LocaleDef) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(loc.code) ? next.delete(loc.code) : next.add(loc.code);
      return next;
    });
  }

  async function handleGenerate() {
    if (selected.size === 0) return;
    setGenerating(true);
    setError(null);

    const slides = rawProduct.slides.iphone.map((s) => ({
      slideKey: s.id,
      label:    s.copy.label,
      headline: segmentsToPlain(s.copy.headline as RichTextSegment[]),
      subtitle: segmentsToPlain(s.copy.subtitle as RichTextSegment[]),
    }));

    const locales = COMMON_LOCALES.filter((l) => selected.has(l.code));
    let done = 0;

    for (const loc of locales) {
      setProgress({ done, total: locales.length, current: `${loc.flag ?? ""} ${loc.label}` });
      try {
        const res = await fetch("/api/generate-locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            targetLocale: loc.code,
            targetLabel:  loc.label,
            targetFlag:   loc.flag,
            sourceLocale: sourceLoc.code,
            sourceLabel:  sourceLoc.label,
            sourceFlag:   sourceLoc.flag,
            sourceMetadata,
            sourceSlides: slides,
          }),
        });
        const data = await res.json() as { ok?: boolean; error?: string; metadata?: MetadataConfig };
        if (res.ok && data.ok && data.metadata) {
          onAdded(loc, data.metadata);
        } else {
          setError(`${loc.label}: ${data.error ?? "failed"}`);
        }
      } catch (e) {
        setError(`${loc.label}: ${e instanceof Error ? e.message : "Network error"}`);
      }
      done++;
    }

    setProgress(null);
    setGenerating(false);
    onClose();
  }

  const hasSelected = selected.size > 0;

  return (
    <div
      className="fixed inset-0 z-500 bg-black/70 backdrop-blur-md flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget && !generating) onClose(); }}
    >
      <div className="bg-[#111114] border border-white/10 rounded-2xl w-95 max-h-[80vh] flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.8)]">
        <div className="px-5 pt-4.5 pb-3.5 border-b border-white/7 flex items-center justify-between">
          <div>
            <div className="font-bold text-[15px] text-white">Add language</div>
            <div className="text-xs text-[#666] mt-0.5">AI generates ASO-optimised copy</div>
          </div>
          <button
            onClick={onClose}
            disabled={generating}
            className="bg-transparent border-none text-[#666] text-xl leading-none p-1 disabled:cursor-not-allowed cursor-pointer"
          >×</button>
        </div>

        <div className="px-4 pt-3 pb-2">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search language…"
            className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-1.75 text-[13px] text-white outline-none box-border"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {filtered.length === 0 && (
            <div className="text-[#555] text-[13px] text-center py-5">No languages found</div>
          )}
          {filtered.map((loc) => {
            const exists  = existingCodes.includes(loc.code);
            const isActive = selected.has(loc.code);
            const blocked = generating || exists;
            return (
              <button
                key={loc.code}
                onClick={() => !exists && toggleLocale(loc)}
                disabled={blocked}
                className={`flex items-center gap-2.5 w-full border rounded-lg px-3 py-2 text-left transition-all duration-120 ${
                  blocked ? "cursor-default" : "cursor-pointer"
                } ${exists ? "opacity-40" : ""} ${
                  isActive ? "border-opacity-[0.27]" : "border-transparent"
                } ${!isActive && !blocked ? "hover:bg-white/4" : ""}`}
                style={{
                  background: isActive ? T.accentSoft : undefined,
                  borderColor: isActive ? `${T.accent}44` : undefined,
                }}
              >
                <span className="text-lg leading-none">{loc.flag}</span>
                <span className={`text-[13px] ${isActive ? "text-white font-semibold" : "text-[#ccc] font-normal"}`}>{loc.label}</span>
                <span className="text-[11px] text-[#555] ml-auto">{loc.code}</span>
                {exists && <span className="text-[10px] text-[#555] bg-white/6 rounded px-1.5 py-0.5">Added</span>}
                {isActive && !exists && <Check size={14} color={T.accent} />}
              </button>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-white/7">
          {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
          {progress && (
            <div className="text-xs text-[#999] mb-2">
              Generating {progress.current} ({progress.done + 1}/{progress.total})…
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={!hasSelected || generating}
            className="w-full py-2.25 px-4 rounded-[9px] border-none font-bold text-[13px] transition-all duration-150 disabled:cursor-not-allowed"
            style={{
              background: hasSelected && !generating ? T.accent : "rgba(255,255,255,0.08)",
              color: hasSelected && !generating ? "#fff" : "#555",
              boxShadow: hasSelected && !generating ? `0 2px 14px ${T.accentGlow}` : "none",
            }}
          >
            {generating
              ? "Generating…"
              : hasSelected
              ? `Generate ${selected.size} language${selected.size > 1 ? "s" : ""}`
              : "Select languages"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Product Modal ────────────────────────────────────────────────────────

function AddProductModal({ theme: T, onClose, onCreated }: {
  theme: HydratedProduct["theme"];
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setIconFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setIconPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setIconPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      if (iconFile) form.append("icon", iconFile);
      const res = await fetch("/api/products", { method: "POST", body: form });
      const data = await res.json() as { ok?: boolean; id?: string; error?: string };
      if (res.ok && data.ok && data.id) {
        onCreated(data.id);
      } else {
        setError(data.error ?? "Failed to create product");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = name.trim().length > 0 && !saving;

  return (
    <div
      className="fixed inset-0 z-500 bg-black/70 backdrop-blur-md flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div className="bg-[#111114] border border-white/10 rounded-2xl w-88 flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.8)]">
        <div className="px-5 pt-4.5 pb-3.5 border-b border-white/7 flex items-center justify-between">
          <div>
            <div className="font-bold text-[15px] text-white">Add product</div>
            <div className="text-xs text-[#666] mt-0.5">Creates a new app with default slides</div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="bg-transparent border-none text-[#666] text-xl leading-none p-1 disabled:cursor-not-allowed cursor-pointer"
          >×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          {/* Icon upload */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:border-white/30 overflow-hidden bg-white/4"
            >
              {iconPreview
                ? <img src={iconPreview} alt="icon" className="w-full h-full object-cover" />
                : <Plus size={20} color="#555" />
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
            <div className="flex flex-col gap-1">
              <div className="text-[13px] text-white font-medium">App icon</div>
              <div className="text-[11px] text-[#555]">Optional — PNG recommended</div>
              {iconFile && (
                <button
                  type="button"
                  onClick={() => { setIconFile(null); setIconPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="text-[11px] text-[#666] bg-transparent border-none cursor-pointer text-left hover:text-red-400 transition-colors"
                >Remove</button>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#999]">App name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My App"
              maxLength={60}
              className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-white/25 box-border transition-colors"
            />
          </div>

          {error && <div className="text-xs text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.25 px-4 rounded-[9px] border-none font-bold text-[13px] transition-all duration-150 disabled:cursor-not-allowed mt-1"
            style={{
              background: canSubmit ? T.accent : "rgba(255,255,255,0.08)",
              color: canSubmit ? "#fff" : "#555",
              boxShadow: canSubmit ? `0 2px 14px ${T.accentGlow}` : "none",
            }}
          >
            {saving ? "Creating…" : "Create product"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Product Modal ───────────────────────────────────────────────────────

function EditProductModal({ theme: T, product, onClose, onSaved }: {
  theme: HydratedProduct["theme"];
  product: HydratedProduct;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [accent, setAccent] = useState(T.accent);
  const [bundleId, setBundleId] = useState(product.bundleId ?? "");
  const [packageName, setPackageName] = useState(product.packageName ?? "");
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState(product.privacyPolicyUrl ?? "");
  const [supportUrl, setSupportUrl] = useState(product.supportUrl ?? "");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setIconFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setIconPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setIconPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("productId", product.id);
      form.append("name", name.trim());
      form.append("accent", accent);
      form.append("bundleId", bundleId);
      form.append("packageName", packageName);
      form.append("privacyPolicyUrl", privacyPolicyUrl);
      form.append("supportUrl", supportUrl);
      if (iconFile) form.append("icon", iconFile);
      const res = await fetch("/api/product-settings", { method: "POST", body: form });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        onSaved();
      } else {
        setError(data.error ?? "Failed to save");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-white/25 box-border transition-colors font-[inherit]";
  const labelCls = "text-[12px] font-medium text-[#999]";

  return (
    <div
      className="fixed inset-0 z-500 bg-black/70 backdrop-blur-md flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div className="bg-[#111114] border border-white/10 rounded-2xl w-110 max-h-[90vh] overflow-y-auto flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="px-5 pt-4.5 pb-3.5 border-b border-white/7 flex items-center justify-between sticky top-0 bg-[#111114] z-10">
          <div>
            <div className="font-bold text-[15px] text-white">Edit product</div>
            <div className="text-xs text-[#666] mt-0.5">{product.id}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="bg-transparent border-none text-[#666] text-xl leading-none p-1 disabled:cursor-not-allowed cursor-pointer"
          >×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          {/* Icon + Name row */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:border-white/30 overflow-hidden bg-white/4"
            >
              {iconPreview
                ? <img src={iconPreview} alt="icon" className="w-full h-full object-cover" />
                : product.iconPath
                ? <img src={product.iconPath} alt="icon" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                : <Plus size={20} color="#555" />
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
            <div className="flex flex-col gap-1.5 flex-1">
              <label className={labelCls}>App name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My App"
                maxLength={60}
                className={inputCls}
              />
            </div>
          </div>

          {/* Accent colour */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Accent colour</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-9 h-9 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0.5"
              />
              <input
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                placeholder="#6366F1"
                maxLength={7}
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/7" />

          {/* Store IDs */}
          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-bold tracking-widest uppercase text-[#555]">Store Publishing</div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Apple Bundle ID</label>
              <input value={bundleId} onChange={(e) => setBundleId(e.target.value)} placeholder="com.example.myapp" className={`${inputCls} font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Google Package Name</label>
              <input value={packageName} onChange={(e) => setPackageName(e.target.value)} placeholder="com.example.myapp" className={`${inputCls} font-mono`} />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/7" />

          {/* URLs */}
          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-bold tracking-widest uppercase text-[#555]">URLs</div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Privacy Policy URL</label>
              <input value={privacyPolicyUrl} onChange={(e) => setPrivacyPolicyUrl(e.target.value)} placeholder="https://example.com/privacy" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Support URL</label>
              <input value={supportUrl} onChange={(e) => setSupportUrl(e.target.value)} placeholder="https://example.com/support" className={inputCls} />
            </div>
          </div>

          {error && <div className="text-xs text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="w-full py-2.25 px-4 rounded-[9px] border-none font-bold text-[13px] transition-all duration-150 disabled:cursor-not-allowed mt-1"
            style={{
              background: name.trim() && !saving ? accent : "rgba(255,255,255,0.08)",
              color: name.trim() && !saving ? "#fff" : "#555",
              boxShadow: name.trim() && !saving ? `0 2px 14px ${T.accentGlow}` : "none",
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SectionIcon({ id, color }: { id: string; active: boolean; color: string }) {
  const props = { size: 15, color };
  switch (id) {
    case "screenshots":     return <Smartphone {...props} />;
    case "feature-graphic": return <Image {...props} />;
    case "social-og":       return <Share2 {...props} />;
    case "cta":             return <MousePointerClick {...props} />;
    case "metadata":        return <AlignLeft {...props} />;
    default:                return null;
  }
}
