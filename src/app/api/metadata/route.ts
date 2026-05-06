import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { productMetadata } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, locale, metadata } = body as {
    productId: string;
    locale: string;
    metadata: {
      name: string;
      subtitle: string;
      promoText: string;
      shortDescription: string;
      description: string;
      keywords: string;
    };
  };

  if (!productId || !locale || !metadata) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await db
    .insert(productMetadata)
    .values({
      productId,
      locale,
      name: metadata.name,
      subtitle: metadata.subtitle,
      promoText: metadata.promoText,
      shortDescription: metadata.shortDescription,
      description: metadata.description,
      keywords: metadata.keywords,
    })
    .onConflictDoUpdate({
      target: [productMetadata.productId, productMetadata.locale],
      set: {
        name: metadata.name,
        subtitle: metadata.subtitle,
        promoText: metadata.promoText,
        shortDescription: metadata.shortDescription,
        description: metadata.description,
        keywords: metadata.keywords,
      },
    });

  return NextResponse.json({ ok: true });
}
