import type { ProductConfig } from "@/lib/types";
import {
  LichtaSlide1, LichtaSlide2, LichtaSlide3, LichtaSlide4,
  LichtaSlide5, LichtaSlide6, LichtaSlide7,
  LichtaAndroid1, LichtaAndroid2, LichtaAndroid3, LichtaAndroid4,
  LichtaAndroid5, LichtaAndroid6, LichtaAndroid7,
} from "./slides";
import { LICHTA_THEME } from "./theme";
import { LICHTA_COPY as C } from "./copy";
import { LICHTA_METADATA } from "./metadata";

const SLIDE_IDS = ["hero", "events", "calendar", "ai", "themes", "wisdom", "widgets"] as const;

function slide(id: typeof SLIDE_IDS[number], Component: React.FC<any>, defaultLocale: "vi" | "en" = "vi") {
  const locales = C[id];
  const [first, ...rest] = Object.entries(locales);
  const copyByLocale = Object.fromEntries(rest);
  return { id, copy: locales[defaultLocale], copyByLocale, Component };
}

export const LICHTA: ProductConfig = {
  id: "lichta",
  name: "Lịch Ta - Lịch Âm & Tử Vi AI",
  iconPath: "/products/lichta/icon.png",
  screenshotBase: "/products/lichta/screenshots",
  theme: LICHTA_THEME,
  locales: [
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", label: "English",    flag: "🇺🇸" },
  ],
  slides: {
    iphone: [
      slide("hero",     LichtaSlide1),
      slide("events",   LichtaSlide2),
      slide("calendar", LichtaSlide3),
      slide("ai",       LichtaSlide4),
      slide("themes",   LichtaSlide5),
      slide("wisdom",   LichtaSlide6),
      slide("widgets",  LichtaSlide7),
    ],
    android: [
      slide("hero",     LichtaAndroid1),
      slide("events",   LichtaAndroid2),
      slide("calendar", LichtaAndroid3),
      slide("ai",       LichtaAndroid4),
      slide("themes",   LichtaAndroid5),
      slide("wisdom",   LichtaAndroid6),
      slide("widgets",  LichtaAndroid7),
    ],
  },
  ctaImage: {
    headline: "Lịch Âm & Tử Vi trong tầm tay",
    sc1: "sc1.png",
    sc2: "sc2.png",
    ctaLabel: "↑ link in bio",
  },
  featureGraphic: {
    tagline: "Lịch Ta",
    subtitle: "Lịch âm, Can Chi, Tiết Khí - tất cả ở một chỗ.",
  },
  socialOg: {
    tagline: "Lịch Ta - Lịch Âm & Tử Vi AI",
    subtitle: "Âm lịch, Can Chi, Hoàng Đạo, Tử Vi AI và hơn thế nữa.",
  },
  metadata:         LICHTA_METADATA["vi"],
  metadataByLocale: LICHTA_METADATA,
};
