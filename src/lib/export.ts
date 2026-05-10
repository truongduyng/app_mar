import { toPng } from "html-to-image";
import JSZip from "jszip";
import {
  IPHONE_W, IPHONE_H, IPHONE_SIZES,
  ANDROID_W, ANDROID_H, ANDROID_SIZES,
  FG_W, FG_H, FG_SIZES,
  OG_W, OG_H, OG_SIZES,
} from "./constants";

type AnySize = { label: string; w: number; h: number };
type DeviceType = "iphone" | "android" | "feature-graphic" | "social-og";

/** Get canvas dimensions for a given device type */
export function getCanvasDims(device: DeviceType) {
  switch (device) {
    case "android": return { w: ANDROID_W, h: ANDROID_H };
    case "feature-graphic": return { w: FG_W, h: FG_H };
    case "social-og": return { w: OG_W, h: OG_H };
    default: return { w: IPHONE_W, h: IPHONE_H };
  }
}

/** Get export sizes for a given device type */
export function getExportSizes(device: DeviceType): readonly AnySize[] {
  switch (device) {
    case "android": return ANDROID_SIZES;
    case "feature-graphic": return FG_SIZES;
    case "social-og": return OG_SIZES;
    default: return IPHONE_SIZES;
  }
}

/* ── Single export (click-to-download one slide) ─────────── */
export async function exportSingle(
  container: HTMLElement,
  index: number,
  label: string,
  size?: AnySize,
  productId?: string,
  multiProduct = false,
  device: DeviceType = "iphone"
) {
  const el = container.children[index] as HTMLElement;
  if (!el) return;

  const { w: canvasW, h: canvasH } = getCanvasDims(device);
  const sizes = getExportSizes(device);
  const exportSize = size ?? sizes[0];

  el.style.left = "0px";
  el.style.opacity = "1";
  el.style.zIndex = "-1";

  const opts = { width: canvasW, height: canvasH, pixelRatio: 1, cacheBust: true };

  // Double-call trick - first warms up fonts/images, second produces clean output
  await toPng(el, opts);
  const dataUrl = await toPng(el, opts);

  el.style.left = "-9999px";
  el.style.opacity = "";
  el.style.zIndex = "";

  const prefix = multiProduct && productId ? `${productId}-` : "";
  const deviceTag = device === "iphone" ? "" : `${device}-`;
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  if (exportSize.w !== canvasW || exportSize.h !== canvasH) {
    const resizedUrl = await resizeDataUrl(dataUrl, exportSize.w, exportSize.h);
    downloadDataUrl(resizedUrl, `${prefix}${deviceTag}${pad(index)}-${slug}-${exportSize.w}x${exportSize.h}.png`);
  } else {
    downloadDataUrl(dataUrl, `${prefix}${deviceTag}${pad(index)}-${slug}-${exportSize.w}x${exportSize.h}.png`);
  }
}

/* ── CTA image export (1080×1080 or 1080×1350) ────────────── */
export async function exportCtaImage(
  container: HTMLElement,
  w: number,
  h: number,
  filename: string,
) {
  const el = container.children[0] as HTMLElement;
  if (!el) return;

  el.style.left = "0px";
  el.style.opacity = "1";
  el.style.zIndex = "-1";

  const opts = { width: w, height: h, pixelRatio: 1, cacheBust: true };
  await toPng(el, opts);
  const dataUrl = await toPng(el, opts);

  el.style.left = "-9999px";
  el.style.opacity = "";
  el.style.zIndex = "";

  downloadDataUrl(dataUrl, filename);
}

/* ── Batch ZIP export ──────────────────────────────────────── */
export type ZipExportOptions = {
  container: HTMLElement;
  slides: { label: string }[];
  sizes: AnySize[];
  productId: string;
  multiProduct: boolean;
  device: DeviceType;
  onProgress?: (done: number, total: number) => void;
};

export async function exportAllToZip({
  container,
  slides,
  sizes,
  productId,
  multiProduct,
  device,
  onProgress,
}: ZipExportOptions): Promise<void> {
  const { w: canvasW, h: canvasH } = getCanvasDims(device);

  const zip = new JSZip();
  const prefix = multiProduct ? `${productId}-` : "";
  const deviceTag = device === "iphone" ? "" : `${device}-`;
  const total = slides.length * sizes.length;
  let done = 0;

  for (let i = 0; i < slides.length; i++) {
    const el = container.children[i] as HTMLElement;
    if (!el) continue;

    const slug = slides[i].label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Bring element into render position
    el.style.left = "0px";
    el.style.opacity = "1";
    el.style.zIndex = "-1";

    const opts = { width: canvasW, height: canvasH, pixelRatio: 1, cacheBust: true };

    // Warm-up pass then capture
    await toPng(el, opts);
    const dataUrl = await toPng(el, opts);

    el.style.left = "-9999px";
    el.style.opacity = "";
    el.style.zIndex = "";

    // Add one PNG per requested export size
    for (const size of sizes) {
      const finalUrl =
        size.w !== canvasW || size.h !== canvasH
          ? await resizeDataUrl(dataUrl, size.w, size.h)
          : dataUrl;

      const filename = `${prefix}${deviceTag}${pad(i + 1)}-${slug}-${size.w}x${size.h}.png`;
      zip.file(filename, dataUrlToBlob(finalUrl));

      done++;
      onProgress?.(done, total);
    }

    // Small yield so the browser stays responsive
    await tick();
  }

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const zipName = `${prefix}${deviceTag}screenshots.zip`;
  downloadDataUrl(URL.createObjectURL(blob), zipName);
}

/* ── Capture all slides as base64 PNGs (for server upload) ── */
export async function captureAllAsBase64(
  container: HTMLElement,
  slides: { label: string }[],
  device: DeviceType = "iphone",
  onProgress?: (done: number, total: number) => void,
): Promise<Array<{ index: number; label: string; dataUrl: string }>> {
  const { w: canvasW, h: canvasH } = getCanvasDims(device);
  const results = [];

  for (let i = 0; i < slides.length; i++) {
    const el = container.children[i] as HTMLElement;
    if (!el) continue;

    el.style.left = "0px";
    el.style.opacity = "1";
    el.style.zIndex = "-1";

    const opts = { width: canvasW, height: canvasH, pixelRatio: 1, cacheBust: true };
    await toPng(el, opts);
    const dataUrl = await toPng(el, opts);

    el.style.left = "-9999px";
    el.style.opacity = "";
    el.style.zIndex = "";

    results.push({ index: i + 1, label: slides[i].label, dataUrl });
    onProgress?.(i + 1, slides.length);
    await tick();
  }

  return results;
}

/* ── Helpers ───────────────────────────────────────────────── */
function pad(n: number) {
  return String(n).padStart(2, "0");
}

async function resizeDataUrl(dataUrl: string, w: number, h: number): Promise<string> {
  const image = new Image();
  image.src = dataUrl;
  await new Promise((r) => (image.onload = r));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(image, 0, 0, w, h);
  return canvas.toDataURL("image/png");
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)![1];
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function downloadDataUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function tick() {
  return new Promise<void>((r) => setTimeout(r, 0));
}
