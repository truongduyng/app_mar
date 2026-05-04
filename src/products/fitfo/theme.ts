import type { ThemeTokens } from "@/lib/types";

export const FITFO_THEME: ThemeTokens = {
  bg: "#0A0A0B",
  bgAlt: "#0F0F10",
  fg: "#F8F8F6",
  fgMuted: "#8A8A90",
  accent: "#F97316",
  accentGlow: "rgba(249,115,22,0.35)",
  accentSoft: "rgba(249,115,22,0.12)",
  surface: "rgba(249,115,22,0.06)",
  gradients: {
    dark: "linear-gradient(180deg, #0A0A0B 0%, #0F0F10 50%, #0A0A0B 100%)",
    warm: "linear-gradient(180deg, #0C0A08 0%, #181008 40%, #0C0A08 100%)",
    accent: "linear-gradient(135deg, #0A0A0B 0%, #140D06 50%, #0A0A0B 100%)",
    deep: "linear-gradient(180deg, #080808 0%, #0E0B07 50%, #080808 100%)",
    hero: "linear-gradient(180deg, #0C0B09 0%, #16100A 35%, #0A0A0B 100%)",
  },
};
