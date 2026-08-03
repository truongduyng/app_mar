import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { slideCopy } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { RichTextSegment } from "@/lib/rich-text";

type Body = {
  productId: string;
  slideKey: string;
  locale: string;
  label: string;
  headline: RichTextSegment[];
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const slideKey  = searchParams.get("slideKey");
  const locale    = searchParams.get("locale");

  if (!productId || !slideKey || !locale) {
    return NextResponse.json({ error: "productId, slideKey and locale are required" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(slideCopy)
    .where(and(
      eq(slideCopy.productId, productId),
      eq(slideCopy.slideKey, slideKey),
      eq(slideCopy.locale, locale),
    ));

  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest) {
  const { productId, slideKey, locale, label, headline } = await req.json() as Body;

  if (!productId || !slideKey || !locale) {
    return NextResponse.json({ error: "productId, slideKey and locale are required" }, { status: 400 });
  }

  const existing = await db
    .select({ id: slideCopy.id })
    .from(slideCopy)
    .where(and(
      eq(slideCopy.productId, productId),
      eq(slideCopy.slideKey, slideKey),
      eq(slideCopy.locale, locale),
    ));

  if (existing.length) {
    await db
      .update(slideCopy)
      .set({ label, headline })
      .where(and(
        eq(slideCopy.productId, productId),
        eq(slideCopy.slideKey, slideKey),
        eq(slideCopy.locale, locale),
      ));
  } else {
    await db.insert(slideCopy).values({ productId, slideKey, locale, label, headline });
  }

  return NextResponse.json({ ok: true });
}
