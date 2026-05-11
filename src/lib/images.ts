import type { ProductConfig } from "./types";

const imageCache: Record<string, string> = {};

export function bustCache(path: string) {
  delete imageCache[path];
}

export async function preloadImages(paths: string[]) {
  await Promise.all(
    paths.map(async (path) => {
      if (imageCache[path]) return;
      try {
        const resp = await fetch(path);
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        imageCache[path] = dataUrl;
      } catch {
        // Image not found - skip
      }
    })
  );
}

export function img(path: string): string {
  return imageCache[path] || path;
}

export function getImagePathsForProduct(product: ProductConfig): string[] {
  const paths = new Set<string>([
    product.mockupPath ?? "/mockup.png",
    product.iconPath,
  ]);

  const allSlideGroups = [
    product.slides,
    ...Object.values(product.slidesByLocale ?? {}),
  ];

  for (const group of allSlideGroups) {
    for (const slide of [...(group.iphone ?? []), ...(group.android ?? [])]) {
      if (slide.imagePath) paths.add(slide.imagePath);
    }
  }

  return [...paths];
}
