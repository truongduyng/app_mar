import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { productSlides, slideGroups } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { productId, device, slideIds } = await req.json() as {
    productId?: string;
    device?: string;
    slideIds?: number[];
  };

  if (!productId || !device || !Array.isArray(slideIds) || slideIds.some((id) => typeof id !== "number")) {
    return NextResponse.json({ error: "Missing productId, device, or slideIds" }, { status: 400 });
  }

  if (slideIds.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const rows = await db
    .select({
      id: productSlides.id,
      groupId: productSlides.groupId,
      device: productSlides.device,
      productId: slideGroups.productId,
    })
    .from(productSlides)
    .innerJoin(slideGroups, eq(productSlides.groupId, slideGroups.id))
    .where(inArray(productSlides.id, slideIds));

  if (rows.length !== slideIds.length) {
    return NextResponse.json({ error: "One or more slides were not found" }, { status: 404 });
  }

  const groupId = rows[0]?.groupId;
  const valid = rows.every((row) =>
    row.productId === productId &&
    row.device === device &&
    row.groupId === groupId
  );

  if (!valid) {
    return NextResponse.json({ error: "Slides must belong to the same product, device, and group" }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    for (const [sortOrder, id] of slideIds.entries()) {
      await tx
        .update(productSlides)
        .set({ sortOrder })
        .where(eq(productSlides.id, id));
    }
  });

  return NextResponse.json({ ok: true });
}
