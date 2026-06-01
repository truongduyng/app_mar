import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { productFeatureGraphics } from "@/db/schema";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    productId?: string;
    locale?: string;
    tagline?: string;
    subtitle?: string | null;
  };

  const { productId, locale, tagline, subtitle } = body;

  if (!productId || !locale || !tagline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const values = {
    tagline,
    subtitle: subtitle ?? null,
  };

  await db
    .insert(productFeatureGraphics)
    .values({ productId, locale, ...values })
    .onConflictDoUpdate({
      target: [productFeatureGraphics.productId, productFeatureGraphics.locale],
      set: values,
    });

  return NextResponse.json({ ok: true });
}
