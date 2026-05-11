"use client";

import { useProduct } from "@/components/ProductContext";
import { MetadataPanel } from "@/components/metadata-panel";

export default function MetadataPage() {
  const {
    product, locale, platform, productLocales,
    metadataMap, setMetadataMap,
  } = useProduct();

  return (
    <MetadataPanel
      theme={product.theme}
      platform={platform}
      locales={productLocales}
      activeLocale={locale}
      productId={product.id}
      bundleId={product.bundleId}
      packageName={product.packageName}
      metadata={
        metadataMap[product.id]?.[locale] ??
        metadataMap[product.id]?.[productLocales[0].code] ??
        { name: product.name, subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "", privacyPolicyUrl: "", supportUrl: "" }
      }
      onUpdate={(updated) =>
        setMetadataMap((prev) => ({ ...prev, [product.id]: { ...prev[product.id], [locale]: updated } }))
      }
      allLocaleData={metadataMap[product.id] ?? {}}
    />
  );
}
