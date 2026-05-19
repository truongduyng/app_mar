import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { productCtaImages } from "@/db/schema";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    productId?: string;
    locale?: string;
    headline?: string;
    sc1?: string;
    sc2?: string;
    ctaLabel?: string | null;
  };

  const { productId, locale, headline, sc1, sc2, ctaLabel } = body;

  if (!productId || !locale || !headline || !sc1 || !sc2) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const values = {
    headline,
    sc1,
    sc2,
    ctaLabel: ctaLabel ?? null,
  };

  await db
    .insert(productCtaImages)
    .values({ productId, locale, ...values })
    .onConflictDoUpdate({
      target: [productCtaImages.productId, productCtaImages.locale],
      set: values,
    });

  return NextResponse.json({ ok: true });
}
