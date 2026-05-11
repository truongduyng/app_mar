"use client";

import React from "react";
import {
  CenteredSlide,
  SideSlide,
  PhoneFrame,
  DotGrid,
  Rings,
  AccentLine,
  dims,
  type SlideProps,
} from "@/components/slide-layouts";

/* ─────────────────────────────────────────────────────────────────
   FITFO SLIDES - layout/visual only, all copy comes from props.copy
───────────────────────────────────────────────────────────────── */

/* ── Slide 1: Hero - Home Dashboard ─────────────────────────── */
export function FitFoSlide1({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.hero}
      orbs={[
        { size: 950, top: "-20%", left: "-20%", color: "rgba(249,115,22,0.18)" },
        { size: 600, top: "40%", right: "-25%", color: "rgba(249,115,22,0.10)" },
      ]}
      decoration={<DotGrid color="rgba(249,115,22,0.04)" gap="44px" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Home Dashboard"
      captionMt={0.05}
      subtitleMaxW={0.76}
      phoneWidth="86%" phoneTy="10%"
      fadeH="8%"
    />
  );
}

/* ── Slide 2: Workout Plan ───────────────────────────────────── */
export function FitFoSlide2({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.dark}
      orbs={[
        { size: 800, top: "5%", left: "45%", color: "rgba(249,115,22,0.14)" },
        { size: 500, bottom: "-10%", left: "-15%", color: "rgba(249,115,22,0.08)" },
      ]}
      decoration={<DotGrid color="rgba(249,115,22,0.03)" gap="48px" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Workout Plan"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="86%" phoneTy="12%"
      fadeH="8%"
    />
  );
}

/* ── Slide 3: Nutrition Tracking ─────────────────────────────── */
export function FitFoSlide3({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.warm}
      orbs={[
        { size: 900, top: "-10%", right: "-20%", color: "rgba(249,115,22,0.20)" },
        { size: 500, top: "50%", left: "-15%", color: "rgba(249,115,22,0.08)" },
      ]}
      decoration={<Rings sizes={[600, 800, 1000]} color="rgba(249,115,22,0.06)" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Nutrition"
      captionMt={0.05}
      subtitleMaxW={0.72}
      phoneTy="6%"
    />
  );
}

/* ── Slide 4: Fit Score / Profile ────────────────────────────── */
export function FitFoSlide4({ theme: T, imagePath, copy }: SlideProps) {
  const { W } = dims("iphone");
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.accent}
      orbs={[
        { size: 800, top: "10%", left: "25%", color: "rgba(249,115,22,0.16)" },
        { size: 400, top: "-5%", left: "-10%", color: "rgba(249,115,22,0.08)" },
      ]}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Fit Score"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="82%" phoneTy="2%"
      fadeH="6%"
      extras={<AccentLine canvasW={W} accentColor={T.accent} opacity={0.35} />}
    />
  );
}

/* ── Slide 5: AI-Generated Plan (30-day forecast) ────────────── */
export function FitFoSlide5({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.deep}
      orbs={[
        { size: 1000, top: "15%", left: "10%", color: "rgba(249,115,22,0.18)" },
        { size: 500, top: "-10%", right: "-10%", color: "rgba(249,115,22,0.10)" },
      ]}
      decoration={<DotGrid color="rgba(249,115,22,0.04)" gap="52px" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="30-Day Forecast"
      captionMt={0.05}
      subtitleMaxW={0.80}
      phoneWidth="86%" phoneTy="8%"
      fadeH="10%"
    />
  );
}

/* ── Slide 6: Body Type / Onboarding ─────────────────────────── */
export function FitFoSlide6({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.hero}
      orbs={[
        { size: 700, top: "35%", left: "-10%", color: "rgba(249,115,22,0.15)" },
        { size: 600, top: "-15%", right: "-10%", color: "rgba(249,115,22,0.10)" },
      ]}
      decoration={<Rings sizes={[500, 700, 900]} color="rgba(249,115,22,0.05)" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Body Type"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="86%" phoneTy="6%"
      fadeH="10%"
    />
  );
}

/* ── Slide 7: Progress Photos (dual phone) ───────────────────── */
export function FitFoSlide7({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <SideSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.warm}
      orbs={[
        { size: 800, top: "5%", right: "-20%", color: "rgba(249,115,22,0.20)" },
        { size: 500, top: "55%", left: "-15%", color: "rgba(249,115,22,0.10)" },
      ]}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      phones={<>
        <div style={{ position: "absolute", bottom: 0, left: "-4%", transform: "translateY(4%) rotate(-3deg)", width: "76%", zIndex: 2, opacity: 0.35, filter: "brightness(0.6)" }}>
          <PhoneFrame platform="iphone" src={imagePath} alt="" />
        </div>
        <div style={{ position: "absolute", bottom: 0, right: "-4%", transform: "translateY(4%)", width: "83%", zIndex: 3 }}>
          <PhoneFrame platform="iphone" src={imagePath} alt="Your Profile" />
        </div>
      </>}
    />
  );
}

/* ── Slide 8: More Features pill slide ───────────────────────── */
export function FitFoSlide8({ theme: T, imagePath, copy }: SlideProps) {
  const { W, H } = dims("iphone");
  const pills = [
    "Calorie Targets", "Macro Tracking", "Streak Counter",
    "Weekly Volume", "Rest Timers", "Progress Photos",
    "Body Composition", "AI Plan Generator", "Personal Fit Score",
  ];
  return (
    <div
      style={{
        width: W, height: H,
        background: T.gradients.deep,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "inherit",
      }}
    >
      <div style={{
        position: "absolute", top: "-15%", left: "50%",
        transform: "translateX(-50%)",
        width: 900, height: 900, borderRadius: "50%",
        background: "rgba(249,115,22,0.12)",
        filter: "blur(80px)",
        pointerEvents: "none",
      }} />

      <div style={{ zIndex: 2, position: "relative", marginTop: H * 0.07, textAlign: "center", paddingLeft: W * 0.08, paddingRight: W * 0.08 }}>
        <div style={{ fontSize: W * 0.028, fontWeight: 600, letterSpacing: "0.12em", color: T.accent, textTransform: "uppercase", marginBottom: H * 0.015 }}>
          {copy.label}
        </div>
        <div style={{ fontSize: W * 0.092, fontWeight: 700, color: T.fg, lineHeight: 1.0 }}>
          {copy.headline}
        </div>
        <div style={{ fontSize: W * 0.035, color: T.fgMuted, marginTop: H * 0.012, lineHeight: 1.55 }}>
          {copy.subtitle}
        </div>
      </div>

      <div style={{ zIndex: 2, position: "relative", marginTop: H * 0.05, display: "flex", flexWrap: "wrap", gap: W * 0.025, justifyContent: "center", paddingLeft: W * 0.06, paddingRight: W * 0.06 }}>
        {pills.map((pill) => (
          <div key={pill} style={{
            padding: `${H * 0.012}px ${W * 0.045}px`,
            borderRadius: 100,
            border: `1px solid rgba(249,115,22,0.25)`,
            background: "rgba(249,115,22,0.08)",
            color: T.fg,
            fontSize: W * 0.032,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}>
            {pill}
          </div>
        ))}
      </div>
    </div>
  );
}
