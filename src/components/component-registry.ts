"use client";

import type { ThemeTokens, SlideCopy } from "@/lib/types";

// Slide component prop type (matches SlideProps in slide-layouts)
export type SlideComponent = React.FC<{ theme: ThemeTokens; base: string; copy: SlideCopy }>;

import {
  HoneSlide1, HoneSlide2, HoneSlide3, HoneSlide4,
  HoneSlide5, HoneSlide6, HoneSlide7,
} from "@/products/hone/slides";

import {
  AmfoSlide1, AmfoSlide2, AmfoSlide3, AmfoSlide4, AmfoSlide5,
  AmfoSlide6,
} from "@/products/amfo/slides";

import {
  LichtaSlide1, LichtaSlide2, LichtaSlide3, LichtaSlide4,
  LichtaSlide5, LichtaSlide6, LichtaSlide7,
  LichtaAndroid1, LichtaAndroid2, LichtaAndroid3, LichtaAndroid4,
  LichtaAndroid5, LichtaAndroid6, LichtaAndroid7,
} from "@/products/lichta/slides";

import {
  TinyStepsSlide1, TinyStepsSlide2, TinyStepsSlide3,
  TinyStepsSlide4, TinyStepsSlide5, TinyStepsSlide6, TinyStepsSlide7,
  TinyStepsViSlide1, TinyStepsViSlide2, TinyStepsViSlide3,
  TinyStepsViSlide4, TinyStepsViSlide5, TinyStepsViSlide6,
} from "@/products/tinysteps/slides";

import {
  FitFoSlide1, FitFoSlide2, FitFoSlide3, FitFoSlide4,
  FitFoSlide5, FitFoSlide6, FitFoSlide7, FitFoSlide8,
} from "@/products/fitfo/slides";

export const COMPONENT_REGISTRY: Record<string, SlideComponent> = {
  HoneSlide1, HoneSlide2, HoneSlide3, HoneSlide4,
  HoneSlide5, HoneSlide6, HoneSlide7,
  AmfoSlide1, AmfoSlide2, AmfoSlide3, AmfoSlide4, AmfoSlide5, AmfoSlide6,
  LichtaSlide1, LichtaSlide2, LichtaSlide3, LichtaSlide4,
  LichtaSlide5, LichtaSlide6, LichtaSlide7,
  LichtaAndroid1, LichtaAndroid2, LichtaAndroid3, LichtaAndroid4,
  LichtaAndroid5, LichtaAndroid6, LichtaAndroid7,
  TinyStepsSlide1, TinyStepsSlide2, TinyStepsSlide3,
  TinyStepsSlide4, TinyStepsSlide5, TinyStepsSlide6, TinyStepsSlide7,
  TinyStepsViSlide1, TinyStepsViSlide2, TinyStepsViSlide3,
  TinyStepsViSlide4, TinyStepsViSlide5, TinyStepsViSlide6,
  FitFoSlide1, FitFoSlide2, FitFoSlide3, FitFoSlide4,
  FitFoSlide5, FitFoSlide6, FitFoSlide7, FitFoSlide8,
};
