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
      privacyPolicyUrl={product.privacyPolicyUrl}
      supportUrl={product.supportUrl}
      metadata={
        metadataMap[product.id]?.[locale] ??
        metadataMap[product.id]?.[productLocales[0].code] ??
        { name: product.name, subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "", whatsNew: "" }
      }
      onUpdate={(updated) =>
        setMetadataMap((prev) => ({ ...prev, [product.id]: { ...prev[product.id], [locale]: updated } }))
      }
      onUpdateLocale={(localeCode, updated) =>
        setMetadataMap((prev) => ({ ...prev, [product.id]: { ...prev[product.id], [localeCode]: updated } }))
      }
      onUpdateLocales={(fieldId, translations) =>
        setMetadataMap((prev) => {
          const productMetadata = prev[product.id] ?? {};
          return {
            ...prev,
            [product.id]: Object.entries(translations).reduce(
              (next, [localeCode, translated]) => ({
                ...next,
                [localeCode]: {
                  ...(productMetadata[localeCode] ?? { name: product.name, subtitle: "", promoText: "", shortDescription: "", description: "", keywords: "", whatsNew: "" }),
                  [fieldId]: translated,
                },
              }),
              productMetadata,
            ),
          };
        })
      }
      allLocaleData={metadataMap[product.id] ?? {}}
    />
  );
}
