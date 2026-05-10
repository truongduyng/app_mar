import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateAppleJWT } from "@/lib/apple-jwt";
import { toAppleLocale } from "@/lib/store-locales";
import crypto from "crypto";

const BASE = "https://api.appstoreconnect.apple.com/v1";
// ASC uses APP_IPHONE_67 for the 6.7"/6.9" Pro Max size class
const DISPLAY_TYPE = "APP_IPHONE_67";

const EDITABLE_STATES = [
  "PREPARE_FOR_SUBMISSION",
  "DEVELOPER_REJECTED",
  "REJECTED",
  "METADATA_REJECTED",
  "WAITING_FOR_REVIEW",
  "IN_REVIEW",
];

type SlidePayload = {
  index: number;
  label: string;
  dataUrl: string; // base64 PNG data URL
};

type Payload = {
  productId: string;
  locale: string;
  slides: SlidePayload[];
};

type AscHeaders = { Authorization: string; "Content-Type": string };

async function asc(url: string, headers: AscHeaders, options?: RequestInit) {
  return fetch(url, { ...options, headers });
}

export async function POST(req: NextRequest) {
  const { productId, locale, slides } = await req.json() as Payload;

  const [product] = await db.select().from(products).where(eq(products.id, productId));
  if (!product?.bundleId) {
    return NextResponse.json({ error: "Product not configured for Apple publishing (missing bundleId)" }, { status: 400 });
  }

  if (!slides?.length) {
    return NextResponse.json({ error: "No slides provided" }, { status: 400 });
  }

  const keyId      = process.env.ASC_KEY_ID;
  const issuerId   = process.env.ASC_ISSUER_ID;
  const privateKey = (process.env.ASC_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!keyId || !issuerId || !privateKey) {
    return NextResponse.json({ error: "Apple credentials not configured" }, { status: 500 });
  }

  const token = generateAppleJWT(keyId, issuerId, privateKey);
  const headers: AscHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // Resolve app ID
  const appsRes = await asc(`${BASE}/apps?filter[bundleId]=${product.bundleId}`, headers);
  if (!appsRes.ok) return NextResponse.json({ error: `Failed to find app: ${await appsRes.text()}` }, { status: 502 });
  const appId = (await appsRes.json()).data?.[0]?.id as string | undefined;
  if (!appId) return NextResponse.json({ error: "App not found in App Store Connect" }, { status: 404 });

  // Find editable version
  const versionsRes = await asc(`${BASE}/apps/${appId}/appStoreVersions?filter[platform]=IOS&limit=10`, headers);
  if (!versionsRes.ok) return NextResponse.json({ error: "Failed to fetch versions" }, { status: 502 });
  const allVersions: Array<{ id: string; attributes: { appStoreState: string } }> = (await versionsRes.json()).data ?? [];
  const editableVersion = allVersions.find((v) => EDITABLE_STATES.includes(v.attributes.appStoreState));
  if (!editableVersion) return NextResponse.json({ error: "No editable version found — create a new version draft in App Store Connect first" }, { status: 400 });

  const versionId = editableVersion.id;
  const appleLocale = toAppleLocale(locale);

  // Find or get the version localization for this locale
  const versionLocsRes = await asc(`${BASE}/appStoreVersions/${versionId}/appStoreVersionLocalizations`, headers);
  if (!versionLocsRes.ok) return NextResponse.json({ error: "Failed to fetch version localizations" }, { status: 502 });
  const versionLocs: Array<{ id: string; attributes: { locale: string } }> = (await versionLocsRes.json()).data ?? [];
  const versionLoc = versionLocs.find((l) => l.attributes.locale === appleLocale);
  if (!versionLoc) return NextResponse.json({ error: `No localization found for locale "${appleLocale}" — publish metadata first to create it` }, { status: 400 });

  const versionLocId = versionLoc.id;

  // Get existing screenshot sets for this localization
  const setsRes = await asc(`${BASE}/appStoreVersionLocalizations/${versionLocId}/appScreenshotSets`, headers);
  const sets: Array<{ id: string; attributes: { screenshotDisplayType: string } }> = setsRes.ok ? (await setsRes.json()).data ?? [] : [];

  // Find or create the 6.9" screenshot set
  let setId = sets.find((s) => s.attributes.screenshotDisplayType === DISPLAY_TYPE)?.id;
  if (!setId) {
    const createSetRes = await asc(`${BASE}/appScreenshotSets`, headers, {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "appScreenshotSets",
          attributes: { screenshotDisplayType: DISPLAY_TYPE },
          relationships: { appStoreVersionLocalization: { data: { type: "appStoreVersionLocalizations", id: versionLocId } } },
        },
      }),
    });
    if (!createSetRes.ok) return NextResponse.json({ error: `Failed to create screenshot set: ${await createSetRes.text()}` }, { status: 502 });
    setId = (await createSetRes.json()).data.id as string;
  }

  // Delete all existing screenshots in the set so we start fresh
  const existingScreenshotsRes = await asc(`${BASE}/appScreenshotSets/${setId}/appScreenshots`, headers);
  if (existingScreenshotsRes.ok) {
    const existingScreenshots: Array<{ id: string }> = (await existingScreenshotsRes.json()).data ?? [];
    for (const s of existingScreenshots) {
      await asc(`${BASE}/appScreenshots/${s.id}`, headers, { method: "DELETE" });
    }
  }

  const errors: string[] = [];

  // Upload each slide
  for (const slide of slides) {
    const base64 = slide.dataUrl.replace(/^data:image\/png;base64,/, "");
    const imageBuffer = Buffer.from(base64, "base64");
    const fileSize = imageBuffer.length;
    const md5 = crypto.createHash("md5").update(imageBuffer).digest("hex");
    const filename = `${String(slide.index).padStart(2, "0")}-${slide.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

    // Reserve screenshot slot
    const reserveRes = await asc(`${BASE}/appScreenshots`, headers, {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "appScreenshots",
          attributes: { fileName: filename, fileSize },
          relationships: { appScreenshotSet: { data: { type: "appScreenshotSets", id: setId } } },
        },
      }),
    });
    if (!reserveRes.ok) {
      errors.push(`Slide ${slide.index}: failed to reserve — ${await reserveRes.text()}`);
      continue;
    }
    const reserveData = await reserveRes.json();
    const screenshotId = reserveData.data.id as string;
    const uploadOps: Array<{ method: string; url: string; length: number; offset: number; requestHeaders: Array<{ name: string; value: string }> }> =
      reserveData.data.attributes.uploadOperations ?? [];

    // Upload binary chunks (usually one chunk for screenshots)
    for (const op of uploadOps) {
      const chunk = imageBuffer.subarray(op.offset, op.offset + op.length);
      const uploadHeaders: Record<string, string> = {};
      for (const h of op.requestHeaders) uploadHeaders[h.name] = h.value;

      const uploadRes = await fetch(op.url, {
        method: op.method,
        headers: uploadHeaders,
        body: chunk,
      });
      if (!uploadRes.ok) {
        errors.push(`Slide ${slide.index}: upload failed — ${uploadRes.status}`);
      }
    }

    // Commit screenshot with MD5 checksum
    const commitRes = await asc(`${BASE}/appScreenshots/${screenshotId}`, headers, {
      method: "PATCH",
      body: JSON.stringify({
        data: {
          type: "appScreenshots",
          id: screenshotId,
          attributes: { uploaded: true, sourceFileChecksum: md5 },
        },
      }),
    });
    if (!commitRes.ok) {
      errors.push(`Slide ${slide.index}: commit failed — ${await commitRes.text()}`);
    }
  }

  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 207 });
  }
  return NextResponse.json({ ok: true });
}
