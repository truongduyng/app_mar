import React from "react";
import type { ProductConfig } from "@/lib/types";
import { AmfoSlide1, AmfoSlide2, AmfoSlide3, AmfoSlide4, AmfoSlide5 } from "./slides";
import { AMFO_THEME as T } from "./theme";
import { AMFO_METADATA } from "./metadata";

export const AMFO: ProductConfig = {
  id: "amfo",
  name: "Amfo: Ambient Focus Sounds",
  iconPath: "/products/amfo/icon.png",
  screenshotBase: "/products/amfo/screenshots",
  theme: T,
  slides: {
    iphone: [
      {
        id: "calm",
        copy: {
          label: "AMBIENT SOUNDS",
          headline: <>Find<br /><span style={{ color: T.accent }}>your calm.</span></>,
          subtitle: <>50+ curated ambient sounds<br />for focus, sleep, and flow.</>,
        },
        Component: AmfoSlide1,
      },
      {
        id: "mix",
        copy: {
          label: "SOUND MIXER",
          headline: <>Layer sounds.<br /><span style={{ color: T.accent }}>Save presets.</span></>,
          subtitle: <>Mix rain, café, and nature.<br />Save your perfect combinations.</>,
        },
        Component: AmfoSlide2,
      },
      {
        id: "timer",
        copy: {
          label: "FOCUS TIMER",
          headline: <>Set a timer.<br /><span style={{ color: T.accent }}>Disappear.</span></>,
          subtitle: <>Custom durations to perfectly<br />match your workflow or sleep.</>,
        },
        Component: AmfoSlide3,
      },
      {
        id: "focus",
        copy: {
          label: "DEEP FOCUS",
          headline: <>Silence<br /><span style={{ color: T.accent }}>the noise.</span></>,
          subtitle: <>A beautiful, distraction-free<br />timer keeps you locked in.</>,
        },
        Component: AmfoSlide4,
      },
      {
        id: "settings",
        copy: {
          label: "CUSTOMIZE",
          headline: <>Your perfect<br /><span style={{ color: T.accent }}>environment</span></>,
          subtitle: <>Auto-hide controls. Sleep fade out.<br />Make the app work for you.</>,
        },
        Component: AmfoSlide5,
      },
    ],
  },
  ctaImage: {
    headline: "drown out the world, dial into focus",
    sc1: "sc_amfo2.png",
    sc2: "sc_amfo3.png",
    ctaLabel: "↑ link in bio",
  },
  featureGraphic: {
    tagline: "Amfo: Ambient Focus Sounds",
    subtitle: "50+ ambient sounds for focus, sleep, and flow.",
  },
  socialOg: {
    tagline: "Amfo: Ambient Focus Sounds",
    subtitle: "Curated ambient sounds and custom mixes for deep focus and restful sleep.",
  },
  metadata: AMFO_METADATA,
};
