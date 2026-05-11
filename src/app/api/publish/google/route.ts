import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { toGoogleLocale } from "@/lib/store-locales";
import { db } from "@/db/client";
import { products, productMetadata } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { productId, locale } = await req.json();

  const [product] = await db.select().from(products).where(eq(products.id, productId));
  if (!product?.packageName) {
    return NextResponse.json({ error: "Product not configured for Google Play publishing (missing packageName)" }, { status: 400 });
  }

  const serviceAccountJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    return NextResponse.json({ error: "Google credentials not configured (GOOGLE_PLAY_SERVICE_ACCOUNT_JSON)" }, { status: 500 });
  }

  const allRows = await db.select().from(productMetadata).where(eq(productMetadata.productId, productId));
  const metaRows = locale ? allRows.filter((r) => r.locale === locale) : allRows;
  if (!metaRows.length) {
    return NextResponse.json({ error: "No metadata found in DB — save metadata first" }, { status: 404 });
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(serviceAccountJson);
  } catch {
    return NextResponse.json({ error: "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not valid JSON" }, { status: 500 });
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });

  const androidpublisher = google.androidpublisher({ version: "v3", auth });
  const packageName = product.packageName;

  // Create a new edit — all changes must happen within an edit, then be committed
  let editId: string;
  try {
    const editRes = await androidpublisher.edits.insert({ packageName });
    editId = editRes.data.id!;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to create Google Play edit: ${msg}` }, { status: 502 });
  }

  const errors: string[] = [];

  for (const row of metaRows) {
    const language = toGoogleLocale(row.locale);
    try {
      await androidpublisher.edits.listings.update({
        packageName,
        editId,
        language,
        requestBody: {
          language,
          title:            row.name,
          shortDescription: row.shortDescription,
          fullDescription:  row.description,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Listing [${language}]: ${msg}`);
    }
  }

  if (errors.length) {
    // Delete the edit so nothing partial goes live
    try {
      await androidpublisher.edits.delete({ packageName, editId });
    } catch {
      // best-effort cleanup
    }
    return NextResponse.json({ ok: false, errors }, { status: 207 });
  }

  try {
    await androidpublisher.edits.commit({ packageName, editId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to commit Google Play edit: ${msg}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
