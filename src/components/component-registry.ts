"use client";

import React from "react";
import type { ThemeTokens, SlideCopy } from "@/lib/types";
import {
  CenteredSlide,
  SideSlide,
  PhoneFrame,
  DotGrid,
  type SlideProps,
} from "@/components/slide-layouts";

export type SlideComponent = React.FC<{ theme: ThemeTokens; imagePath: string; copy: SlideCopy }>;

export type SlideStyleOption = {
  key: string;
  label: string;
  description: string;
  platforms?: Array<"iphone" | "android">;
};

export const SLIDE_STYLE_OPTIONS: SlideStyleOption[] = [
  { key: "GenericCenteredSlide", label: "Centered phone", description: "Caption at top, one phone centered.", platforms: ["iphone"] },
  { key: "GenericSideSlide", label: "Side phone", description: "Left caption with layered phone preview.", platforms: ["iphone"] },
  { key: "GenericAndroidCenteredSlide", label: "Android centered", description: "Caption at top, Android phone centered.", platforms: ["android"] },
  { key: "GenericAndroidSideSlide", label: "Android side", description: "Left caption with layered Android preview.", platforms: ["android"] },
];

export function defaultSlideStyleKey(device: "iphone" | "android") {
  return device === "android" ? "GenericAndroidCenteredSlide" : "GenericCenteredSlide";
}


function GenericCenteredSlide({ theme: T, imagePath, copy }: SlideProps) {
  return React.createElement(CenteredSlide, {
    theme: T,
    imagePath,
    gradient: T.gradients.hero,
    orbs: [
      { size: 900, top: "-15%", left: "-25%", color: T.accentGlow },
      { size: 620, top: "38%", right: "-30%", color: T.accentSoft },
    ],
    decoration: React.createElement(DotGrid, { color: "rgba(255,255,255,0.05)", gap: "48px" }),
    label: copy.label,
    headline: copy.headline,
    alt: copy.label,
    phoneWidth: "80%",
    phoneTy: "-5%",
  });
}

function GenericAndroidCenteredSlide({ theme: T, imagePath, copy }: SlideProps) {
  return React.createElement(CenteredSlide, {
    theme: T,
    imagePath,
    platform: "android",
    gradient: T.gradients.hero,
    orbs: [
      { size: 820, top: "-12%", left: "-22%", color: T.accentGlow },
      { size: 560, top: "40%", right: "-28%", color: T.accentSoft },
    ],
    decoration: React.createElement(DotGrid, { color: "rgba(255,255,255,0.05)", gap: "44px" }),
    label: copy.label,
    headline: copy.headline,
    alt: copy.label,
    phoneWidth: "56%",
    phoneTy: "-7%",
  });
}

function GenericSideSlide({ theme: T, imagePath, copy }: SlideProps) {
  return React.createElement(SideSlide, {
    theme: T,
    imagePath,
    gradient: T.gradients.warm,
    orbs: [
      { size: 800, top: "5%", right: "-20%", color: T.accentGlow },
      { size: 500, top: "52%", left: "-15%", color: T.accentSoft },
    ],
    label: copy.label,
    headline: copy.headline,
    phones: React.createElement(React.Fragment, null,
      React.createElement("div", {
        style: {
          position: "absolute",
          bottom: "6%",
          left: "-4%",
          transform: "rotate(-3deg)",
          width: "74%",
          zIndex: 2,
          opacity: 0.35,
          filter: "brightness(0.65)",
        },
      }, React.createElement(PhoneFrame, { platform: "iphone", src: imagePath, alt: "" })),
      React.createElement("div", {
        style: {
          position: "absolute",
          bottom: "6%",
          right: "-4%",
          width: "80%",
          zIndex: 3,
        },
      }, React.createElement(PhoneFrame, { platform: "iphone", src: imagePath, alt: copy.label })),
    ),
  });
}

function GenericAndroidSideSlide({ theme: T, imagePath, copy }: SlideProps) {
  return React.createElement(SideSlide, {
    theme: T,
    imagePath,
    platform: "android",
    gradient: T.gradients.warm,
    orbs: [
      { size: 720, top: "5%", right: "-20%", color: T.accentGlow },
      { size: 430, top: "52%", left: "-15%", color: T.accentSoft },
    ],
    label: copy.label,
    headline: copy.headline,
    phones: React.createElement(React.Fragment, null,
      React.createElement("div", {
        style: {
          position: "absolute",
          bottom: "6%",
          left: "-3%",
          transform: "rotate(-3deg)",
          width: "48%",
          zIndex: 2,
          opacity: 0.35,
          filter: "brightness(0.65)",
        },
      }, React.createElement(PhoneFrame, { platform: "android", src: imagePath, alt: "" })),
      React.createElement("div", {
        style: {
          position: "absolute",
          bottom: "6%",
          right: "-3%",
          width: "56%",
          zIndex: 3,
        },
      }, React.createElement(PhoneFrame, { platform: "android", src: imagePath, alt: copy.label })),
    ),
  });
}

const DIRECT_STYLES: Record<string, SlideComponent> = {
  GenericCenteredSlide,
  GenericSideSlide,
  GenericAndroidCenteredSlide,
  GenericAndroidSideSlide,
};

export const COMPONENT_REGISTRY: Record<string, SlideComponent> = DIRECT_STYLES;
