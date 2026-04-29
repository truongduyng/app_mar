import React from "react";
import type { ProductConfig, ThemeTokens } from "@/lib/types";
import {
  FitFoSlide1, FitFoSlide2, FitFoSlide3, FitFoSlide4,
  FitFoSlide5, FitFoSlide6, FitFoSlide7, FitFoSlide8,
} from "./slides";

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

const T = FITFO_THEME;

export const FITFO: ProductConfig = {
  id: "fitfo",
  name: "FitFo",
  iconPath: "/products/fitfo/icon.png",
  screenshotBase: "/products/fitfo/screenshots",
  theme: FITFO_THEME,
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
    headline: "train. track. transform",
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
  metadata: {
    name: "FitFo Workout AI Planner & Log",
    subtitle: "Workout Plan & Nutrition with AI coach",
    promoText: "AI-generated workout plans and macro tracking built around your body type and goals.",
    shortDescription: "AI fitness tracker with workouts, nutrition, progress photos, and Fit Score.",
    keywords: "fitness tracker,workout planner,macro tracker,AI workout,calorie tracker,strength training",
    description: `Your fitness, scored. FitFo is the all-in-one AI fitness companion that builds a plan around your body type, goals, and schedule — then tracks every rep, meal, and milestone.

AI WORKOUT PLAN

FitFo generates a personalized daily workout plan based on your somatotype, training frequency, and goals. Push Day, Pull Day, rest — it's all mapped out for you.

NUTRITION TRACKING

Log meals and track macros with smart calorie targets adjusted for training and rest days. See protein, carbs, and fat broken down for every meal.

PERSONAL FIT SCORE

Your Fit Score maps your fitness across five dimensions: Strength, Stamina, Physique, Discipline, and Mobility. Know exactly where you're strong and what to improve next.

30-DAY FORECAST

See what you can achieve in 30 days — estimated muscle gain, calories burned, sessions completed, and Fit Score increase — all based on your actual plan.

VISUAL PROGRESS TRACKING

Upload progress photos and watch your transformation over time. Your profile captures where you started and how far you've come.

PERSONALIZED ONBOARDING

FitFo starts by learning your body type (ectomorph, mesomorph, endomorph), fitness level, and goals — then builds everything around you.`,
  },
};
