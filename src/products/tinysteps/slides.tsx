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
import { GridPattern, DiagonalLine } from "@/components/ui";

/* ─────────────────────────────────────────────────────────────────
   TINYSTEPS SLIDES - layout/visual only, all copy comes from props.copy
───────────────────────────────────────────────────────────────── */

/* ── Slide 1: Hero - Home / Growth Dashboard ────────────── */
export function TinyStepsSlide1({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.hero}
      orbs={[
        { size: 1000, top: "-15%", left: "-25%", color: "rgba(107,142,104,0.18)" },
        { size: 700, top: "35%", right: "-30%", color: "rgba(107,142,104,0.10)" },
      ]}
      decoration={<>
        <GridPattern opacity={0.025} />
        <DiagonalLine top="15%" left="-5%" width={500} rotate={-25} opacity={0.06} accentColor={T.accent} />
        <DiagonalLine top="18%" left="-5%" width={400} rotate={-25} opacity={0.04} accentColor={T.accent} />
      </>}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Home"
      captionMt={0.04}
    />
  );
}

/* ── Slide 2: Milestones ─────────────────────────────────── */
export function TinyStepsSlide2({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.warm}
      orbs={[
        { size: 800, top: "5%", left: "50%", color: "rgba(107,142,104,0.14)" },
        { size: 500, bottom: "-10%", left: "-20%", color: "rgba(107,142,104,0.08)" },
      ]}
      decoration={<DotGrid color="rgba(107,142,104,0.05)" gap="48px" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Milestones"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="86%" phoneTy="12%"
      fadeH="6%"
    />
  );
}

/* ── Slide 3: Vaccinations ───────────────────────────────── */
export function TinyStepsSlide3({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.accent}
      orbs={[
        { size: 900, top: "-10%", right: "-25%", color: "rgba(107,142,104,0.20)" },
        { size: 500, top: "45%", left: "-15%", color: "rgba(107,142,104,0.10)" },
      ]}
      decoration={<Rings sizes={[700, 900, 1100]} color="rgba(107,142,104,0.07)" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Vaccinations"
      captionMt={0.05}
      subtitleMaxW={0.7}
      phoneTy="5%"
    />
  );
}

/* ── Slide 4: Journal / Timeline ─────────────────────────── */
export function TinyStepsSlide4({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.deep}
      orbs={[
        { size: 1000, top: "20%", left: "10%", color: "rgba(107,142,104,0.18)" },
        { size: 500, top: "-10%", right: "-15%", color: "rgba(107,142,104,0.10)" },
      ]}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Journal"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="86%" phoneTy="6%"
      fadeH="10%"
    />
  );
}

/* ── Slide 5: AI Chat ────────────────────────────────────── */
export function TinyStepsSlide5({ theme: T, imagePath, copy }: SlideProps) {
  const { W } = dims("iphone");
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.warm}
      orbs={[
        { size: 800, top: "10%", left: "30%", color: "rgba(107,142,104,0.16)" },
        { size: 400, top: "-5%", left: "-10%", color: "rgba(107,142,104,0.08)" },
      ]}
      decoration={<>
        <DiagonalLine top="12%" left="60%" width={350} rotate={35} opacity={0.08} accentColor={T.accent} />
        <DiagonalLine top="14%" left="62%" width={250} rotate={35} opacity={0.05} accentColor={T.accent} />
      </>}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="AI Chat"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="82%" phoneTy="0%"
      fadeH="6%"
      extras={<AccentLine canvasW={W} accentColor={T.accent} opacity={0.4} />}
    />
  );
}

/* ── Slide 6: Family Sharing ─────────────────────────────── */
export function TinyStepsSlide6({ theme: T, imagePath, copy }: SlideProps) {
  return (
    <SideSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.hero}
      orbs={[
        { size: 800, top: "5%", right: "-20%", color: "rgba(107,142,104,0.20)" },
        { size: 500, top: "50%", left: "-15%", color: "rgba(107,142,104,0.10)" },
      ]}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      phones={<>
        <div style={{ position: "absolute", bottom: 0, left: "-4%", transform: "translateY(4%) rotate(-3deg)", width: "76%", zIndex: 2, opacity: 0.35, filter: "brightness(0.65)" }}>
          <PhoneFrame platform="iphone" src={imagePath} alt="" />
        </div>
        <div style={{ position: "absolute", bottom: 0, right: "-4%", transform: "translateY(4%)", width: "83%", zIndex: 3 }}>
          <PhoneFrame platform="iphone" src={imagePath} alt="Family Sharing" />
        </div>
      </>}
    />
  );
}

/* ── Vi Slides (vi/sc1–6, each screen differs from en) ──── */

