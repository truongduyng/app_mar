import type { ThemeTokens } from "@/lib/types";

export const TINYSTEPS_THEME: ThemeTokens = {
  bg: "#0A0F0A",
  bgAlt: "#0E140E",
  fg: "#F5F8F2",
  fgMuted: "#8A9A82",
  accent: "#6B8E68",
  accentGlow: "rgba(107,142,104,0.35)",
  accentSoft: "rgba(107,142,104,0.12)",
  surface: "rgba(107,142,104,0.06)",
  gradients: {
    dark: "linear-gradient(180deg, #0A0F0A 0%, #0F150E 50%, #0A0F0A 100%)",
    warm: "linear-gradient(180deg, #0C100A 0%, #14190F 40%, #0C100A 100%)",
    accent: "linear-gradient(135deg, #0A0F0A 0%, #121D10 50%, #0A0F0A 100%)",
    deep: "linear-gradient(180deg, #080C08 0%, #0E130D 50%, #080C08 100%)",
    hero: "linear-gradient(180deg, #0C110A 0%, #141C10 35%, #0A0F0A 100%)",
  },
};
