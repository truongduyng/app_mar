import type { ThemeTokens } from "@/lib/types";

export const LICHTA_THEME: ThemeTokens = {
  bg: "#1A0A06",
  bgAlt: "#230E08",
  fg: "#FFF5EF",
  fgMuted: "#C4957A",
  accent: "#E8321A",
  accentGlow: "rgba(232,50,26,0.38)",
  accentSoft: "rgba(232,50,26,0.13)",
  surface: "rgba(232,50,26,0.07)",
  gradients: {
    dark: "linear-gradient(180deg, #1A0A06 0%, #200D08 50%, #1A0A06 100%)",
    warm: "linear-gradient(180deg, #180C07 0%, #261208 40%, #180C07 100%)",
    accent: "linear-gradient(135deg, #1A0A06 0%, #2A1008 50%, #1A0A06 100%)",
    deep: "linear-gradient(180deg, #120805 0%, #1C0C07 50%, #120805 100%)",
    hero: "linear-gradient(180deg, #1D0C07 0%, #2A1108 35%, #1A0A06 100%)",
  },
};
