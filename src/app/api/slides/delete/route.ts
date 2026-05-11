import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/db/client";
import { productSlides, slideCopy } from "@/db/schema";
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

  // Fetch current imagePath before deleting
  const [row] = await db
    .select({ imagePath: productSlides.imagePath })
    .from(productSlides)
    .where(eq(productSlides.id, slideId));

  // Delete slide_copy rows for this slide
  await db.delete(slideCopy).where(
    and(eq(slideCopy.productId, productId), eq(slideCopy.slideKey, slideKey))
  );

  // Delete the slide row
  await db.delete(productSlides).where(eq(productSlides.id, slideId));

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
