import React from "react";
import type { ProductConfig } from "@/lib/types";
import {
  FitFoSlide1, FitFoSlide2, FitFoSlide3, FitFoSlide4,
  FitFoSlide5, FitFoSlide6, FitFoSlide7, FitFoSlide8,
} from "./slides";
import { FITFO_THEME as T } from "./theme";
import { FITFO_METADATA } from "./metadata";

export const FITFO: ProductConfig = {
  id: "fitfo",
  name: "FitFo: Workout Plan & Log Pal",
  iconPath: "/products/fitfo/icon.png",
  screenshotBase: "/products/fitfo/screenshots",
  theme: T,
  locales: [
    { code: "en", label: "English", flag: "🇺🇸" },
  ],
  slides: {
    iphone: [
      {
        id: "hero",
        copy: {
          label: "FITNESS TRACKER",
          headline: <>Your fitness.<br /><span style={{ color: T.accent }}>Scored.</span></>,
          subtitle: <>Track workouts, calories, and progress<br />with a personal AI-generated plan.</>,
        },
        Component: FitFoSlide1,
      },
      {
        id: "workout",
        copy: {
          label: "AI WORKOUT PLAN",
          headline: <>Train smarter.<br /><span style={{ color: T.accent }}>Every day.</span></>,
          subtitle: <>A daily workout built around<br />your goals, schedule, and body type.</>,
        },
        Component: FitFoSlide2,
      },
      {
        id: "nutrition",
        copy: {
          label: "NUTRITION TRACKING",
          headline: <>Fuel the<br /><span style={{ color: T.accent }}>right way.</span></>,
          subtitle: <>Track macros and calories for every meal.<br />Adjust for training and rest days.</>,
        },
        Component: FitFoSlide3,
      },
      {
        id: "fit-score",
        copy: {
          label: "PERSONAL FIT SCORE",
          headline: <>Know where<br /><span style={{ color: T.accent }}>you stand.</span></>,
          subtitle: <>Your fitness mapped across strength,<br />stamina, discipline, and more.</>,
        },
        Component: FitFoSlide4,
      },
      {
        id: "forecast",
        copy: {
          label: "30-DAY FORECAST",
          headline: <>See what's<br /><span style={{ color: T.accent }}>possible.</span></>,
          subtitle: <>Your AI plan predicts muscle gained,<br />calories burned, and score growth.</>,
        },
        Component: FitFoSlide5,
      },
      {
        id: "body-type",
        copy: {
          label: "PERSONALIZED ONBOARDING",
          headline: <>Built for<br /><span style={{ color: T.accent }}>your body.</span></>,
          subtitle: <>FitFo learns your somatotype and builds<br />a plan that actually fits you.</>,
        },
        Component: FitFoSlide6,
      },
      {
        id: "progress",
        copy: {
          label: "VISUAL PROGRESS",
          headline: <>Watch the<br /><span style={{ color: T.accent }}>change.</span></>,
          subtitle: <>Log progress photos and your profile<br />side by side — see your transformation.</>,
        },
        Component: FitFoSlide7,
      },
      {
        id: "more",
        copy: {
          label: "EVERYTHING YOU NEED",
          headline: <>And so<br /><span style={{ color: T.accent }}>much more.</span></>,
          subtitle: <>Every tool to hit your goal, in one app.</>,
        },
        Component: FitFoSlide8,
      },
    ],
  },
  ctaImage: {
    headline: "Your fitness, scored, tracked and coached — all in one place.",
    sc1: "sc1.png",
    sc2: "sc2.png",
    ctaLabel: "↑ link in bio",
  },
  featureGraphic: {
    tagline: "FitFo Workout AI Planner & Log",
    subtitle: "Workouts, nutrition, progress photos, and a personal Fit Score — all in one place.",
  },
  socialOg: {
    tagline: "FitFo Workout AI Planner & Log",
    subtitle: "AI workout plans, macro tracking, progress photos, and a personal Fit Score.",
  },
  metadata: FITFO_METADATA,
};
