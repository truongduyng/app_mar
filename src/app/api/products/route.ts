import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/db/client";
import { products, productThemes, productLocales, slideGroups } from "@/db/schema";

const DEFAULT_THEME = {
  bg: "#09090B",
  bgAlt: "#111114",
  fg: "#F8F8F2",
  fgMuted: "#8A8A94",
  accent: "#6366F1",
  accentGlow: "rgba(99,102,241,0.35)",
  accentSoft: "rgba(99,102,241,0.12)",
  surface: "rgba(255,255,255,0.04)",
  gradients: {
    dark:   "linear-gradient(180deg, #09090B 0%, #111118 50%, #09090B 100%)",
    warm:   "linear-gradient(180deg, #0A0A0F 0%, #14141F 40%, #0A0A0F 100%)",
    accent: "linear-gradient(135deg, #09090B 0%, #10101E 50%, #09090B 100%)",
    deep:   "linear-gradient(180deg, #07070A 0%, #0F0F18 50%, #07070A 100%)",
    hero:   "linear-gradient(180deg, #0A0A12 0%, #12121E 35%, #09090B 100%)",
  },
};

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const name = (form.get("name") as string | null)?.trim();
  const iconFile = form.get("icon") as File | null;

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  // Derive a slug id from the name
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30) || "app";

  // Check for existing product with same id
  const existing = await db.select({ id: products.id }).from(products);
  let finalId = id;
  if (existing.some((p) => p.id === finalId)) {
    let suffix = 2;
    while (existing.some((p) => p.id === `${id}-${suffix}`)) suffix++;
    finalId = `${id}-${suffix}`;
  }

  // Save icon if provided
  let iconPath = `/products/${finalId}/icon.png`;
  if (iconFile && iconFile.size > 0) {
    const dir = path.join(process.cwd(), "public", "products", finalId);
    await mkdir(dir, { recursive: true });
    const bytes = await iconFile.arrayBuffer();
    await writeFile(path.join(dir, "icon.png"), Buffer.from(bytes));
  } else {
    iconPath = "";
  }

  await db.insert(products).values({ id: finalId, name, iconPath });
  await db.insert(productThemes).values({ productId: finalId, tokens: DEFAULT_THEME });
  await db.insert(productLocales).values({ productId: finalId, code: "en", label: "English", flag: "🇬🇧", sortOrder: 0 });
  await db.insert(slideGroups).values({ productId: finalId, name: "default", sortOrder: 0 });

  return NextResponse.json({ ok: true, id: finalId });
}
