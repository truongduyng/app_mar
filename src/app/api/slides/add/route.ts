import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/db/client";
import { slideGroups, productSlides, slideCopy, productLocales } from "@/db/schema";
import { eq, and, max } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const form        = await req.formData();
  const productId   = form.get("productId") as string | null;
  const componentKey = form.get("componentKey") as string | null;
  const device      = form.get("device") as string | null;
  const slideKey    = form.get("slideKey") as string | null;
  const label       = form.get("label") as string | null;
  const headline    = form.get("headline") as string | null;
  const subtitle    = form.get("subtitle") as string | null;
  const file        = form.get("file") as File | null;

  if (!productId || !componentKey || !device || !slideKey || !label) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Find or create the default slide group for this product
  let [group] = await db
    .select()
    .from(slideGroups)
    .where(and(eq(slideGroups.productId, productId), eq(slideGroups.name, "default")));

  if (!group) {
    const [inserted] = await db
      .insert(slideGroups)
      .values({ productId, name: "default", sortOrder: 0 })
      .returning();
    group = inserted;
  }

  // Determine next sortOrder
  const [{ maxOrder }] = await db
    .select({ maxOrder: max(productSlides.sortOrder) })
    .from(productSlides)
    .where(and(eq(productSlides.groupId, group.id), eq(productSlides.device, device)));

  const sortOrder = (maxOrder ?? -1) + 1;

  // Save uploaded image if provided
  let imagePath: string | undefined;
  if (file && file.type.startsWith("image/")) {
    const ext      = path.extname(file.name) || ".png";
    const filename = `slide-new-${Date.now()}${ext}`;
    const dir      = path.join(process.cwd(), "public", "uploads", "screenshots", productId);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
    imagePath = `/uploads/screenshots/${productId}/${filename}`;
  }

  // Insert the slide row
  const [slide] = await db
    .insert(productSlides)
    .values({ groupId: group.id, device, slideKey, componentKey, imagePath, sortOrder })
    .returning();

  // Rename image to use slide id now that we have it
  if (imagePath) {
    const ext     = path.extname(imagePath);
    const newName = `slide-${slide.id}${ext}`;
    const dir     = path.join(process.cwd(), "public", "uploads", "screenshots", productId);
    try {
      const { rename } = await import("fs/promises");
      await rename(path.join(dir, path.basename(imagePath)), path.join(dir, newName));
      imagePath = `/uploads/screenshots/${productId}/${newName}`;
      await db.update(productSlides).set({ imagePath }).where(eq(productSlides.id, slide.id));
    } catch { /* non-fatal */ }
  }

  // Insert copy for all product locales (using the same text for now)
  const locales = await db
    .select({ code: productLocales.code })
    .from(productLocales)
    .where(eq(productLocales.productId, productId));

  const localeCodes = locales.length ? locales.map((l) => l.code) : ["en"];
  const headlineSegs = headline ? [{ t: "text", v: headline }] : [];
  const subtitleSegs = subtitle ? [{ t: "text", v: subtitle }] : [];

  for (const code of localeCodes) {
    await db.insert(slideCopy).values({
      productId,
      slideKey,
      locale: code,
      label: label ?? slideKey,
      headline: headlineSegs,
      subtitle: subtitleSegs,
    }).onConflictDoNothing();
  }

  return NextResponse.json({ ok: true, slideId: slide.id, imagePath });
}
