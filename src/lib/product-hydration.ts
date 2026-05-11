import { renderRichText } from "./rich-text";
import type {
  SerializableProductConfig, SerializableSlideDef,
  ProductConfig, SlideDef, SlideCopy,
} from "./types";
import type { SlideComponent } from "@/components/component-registry";

function hydrateSlideCopy(
  copy: SerializableSlideDef["copy"],
  accentColor: string,
): SlideCopy {
  return {
    label: copy.label,
    headline: renderRichText(copy.headline, accentColor),
    subtitle: renderRichText(copy.subtitle, accentColor),
  };
}

function hydrateSlides(
  slides: SerializableSlideDef[],
  accentColor: string,
  registry: Record<string, SlideComponent>,
): SlideDef[] {
  return slides.map((s): SlideDef => {
    const copyByLocale: Record<string, SlideCopy> = {};
    if (s.copyByLocale) {
      for (const [locale, c] of Object.entries(s.copyByLocale)) {
        copyByLocale[locale] = hydrateSlideCopy(c, accentColor);
      }
    }
    return {
      id: s.id,
      dbId: s.dbId,
      copy: hydrateSlideCopy(s.copy, accentColor),
      copyByLocale: Object.keys(copyByLocale).length ? copyByLocale : undefined,
      imagePath: s.imagePath,
      Component: registry[s.componentKey],
    };
  });
}

export function hydrateProducts(
  raw: SerializableProductConfig[],
  registry: Record<string, SlideComponent>,
): ProductConfig[] {
  return raw.map((p): ProductConfig => {
    const accent = p.theme.accent;

    const slidesByLocale: ProductConfig["slidesByLocale"] = {};
    if (p.slidesByLocale) {
      for (const [locale, s] of Object.entries(p.slidesByLocale)) {
        slidesByLocale[locale] = {
          iphone: hydrateSlides(s.iphone, accent, registry),
          ...(s.android ? { android: hydrateSlides(s.android, accent, registry) } : {}),
        };
      }
    }

    return {
      ...p,
      slides: {
        iphone: hydrateSlides(p.slides.iphone, accent, registry),
        ...(p.slides.android ? { android: hydrateSlides(p.slides.android, accent, registry) } : {}),
      },
      slidesByLocale: Object.keys(slidesByLocale).length ? slidesByLocale : undefined,
    };
  });
}
