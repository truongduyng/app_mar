import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/db/client";
import { productSlides } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { slideId, imagePath } = await req.json() as { slideId?: number; imagePath?: string };

  if (typeof slideId !== "number") {
    return NextResponse.json({ error: "Missing slideId" }, { status: 400 });
  }

  await db
    .update(productSlides)
    .set({ imagePath: null })
    .where(eq(productSlides.id, slideId));

  if (imagePath) {
    try {
      const abs = path.join(process.cwd(), "public", imagePath);
      await unlink(abs);
    } catch {
      // ignore if file doesn't exist
    }
  }

  return NextResponse.json({ ok: true });
}
