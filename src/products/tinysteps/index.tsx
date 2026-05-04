import type { ProductConfig } from "@/lib/types";
import {
  TinyStepsSlide1, TinyStepsSlide2, TinyStepsSlide3,
  TinyStepsSlide4, TinyStepsSlide5, TinyStepsSlide6, TinyStepsSlide7,
  TinyStepsViSlide1, TinyStepsViSlide2, TinyStepsViSlide3, TinyStepsViSlide4,
  TinyStepsViSlide5, TinyStepsViSlide6,
} from "./slides";
import { TINYSTEPS_THEME } from "./theme";
import { TINYSTEPS_COPY as C, TINYSTEPS_COPY_VI as CVI } from "./copy";
import { TINYSTEPS_METADATA } from "./metadata";

export const TINYSTEPS: ProductConfig = {
  id: "tinysteps",
  name: "TinySteps: Baby Growth Tracker",
  iconPath: "/products/tinysteps/icon.png",
  screenshotBase: "/products/tinysteps/screenshots/en",
  screenshotBaseByLocale: {
    en: "/products/tinysteps/screenshots/en",
    vi: "/products/tinysteps/screenshots/vi",
  },
  theme: TINYSTEPS_THEME,
  locales: [
    { code: "en", label: "English",     flag: "🇺🇸" },
    { code: "vi", label: "Tiếng Việt",  flag: "🇻🇳" },
  ],
  slides: {
    iphone: [
      { id: "hero",         copy: C.hero["en"],         copyByLocale: { vi: C.hero["vi"] },         Component: TinyStepsSlide1 },
      { id: "milestones",   copy: C.milestones["en"],   copyByLocale: { vi: C.milestones["vi"] },   Component: TinyStepsSlide2 },
      { id: "vaccinations", copy: C.vaccinations["en"], copyByLocale: { vi: C.vaccinations["vi"] }, Component: TinyStepsSlide3 },
      { id: "journal",      copy: C.journal["en"],      copyByLocale: { vi: C.journal["vi"] },      Component: TinyStepsSlide4 },
      { id: "ai-chat",      copy: C["ai-chat"]["en"],   copyByLocale: { vi: C["ai-chat"]["vi"] },   Component: TinyStepsSlide5 },
      { id: "family",       copy: C.family["en"],       copyByLocale: { vi: C.family["vi"] },       Component: TinyStepsSlide6 },
      { id: "growth",       copy: C.growth["en"],       copyByLocale: { vi: C.growth["vi"] },       Component: TinyStepsSlide7 },
    ],
  },
  slidesByLocale: {
    vi: {
      iphone: [
        { id: "hero",         copy: CVI.hero["vi"],         Component: TinyStepsViSlide1 },
        { id: "journal",      copy: CVI.journal["vi"],      Component: TinyStepsViSlide2 },
        { id: "ai-chat",      copy: CVI["ai-chat"]["vi"],   Component: TinyStepsViSlide3 },
        { id: "settings",     copy: CVI.settings["vi"],     Component: TinyStepsViSlide4 },
        { id: "milestones",   copy: CVI.milestones["vi"],   Component: TinyStepsViSlide5 },
        { id: "vaccinations", copy: CVI.vaccinations["vi"], Component: TinyStepsViSlide6 },
      ],
    },
  },
  ctaImage: {
    headline: "track your baby's growth, milestones, and vaccinations",
    headlineByLocale: {
      vi: "Cùng bé lớn lên với sự an tâm",
    },
    sc1: "sc1.png",
    sc2: "sc2.png",
    ctaLabel: "↑ link in bio",
  },
  featureGraphic: {
    tagline: "TinySteps: Baby Growth Tracker",
    subtitle: "Track milestones, vaccinations, and growth — all in one place.",
  },
  socialOg: {
    tagline: "TinySteps: Baby Growth Tracker",
    subtitle: "Beautiful growth charts, milestone tracking, AI insights, and family sharing.",
  },
  metadata:         TINYSTEPS_METADATA["en"],
  metadataByLocale: TINYSTEPS_METADATA,
};
