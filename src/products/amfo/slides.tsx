"use client";

import React from "react";
import {
  CenteredSlide,
  SideSlide,
  PhoneFrame,
  Rings,
  DotGrid,
  AccentLine,
  dims,
  type SlideProps,
} from "@/components/slide-layouts";
import { GridPattern } from "@/components/ui";

/* ─────────────────────────────────────────────────────────────────
   AMFO SLIDES - layout/visual only, all copy comes from props.copy
───────────────────────────────────────────────────────────────── */

/* ── Slide 1: Hero - Sound Library ─────────────────────── */
export function AmfoSlide1({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.hero}
      orbs={[
        { size: 900, top: "-10%", left: "-20%", color: "rgba(139,92,246,0.18)" },
        { size: 600, top: "40%", right: "-30%", color: "rgba(99,102,241,0.12)" },
        { size: 400, top: "60%", left: "-10%", color: "rgba(167,139,250,0.10)" },
      ]}
      decoration={<DotGrid color="rgba(139,92,246,0.05)" gap="48px" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Sound library"
      phoneWidth="83%"
    />
  );
}

/* ── Slide 2: Mix - Layer Sounds ────────────────────────── */
export function AmfoSlide2({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.accent}
      orbs={[
        { size: 800, top: "5%", right: "-25%", color: "rgba(139,92,246,0.22)" },
        { size: 500, top: "45%", left: "-20%", color: "rgba(99,102,241,0.14)" },
      ]}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Saved Presets"
      phoneWidth="83%" phoneTy="3%"
    />
  );
}

/* ── Slide 3: Timer ─────────────────────────────────────── */
export function AmfoSlide3({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.deep}
      orbs={[
        { size: 1100, top: "15%", left: "5%", color: "rgba(139,92,246,0.20)" },
        { size: 500, top: "-5%", right: "-15%", color: "rgba(99,102,241,0.10)" },
      ]}
      decoration={<Rings sizes={[600, 800, 1000]} color="rgba(139,92,246,0.06)" fadeStep={0.015} />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Focus timer"
      captionMt={0.08}
      phoneWidth="83%" phoneTy="3%"
    />
  );
}

/* ── Slide 4: Focus Mode ────────────────────────────────── */
export function AmfoSlide4({ theme: T, imagePath, copy }: SlideProps) {
  const { W } = dims("iphone");
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.warm}
      orbs={[
        { size: 800, top: "8%", left: "25%", color: "rgba(139,92,246,0.16)" },
        { size: 500, top: "-5%", right: "-15%", color: "rgba(167,139,250,0.10)" },
        { size: 400, bottom: "10%", left: "-10%", color: "rgba(99,102,241,0.08)" },
      ]}
      decoration={<GridPattern opacity={0.03} />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Focus mode"
      phoneWidth="82%" phoneTy="3%"
      fadeH="6%"
      extras={<AccentLine canvasW={W} accentColor={T.accent} opacity={0.5} />}
    />
  );
}

/* ── Slide 5: Customize Settings (Added) ────────────────── */
export function AmfoSlide5({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.hero}
      orbs={[
        { size: 900, top: "-10%", right: "-20%", color: "rgba(139,92,246,0.15)" },
        { size: 400, bottom: "10%", left: "-10%", color: "rgba(99,102,241,0.08)" },
      ]}
      decoration={<DotGrid color="rgba(139,92,246,0.05)" gap="48px" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Settings"
      phoneWidth="83%" phoneTy="3%"
    />
  );
}

/* ── Slide 6: Amfo Pro (Added) ──────────────────────────── */
export function AmfoSlide6({ theme: T, imagePath, copy }: SlideProps) {
  const { W } = dims("iphone");
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.deep}
      orbs={[
        { size: 1000, top: "20%", left: "10%", color: "rgba(167,139,250,0.15)" },
        { size: 600, top: "-5%", right: "-15%", color: "rgba(139,92,246,0.1)" },
      ]}
      decoration={<Rings sizes={[500, 700, 900]} color="rgba(167,139,250,0.05)" fadeStep={0.02} />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Premium"
      phoneWidth="83%" phoneTy="3%"
      fadeH="8%"
      extras={<AccentLine canvasW={W} accentColor={T.accent} opacity={0.6} />}
    />
  );
}