export function TinyStepsViSlide1({ theme: T, imagePath, copy }: SlideProps) {
  // sc1: Home / Growth Dashboard
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.hero}
      orbs={[
        { size: 1000, top: "-15%", left: "-25%", color: "rgba(107,142,104,0.18)" },
        { size: 700, top: "35%", right: "-30%", color: "rgba(107,142,104,0.10)" },
      ]}
      decoration={<>
        <GridPattern opacity={0.025} />
        <DiagonalLine top="15%" left="-5%" width={500} rotate={-25} opacity={0.06} accentColor={T.accent} />
        <DiagonalLine top="18%" left="-5%" width={400} rotate={-25} opacity={0.04} accentColor={T.accent} />
      </>}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Trang chủ"
      captionMt={0.04}
    />
  );
}

export function TinyStepsViSlide2({ theme: T, imagePath, copy }: SlideProps) {
  // sc2: Journal (photo timeline)
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.deep}
      orbs={[
        { size: 1000, top: "20%", left: "10%", color: "rgba(107,142,104,0.18)" },
        { size: 500, top: "-10%", right: "-15%", color: "rgba(107,142,104,0.10)" },
      ]}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Nhật ký"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="86%" phoneTy="6%"
      fadeH="10%"
    />
  );
}

export function TinyStepsViSlide3({ theme: T, imagePath, copy }: SlideProps) {
  // sc3: AI Chat
  const { W } = dims("iphone");
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.warm}
      orbs={[
        { size: 800, top: "10%", left: "30%", color: "rgba(107,142,104,0.16)" },
        { size: 400, top: "-5%", left: "-10%", color: "rgba(107,142,104,0.08)" },
      ]}
      decoration={<>
        <DiagonalLine top="12%" left="60%" width={350} rotate={35} opacity={0.08} accentColor={T.accent} />
        <DiagonalLine top="14%" left="62%" width={250} rotate={35} opacity={0.05} accentColor={T.accent} />
      </>}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Chat và hỏi AI"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="82%" phoneTy="0%"
      fadeH="6%"
      extras={<AccentLine canvasW={W} accentColor={T.accent} opacity={0.4} />}
    />
  );
}

export function TinyStepsViSlide4({ theme: T, imagePath, copy }: SlideProps) {
  // sc4: Settings
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.accent}
      orbs={[
        { size: 900, top: "-10%", right: "-25%", color: "rgba(107,142,104,0.20)" },
        { size: 500, top: "45%", left: "-15%", color: "rgba(107,142,104,0.10)" },
      ]}
      decoration={<Rings sizes={[700, 900, 1100]} color="rgba(107,142,104,0.07)" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Cài đặt"
      captionMt={0.05}
      subtitleMaxW={0.75}
      phoneTy="5%"
    />
  );
}

export function TinyStepsViSlide5({ theme: T, imagePath, copy }: SlideProps) {
  // sc5: Developmental Milestones
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.warm}
      orbs={[
        { size: 800, top: "5%", left: "50%", color: "rgba(107,142,104,0.14)" },
        { size: 500, bottom: "-10%", left: "-20%", color: "rgba(107,142,104,0.08)" },
      ]}
      decoration={<DotGrid color="rgba(107,142,104,0.05)" gap="48px" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Cột mốc phát triển"
      captionMt={0.05}
      subtitleMaxW={0.78}
      phoneWidth="86%" phoneTy="12%"
      fadeH="6%"
    />
  );
}

export function TinyStepsViSlide6({ theme: T, imagePath, copy }: SlideProps) {
  // sc6: Vaccinations
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.accent}
      orbs={[
        { size: 900, top: "-10%", right: "-25%", color: "rgba(107,142,104,0.20)" },
        { size: 500, top: "45%", left: "-15%", color: "rgba(107,142,104,0.10)" },
      ]}
      decoration={<Rings sizes={[700, 900, 1100]} color="rgba(107,142,104,0.07)" />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Vắc-xin"
      captionMt={0.05}
      subtitleMaxW={0.7}
      phoneTy="5%"
    />
  );
}

/* ── Slide 7: Growth Chart Detail ────────────────────────── */
export function TinyStepsSlide7({ theme: T, imagePath, copy }: SlideProps) {
  const { W } = dims("iphone");
  return (
    <CenteredSlide
      theme={T} imagePath={imagePath}
      gradient={T.gradients.deep}
      orbs={[
        { size: 700, top: "40%", left: "-10%", color: "rgba(107,142,104,0.15)" },
        { size: 600, top: "-20%", right: "-10%", color: "rgba(107,142,104,0.10)" },
      ]}
      decoration={<GridPattern opacity={0.025} />}
      label={copy.label}
      headline={copy.headline}
      subtitle={copy.subtitle}
      alt="Growth Tracking"
      captionMt={0.05}
      subtitleMaxW={0.8}
      phoneWidth="86%" phoneTy="6%"
      fadeH="10%"
    />
  );
}
