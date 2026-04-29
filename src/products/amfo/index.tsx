import React from "react";
import type { ProductConfig, ThemeTokens } from "@/lib/types";
import { AmfoSlide1, AmfoSlide2, AmfoSlide3, AmfoSlide4, AmfoSlide5, AmfoSlide6 } from "./slides";

export const AMFO_THEME: ThemeTokens = {
  bg: "#09090F",
  bgAlt: "#0F0F1A",
  fg: "#F0EEFF",
  fgMuted: "#9090B0",
  accent: "#A78BFA",
  accentGlow: "rgba(167,139,250,0.35)",
  accentSoft: "rgba(167,139,250,0.12)",
  surface: "rgba(139,92,246,0.06)",
  gradients: {
    dark: "linear-gradient(180deg, #09090F 0%, #100F1C 50%, #09090F 100%)",
    warm: "linear-gradient(180deg, #0C0B18 0%, #130F24 40%, #0C0B18 100%)",
    accent: "linear-gradient(135deg, #09090F 0%, #12102A 50%, #09090F 100%)",
    deep: "linear-gradient(180deg, #07070D 0%, #0D0C1A 50%, #07070D 100%)",
    hero: "linear-gradient(180deg, #0B0A16 0%, #110E22 35%, #09090F 100%)",
  },
};

const T = AMFO_THEME;

export const AMFO: ProductConfig = {
  id: "amfo",
  name: "Amfo: Ambient Focus Sounds",
  iconPath: "/products/amfo/icon.png",
  screenshotBase: "/products/amfo/screenshots",
  theme: AMFO_THEME,
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
  metadata: {
    name: "Amfo: Ambient Focus Sounds",
    subtitle: "Ambient Sounds, Focus, Sleep",
    promoText: "50+ curated ambient sounds - mix rain, café, and nature for your perfect focus session.",
    shortDescription: "Ambient sounds and custom mixes for focus, sleep, and relaxation.",
    keywords: "ambient sounds,white noise,focus,sleep sounds,nature sounds,rain sounds,sound mixer,relaxation",
    description: `Find your calm and enter deep flow with Amfo.

Mix 50+ curated ambient sounds to create your perfect environment. Whether you need deep focus for work, a calming atmosphere for study, or peaceful background noise to fall asleep, Amfo gives you the tools to silence distractions.

FEATURES
- Mix unlimited sounds with independent volumes
- Save your favorite mixes as custom Presets
- Beautiful distraction-free Focus Timer
- Auto-hide UI during active timer sessions
- Sleep Fade Out for bedtime routines
- Background audio: Keeps playing when you switch apps
- Absolutely zero intrusive ads

SOUNDS LIBRARY

Rain -- Gentle rain, city rain, forest rain, rain on window, thunder storms,
autumn rain, Portland rain, and more
Nature -- Ocean waves, beach waves, forest birds, strong wind, slow stream,
small waterfall, seagulls, rustling aspens
Noise -- White, brown, pink, purple, green, blue, violet, orange, deep brown
noise -- all the colors
Ambient -- Crackling fire, cafe chatter, train, airplane, box fan, air
conditioner, dishwasher, zen garden
Binaural -- Calm Focus 10Hz, Focus 15Hz, Deep Sleep 1.5Hz, Unwind 6Hz
Mixes -- Curated combinations like Forest Rain & Birds

--------------------

WHY PEOPLE LOVE AMFO

- Mix unlimited sounds -- Layer rain + cafe + brown noise, or any combo you want
- Individual volume controls -- Fine-tune each sound to your perfect balance
- Focus timer -- Set sessions up to 120 minutes with a beautiful circular UI
- Auto-hide mode -- Timer disappears so you can focus without screen distractions
- Background audio -- Keeps playing when you lock your phone or switch apps
- Beautiful dark design -- Stunning glassmorphic interface that's easy on your eyes
- Haptic feedback -- Subtle tactile responses that make the app feel great

--------------------

PERFECT FOR

- Deep work and concentration
- Studying and reading
- ADHD focus support
- Falling asleep and staying asleep
- Meditation and mindfulness
- Masking distracting office or home noise
- Calming anxiety and stress relief
- Napping and power rests

--------------------

Privacy Policy: https://www.apple.com/legal/privacy/
Terms of Service: https://www.apple.com/legal/internet-services/itunes/`,
  },
};
