import React from "react";
import type { ProductConfig, ThemeTokens } from "@/lib/types";
import { HoneSlide1, HoneSlide2, HoneSlide3, HoneSlide4, HoneSlide5, HoneSlide6, HoneSlide7 } from "./slides";

export const HONE_THEME: ThemeTokens = {
  bg: "#0A0A0C",
  bgAlt: "#111114",
  fg: "#F8F8F2",
  fgMuted: "#8A8A94",
  accent: "#F97316",
  accentGlow: "rgba(249,115,22,0.35)",
  accentSoft: "rgba(249,115,22,0.12)",
  surface: "rgba(255,255,255,0.04)",
  gradients: {
    dark: "linear-gradient(180deg, #0A0A0C 0%, #12120F 50%, #0A0A0C 100%)",
    warm: "linear-gradient(180deg, #0F0D0A 0%, #1A150E 40%, #0F0D0A 100%)",
    accent: "linear-gradient(135deg, #0A0A0C 0%, #1A120A 50%, #0A0A0C 100%)",
    deep: "linear-gradient(180deg, #08080A 0%, #0F0E10 50%, #08080A 100%)",
    hero: "linear-gradient(180deg, #0E0C08 0%, #141008 35%, #0A0A0C 100%)",
  },
};

const T = HONE_THEME;

export const HONE: ProductConfig = {
  id: "hone",
  name: "Hone Daily",
  iconPath: "/products/hone/icon.png",
  screenshotBase: "/products/hone/screenshots",
  theme: HONE_THEME,
  slides: {
    iphone: [
      {
        id: "hero",
        copy: {
          label: "THE POWER OF SMALL HABITS",
          headline: <>Lasting Change.<br /><span style={{ color: T.accent }}>Starts Today.</span></>,
          subtitle: "Focus on daily, sustainable actions for a better you.",
        },
        Component: HoneSlide1,
      },
      {
        id: "journal",
        copy: {
          label: "MINDFUL REFLECTION",
          headline: <>Reflect. Align.<br /><span style={{ color: T.accent }}>Thrive.</span></>,
          subtitle: <>Journal your daily thoughts. Let AI guide your emotional well-being and mental clarity.</>,
        },
        Component: HoneSlide2,
      },
      {
        id: "protocol",
        copy: {
          label: "DAILY WELL-BEING",
          headline: <>Micro-Habits.<br /><span style={{ color: T.accent }}>Macro Growth.</span></>,
          subtitle: <>Focus on sustainable actions that improve your life over time.</>,
        },
        Component: HoneSlide3,
      },
      {
        id: "reward",
        copy: {
          label: "STAY CONSISTENT",
          headline: <>Celebrate<br /><span style={{ color: T.accent }}>Every Win</span></>,
          subtitle: <>Every small step counts. Build the momentum that makes change inevitable.</>,
        },
        Component: HoneSlide7,
      },
      {
        id: "progress",
        copy: {
          label: "HOLISTIC PROGRESS",
          headline: <>Visualize<br /><span style={{ color: T.accent }}>Your Evolution</span></>,
          subtitle: <>Track mood patterns, energy levels, and habit consistency in one unified view.</>,
        },
        Component: HoneSlide4,
      },
      {
        id: "goals",
        copy: {
          label: "SYSTEMS FOR LIFE",
          headline: <>Daily Actions<br /><span style={{ color: T.accent }}>Not Overhauls</span></>,
          subtitle: <>Ditch the overnight pressure. Build systems that integrate into your lifestyle.</>,
        },
        Component: HoneSlide5,
      },
      {
        id: "proof",
        copy: {
          label: "YOUR JOURNEY",
          headline: <>Document<br /><span style={{ color: T.accent }}>The Best You</span></>,
          subtitle: <>Share your path to well-being and celebrate the compounding power of daily habits.</>,
        },
        Component: HoneSlide6,
      },
    ],
  },
  ctaImage: {
    headline: "everything you need to start",
    sc1: "sc_hone1.png",
    sc2: "sc_hone2.png",
    ctaLabel: "↑ link in bio",
  },
  featureGraphic: {
    tagline: "Refine your life daily with HONE",
    subtitle: "Sharpen your edge. Every day.",
  },
  socialOg: {
    tagline: "Refine your life daily with HONE",
    subtitle: "Daily protocols, AI coaching, and progress tracking for peak performance.",
  },
  metadata: {
    name: "Hone Daily",
    subtitle: "Refine your life daily with AI",
    promoText: "Focus on the daily, sustainable actions that improve your physical, mental, and emotional well-being.",
    shortDescription: "Cultivate lasting change through small, consistent habits and AI-guided reflection.",
    keywords: "daily habits,well-being,mindfulness,habit tracker,self improvement,reflection,wellness,journal",
    description: `Stop chasing overnight overhauls. Start cultivating lasting change with the power of small, consistent habits.

Hone is your personal AI companion designed to help you focus on the daily, sustainable actions that improve your physical, mental, and emotional well-being over time. By shifting the focus from massive results to daily repetitions, Hone makes personal growth inevitable and burnout impossible.

THE COMPOUNDING EFFECT OF MICRO-HABITS

Science shows that small, consistent actions are significantly more effective for lasting change than ambitious, one-time efforts. Hone is built entirely on this principle: winning the day, one habit at a time.

HOW HONE WORKS

1. REFLECT - Journal your thoughts, feelings, and actions. Our AI companion listens with empathy, helping you identify patterns and find clarity in your daily life.

2. CULTIVATE - Hone automatically transforms your reflections into small, actionable habits. No more complex planning—just focus on the next sustainable step.

3. EVOLVE - Watch your progress compound. With visual heatmaps, mood flow tracking, and consistency streaks, you can see the tangible results of your daily commitment to well-being.

KEY FEATURES

- AI-Powered Mindful Journaling - A reflective space to clear your mind and gain insight.
- Smart Habit Extraction - AI turns your reflections into manageable, daily actions.
- Holistic Well-being Tracking - Monitor your mood, energy, and consistency in one place.
- Voice & Photo Journaling - Capture your journey in whatever way feels most natural.
- Consistency Heatmap - Visualize the momentum you're building every single day.
- Privacy-First - Your journey is for your eyes only. Local encryption, no cloud, no ads.

Hone isn't about being perfect. It's about being consistent. Sharpen your life, one day at a time.

Questions? support@thehoneapp.com
Privacy: https://thehoneapp.com/privacy
Terms: https://thehoneapp.com/terms`,
  },
};
