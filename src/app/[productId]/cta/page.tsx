"use client";

import { useProduct } from "@/components/ProductContext";
import { CtaSection } from "@/components/sections/CtaSection";

export default function CtaPage() {
  const { product, locale, platform, ctaSc1, ctaSc2, ctaHeadline, setCtaSc1, setCtaSc2, setCtaHeadline, saveCtaHeadline } = useProduct();
  return (
    <CtaSection
      product={product}
      locale={locale}
      platform={platform}
      ctaSc1={ctaSc1}
      ctaSc2={ctaSc2}
      ctaHeadline={ctaHeadline}
      onSc1Change={setCtaSc1}
      onSc2Change={setCtaSc2}
      onHeadlineChange={setCtaHeadline}
      onHeadlineSave={saveCtaHeadline}
    />
  );
}
