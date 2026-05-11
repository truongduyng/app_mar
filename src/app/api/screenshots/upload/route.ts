import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/db/client";
import { productSlides } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const form      = await req.formData();
  const slideId   = form.get("slideId");
  const productId = form.get("productId");
  const file      = form.get("file") as File | null;

  if (typeof slideId !== "string" || typeof productId !== "string" || !productId || !file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Missing slideId, productId, or valid image file" }, { status: 400 });
  }

  const ext      = path.extname(file.name) || ".png";
  const filename = `slide-${slideId}${ext}`;
  const dir      = path.join(process.cwd(), "public", "uploads", "screenshots", productId);
  await mkdir(dir, { recursive: true });

  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buf);

  const publicPath = `/uploads/screenshots/${productId}/${filename}`;

  await db
    .update(productSlides)
    .set({ imagePath: publicPath })
    .where(eq(productSlides.id, Number(slideId)));

  return NextResponse.json({ ok: true, imagePath: publicPath });
}
