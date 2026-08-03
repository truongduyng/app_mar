import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/db/client";
import { productSlides, slideCopy, slideGroups } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { slideId, slideKey, productId } = await req.json() as {
    slideId?: number;
    slideKey?: string;
    productId?: string;
  };

  if (typeof slideId !== "number" || !slideKey || !productId) {
    return NextResponse.json({ error: "Missing slideId, slideKey, or productId" }, { status: 400 });
  }

  // Fetch and validate the target row before deleting. The product check is
  // important because productSlides identifies a row only by its numeric id.
  const [row] = await db
    .select({ imagePath: productSlides.imagePath })
    .from(productSlides)
    .innerJoin(slideGroups, eq(productSlides.groupId, slideGroups.id))
    .where(and(
      eq(productSlides.id, slideId),
      eq(productSlides.slideKey, slideKey),
      eq(slideGroups.productId, productId),
    ));

  if (!row) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  // Delete the slide row first. Copy is shared across iPhone/Android and
  // groups, so retain it while another slide with this key still exists.
  await db.delete(productSlides).where(eq(productSlides.id, slideId));

  const remaining = await db
    .select({ id: productSlides.id })
    .from(productSlides)
    .innerJoin(slideGroups, eq(productSlides.groupId, slideGroups.id))
    .where(and(
      eq(productSlides.slideKey, slideKey),
      eq(slideGroups.productId, productId),
    ));

  if (remaining.length === 0) {
    await db.delete(slideCopy).where(
      and(eq(slideCopy.productId, productId), eq(slideCopy.slideKey, slideKey))
    );
  }

  // Try to delete the image file if one was uploaded
  if (row?.imagePath) {
    try {
      await unlink(path.join(process.cwd(), "public", row.imagePath));
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ ok: true });
}
