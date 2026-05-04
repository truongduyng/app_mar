import React from "react";
import type { ProductConfig } from "@/lib/types";
import { HoneSlide1, HoneSlide2, HoneSlide3, HoneSlide4, HoneSlide5, HoneSlide6, HoneSlide7 } from "./slides";
import { HONE_THEME as T } from "./theme";
import { HONE_METADATA } from "./metadata";

export const HONE: ProductConfig = {
  id: "hone",
  name: "Life Refine",
  iconPath: "/products/hone/icon.png",
  screenshotBase: "/products/hone/screenshots",
  theme: T,
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
    headline: "Small habits repeated = Big change",
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
  metadata: HONE_METADATA,
};
