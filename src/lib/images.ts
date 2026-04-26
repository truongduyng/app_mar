import type { ProductConfig } from "./types";

const imageCache: Record<string, string> = {};

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

  const bases = product.screenshotBaseByLocale
    ? Object.values(product.screenshotBaseByLocale)
    : [product.screenshotBase];

  for (const base of bases) {
    product.slides.iphone.forEach((_: unknown, i: number) => paths.add(`${base}/sc${i + 1}.png`));
    product.slides.android?.forEach((_: unknown, i: number) => paths.add(`${base}/sc${i + 1}.png`));
  }

  return [...paths];
}
