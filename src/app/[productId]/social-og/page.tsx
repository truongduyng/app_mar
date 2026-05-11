"use client";

import { useProduct } from "@/components/ProductContext";
import { SocialOgSection } from "@/components/sections/SocialOgSection";

export default function SocialOgPage() {
  const { product, multiProduct } = useProduct();
  return <SocialOgSection product={product} multiProduct={multiProduct} />;
}
