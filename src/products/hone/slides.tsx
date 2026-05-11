"use client";

import React from "react";
import {
  CenteredSlide,
  SideSlide,
  PhoneFrame,
  AccentLine,
  DotGrid,
  dims,
  type SlideProps,
} from "@/components/slide-layouts";
import { GridPattern, DiagonalLine } from "@/components/ui";

/* ─────────────────────────────────────────────────────────────────
   HONE SLIDES - layout/visual only, all copy comes from props.copy
───────────────────────────────────────────────────────────────── */

/* ── Slide 1: Hero ──────────────────────────────────────── */
export function HoneSlide1({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.hero}
      orbs={[
        { size: 900, top: "-20%", left: "-30%", color: "rgba(249,115,22,0.15)" },
        { size: 600, top: "30%", right: "-40%", color: "rgba(249,115,22,0.08)" },
      ]}
      decoration={<>
        <GridPattern opacity={0.025} />
        <DiagonalLine top="15%" left="-5%" width={500} rotate={-25} opacity={0.06} accentColor={T.accent} />
        <DiagonalLine top="18%" left="-5%" width={400} rotate={-25} opacity={0.04} accentColor={T.accent} />
      </>}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Journal"
      captionMt={0.04}
    />
  );
}

/* ── Slide 2: AI Sensei ─────────────────────────────────── */
export function HoneSlide2({ theme: T, imagePath, copy }: SlideProps) {
  const { W, H } = dims("iphone");
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.warm}
      orbs={[
        { size: 700, top: "5%", left: "50%", color: "rgba(249,115,22,0.12)" },
        { size: 500, bottom: "-10%", left: "-20%", color: "rgba(249,115,22,0.08)" },
      ]}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Journal"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="86%" phoneTy="12%"
      fadeH="6%"
      extras={
        <div style={{ position: "absolute", left: W * 0.06, top: H * 0.32, width: 3, height: H * 0.25, background: `linear-gradient(180deg, ${T.accent}, transparent)`, opacity: 0.4, zIndex: 1, borderRadius: 2 }} />
      }
    />
  );
}

/* ── Slide 3: Daily Protocol ────────────────────────────── */
export function HoneSlide3({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.accent}
      orbs={[
        { size: 800, top: "-5%", right: "-30%", color: "rgba(249,115,22,0.18)" },
      ]}
      decoration={<GridPattern opacity={0.02} />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Daily Protocol"
      captionMt={0.05}
      subtitleMaxW={0.7}
      phoneTy="5%"
    />
  );
}

/* ── Slide 4: Progress ──────────────────────────────────── */
export function HoneSlide4({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.deep}
      orbs={[
        { size: 1000, top: "20%", left: "10%", color: "rgba(249,115,22,0.2)" },
        { size: 500, top: "-10%", right: "-15%", color: "rgba(249,115,22,0.1)" },
      ]}
      decoration={<DotGrid color="rgba(249,115,22,0.06)" gap="40px" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Track"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneTy="5%"
    />
  );
}

/* ── Slide 5: Journey ───────────────────────────────────── */
export function HoneSlide5({ theme: T, imagePath, copy }: SlideProps) {
  const { W } = dims("iphone");
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.warm}
      orbs={[
        { size: 800, top: "10%", left: "30%", color: "rgba(249,115,22,0.15)" },
        { size: 400, top: "-5%", left: "-10%", color: "rgba(249,115,22,0.08)" },
      ]}
      decoration={<>
        <DiagonalLine top="12%" left="60%" width={350} rotate={35} opacity={0.08} accentColor={T.accent} />
        <DiagonalLine top="14%" left="62%" width={250} rotate={35} opacity={0.05} accentColor={T.accent} />
      </>}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Profile"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="82%" phoneTy="0%"
      fadeH="6%"
      extras={<AccentLine canvasW={W} accentColor={T.accent} opacity={0.4} />}
    />
  );
}

/* ── Slide 6: Mood Flow (Added) ─────────────────────────── */
export function HoneSlide6({ theme: T, imagePath, copy }: SlideProps) {
  const { W } = dims("iphone");
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.deep}
      orbs={[
        { size: 700, top: "40%", left: "-10%", color: "rgba(249,115,22,0.15)" },
        { size: 600, top: "-20%", right: "-10%", color: "rgba(249,115,22,0.1)" },
      ]}
      decoration={<GridPattern opacity={0.025} />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Mood Flow"
      captionMt={0.05}
      subtitleMaxW={0.8}
      phoneWidth="86%" phoneTy="6%"
      fadeH="10%"
    />
  );
}

/* ── Slide 7: Reward (Added) ────────────────────────────── */
export function HoneSlide7({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.warm}
      orbs={[
        { size: 800, bottom: "-10%", left: "10%", color: "rgba(249,115,22,0.15)" },
      ]}
      decoration={<DotGrid color="rgba(249,115,22,0.06)" gap="40px" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Reward"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneTy="8%"
    />
  );
}
