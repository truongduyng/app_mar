"use client";

import { useProduct } from "@/components/ProductContext";
import { FeatureGraphicSection } from "@/components/sections/FeatureGraphicSection";

export default function FeatureGraphicPage() {
  const { product, multiProduct } = useProduct();
  return <FeatureGraphicSection product={product} multiProduct={multiProduct} />;
}
