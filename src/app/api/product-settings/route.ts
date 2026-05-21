import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/db/client";
import { products, productThemes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let productId: string, name: string | undefined, bundleId: string | undefined,
    packageName: string | undefined, privacyPolicyUrl: string | undefined,
    supportUrl: string | undefined, accent: string | undefined,
    archived: boolean | undefined, iconFile: File | undefined | null;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    productId        = (form.get("productId") as string | null) ?? "";
    name             = (form.get("name") as string | null) ?? undefined;
    bundleId         = (form.get("bundleId") as string | null) ?? undefined;
    packageName      = (form.get("packageName") as string | null) ?? undefined;
    privacyPolicyUrl = (form.get("privacyPolicyUrl") as string | null) ?? undefined;
    supportUrl       = (form.get("supportUrl") as string | null) ?? undefined;
    accent           = (form.get("accent") as string | null) ?? undefined;
    iconFile         = form.get("icon") as File | null;
  } else {
    const body = await req.json() as Record<string, unknown>;
    productId        = typeof body.productId === "string" ? body.productId : "";
    name             = typeof body.name === "string" ? body.name : undefined;
    bundleId         = typeof body.bundleId === "string" ? body.bundleId : undefined;
    packageName      = typeof body.packageName === "string" ? body.packageName : undefined;
    privacyPolicyUrl = typeof body.privacyPolicyUrl === "string" ? body.privacyPolicyUrl : undefined;
    supportUrl       = typeof body.supportUrl === "string" ? body.supportUrl : undefined;
    accent           = typeof body.accent === "string" ? body.accent : undefined;
    archived         = typeof body.archived === "boolean" ? body.archived : undefined;
  }

  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  // Handle icon upload
  let iconPath: string | undefined;
  if (iconFile && iconFile.size > 0) {
    const ext = path.extname(iconFile.name) || ".png";
    const dir = path.join(process.cwd(), "public", "products", productId);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `icon${ext}`), Buffer.from(await iconFile.arrayBuffer()));
    iconPath = `/products/${productId}/icon${ext}`;
  }

  // Update products table
  type ProductUpdate = {
    name?: string;
    iconPath?: string;
    bundleId?: string | null;
    packageName?: string | null;
    privacyPolicyUrl?: string | null;
    supportUrl?: string | null;
    archived?: boolean;
  };
  const productUpdate: ProductUpdate = {};
  if (name?.trim())               productUpdate.name             = name.trim();
  if (iconPath)                   productUpdate.iconPath         = iconPath;
  if (bundleId  !== undefined)    productUpdate.bundleId         = bundleId  || null;
  if (packageName !== undefined)  productUpdate.packageName      = packageName || null;
  if (privacyPolicyUrl !== undefined) productUpdate.privacyPolicyUrl = privacyPolicyUrl || null;
  if (supportUrl !== undefined)   productUpdate.supportUrl       = supportUrl || null;
  if (archived !== undefined)     productUpdate.archived         = archived;

  if (Object.keys(productUpdate).length > 0) {
    await db.update(products).set(productUpdate).where(eq(products.id, productId));
  }

  // Update accent color in theme tokens if provided
  if (accent) {
    const [existing] = await db.select().from(productThemes).where(eq(productThemes.productId, productId));
    if (existing) {
      const tokens = existing.tokens as Record<string, unknown>;
      const hex = accent.replace(/[^#0-9a-fA-F]/g, "").slice(0, 7);
      // Parse hex to rgb for glow
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      await db.update(productThemes).set({
        tokens: {
          ...tokens,
          accent:      hex,
          accentGlow:  `rgba(${r},${g},${b},0.35)`,
          accentSoft:  `rgba(${r},${g},${b},0.12)`,
        },
      }).where(eq(productThemes.productId, productId));
    }
  }

  return NextResponse.json({ ok: true, iconPath });
}
