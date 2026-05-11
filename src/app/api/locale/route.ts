import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { productLocales, slideCopy, productMetadata, productFeatureGraphics, productSocialOgs, productCtaImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  const { productId, locale } = await req.json() as { productId: string; locale: string };

  if (!productId || !locale) {
    return NextResponse.json({ error: "Missing productId or locale" }, { status: 400 });
  }

  await Promise.all([
    db.delete(productLocales).where(and(eq(productLocales.productId, productId), eq(productLocales.code, locale))),
    db.delete(slideCopy).where(and(eq(slideCopy.productId, productId), eq(slideCopy.locale, locale))),
    db.delete(productMetadata).where(and(eq(productMetadata.productId, productId), eq(productMetadata.locale, locale))),
    db.delete(productFeatureGraphics).where(and(eq(productFeatureGraphics.productId, productId), eq(productFeatureGraphics.locale, locale))),
    db.delete(productSocialOgs).where(and(eq(productSocialOgs.productId, productId), eq(productSocialOgs.locale, locale))),
    db.delete(productCtaImages).where(and(eq(productCtaImages.productId, productId), eq(productCtaImages.locale, locale))),
  ]);

  return NextResponse.json({ ok: true });
}
