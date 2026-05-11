import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { productId, bundleId, packageName, privacyPolicyUrl, supportUrl } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  await db
    .update(products)
    .set({
      bundleId:         bundleId || null,
      packageName:      packageName || null,
      privacyPolicyUrl: privacyPolicyUrl || null,
      supportUrl:       supportUrl || null,
    })
    .where(eq(products.id, productId));

  return NextResponse.json({ ok: true });
}
