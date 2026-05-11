"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useProduct } from "@/components/ProductContext";
import { ScreenshotsSection } from "@/components/sections/ScreenshotsSection";

export default function ScreenshotsPage() {
  const { product, locale, platform, multiProduct } = useProduct();
  const router = useRouter();
  const handleSlidesChanged = useCallback(() => router.refresh(), [router]);

  return (
    <ScreenshotsSection
      product={product}
      locale={locale}
      platform={platform}
      multiProduct={multiProduct}
      onSlidesChanged={handleSlidesChanged}
    />
  );
}
