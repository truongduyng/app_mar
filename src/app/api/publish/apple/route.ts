import { NextRequest, NextResponse } from "next/server";
import { generateAppleJWT } from "@/lib/apple-jwt";
import { toAppleLocale } from "@/lib/store-locales";
import { db } from "@/db/client";
import { products, productMetadata } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE = "https://api.appstoreconnect.apple.com/v1";

type AscHeaders = { Authorization: string; "Content-Type": string };

async function asc(url: string, headers: AscHeaders, options?: RequestInit) {
  return fetch(url, { ...options, headers });
}

const EDITABLE_STATES = [
  "PREPARE_FOR_SUBMISSION",
  "DEVELOPER_REJECTED",
  "REJECTED",
  "METADATA_REJECTED",
  "WAITING_FOR_REVIEW",
  "IN_REVIEW",
];

export async function POST(req: NextRequest) {
  const { productId, locale } = await req.json();

  const [product] = await db.select().from(products).where(eq(products.id, productId));
  if (!product?.bundleId) {
    return NextResponse.json({ error: "Product not configured for Apple publishing (missing bundleId)" }, { status: 400 });
  }

  const keyId      = process.env.ASC_KEY_ID;
  const issuerId   = process.env.ASC_ISSUER_ID;
  const privateKey = (process.env.ASC_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!keyId || !issuerId || !privateKey) {
    return NextResponse.json({ error: "Apple credentials not configured (ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY)" }, { status: 500 });
  }

  const token = generateAppleJWT(keyId, issuerId, privateKey);
  const headers: AscHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const allRows = await db.select().from(productMetadata).where(eq(productMetadata.productId, productId));
  const metaRows = locale ? allRows.filter((r) => r.locale === locale) : allRows;
  if (!metaRows.length) {
    return NextResponse.json({ error: "No metadata found in DB — save metadata first" }, { status: 404 });
  }

  // Resolve app ID
  const appsRes = await asc(`${BASE}/apps?filter[bundleId]=${product.bundleId}`, headers);
  if (!appsRes.ok) {
    return NextResponse.json({ error: `Failed to look up app: ${await appsRes.text()}` }, { status: 502 });
  }
  const appId = (await appsRes.json()).data?.[0]?.id as string | undefined;
  if (!appId) {
    return NextResponse.json({ error: `App "${product.bundleId}" not found in App Store Connect` }, { status: 404 });
  }

  // Fetch all iOS versions once — reuse for both AppInfo and VersionLocalizations
  const versionsRes = await asc(
    `${BASE}/apps/${appId}/appStoreVersions?filter[platform]=IOS&limit=10`,
    headers
  );
  if (!versionsRes.ok) {
    return NextResponse.json({ error: `Failed to fetch versions: ${await versionsRes.text()}` }, { status: 502 });
  }
  const allVersions: Array<{ id: string; attributes: { appStoreState: string; versionString: string } }> =
    (await versionsRes.json()).data ?? [];

  const editableVersion = allVersions.find((v) => EDITABLE_STATES.includes(v.attributes.appStoreState));
  const versionForLocs = editableVersion ?? allVersions[0];

  const errors: string[] = [];

  // ── AppInfoLocalizations: name + subtitle ─────────────────────────────────
  if (editableVersion) {
    const appInfosRes = await asc(`${BASE}/apps/${appId}/appInfos`, headers);
    const appInfosJson = appInfosRes.ok ? await appInfosRes.json() : { data: [] };
    const editableAppInfo = (appInfosJson.data ?? []).find(
      (a: { attributes: { appStoreState: string } }) =>
        EDITABLE_STATES.includes(a.attributes.appStoreState)
    ) ?? appInfosJson.data?.[0];
    const appInfoId = editableAppInfo?.id as string | undefined;

    if (appInfoId) {
      const infoLocsRes = await asc(`${BASE}/appInfos/${appInfoId}/appInfoLocalizations`, headers);
      const infoLocs: Array<{ id: string; attributes: { locale: string } }> =
        infoLocsRes.ok ? (await infoLocsRes.json()).data ?? [] : [];

      for (const row of metaRows) {
        const appleLocale = toAppleLocale(row.locale);
        const existing = infoLocs.find((l) => l.attributes.locale === appleLocale);
        const method = existing ? "PATCH" : "POST";
        const url = existing ? `${BASE}/appInfoLocalizations/${existing.id}` : `${BASE}/appInfoLocalizations`;

        const infoAttrs = {
          name: row.name,
          subtitle: row.subtitle,
          ...(product.privacyPolicyUrl ? { privacyPolicyUrl: product.privacyPolicyUrl } : {}),
        };
        const body = existing
          ? { data: { type: "appInfoLocalizations", id: existing.id, attributes: infoAttrs } }
          : { data: { type: "appInfoLocalizations", attributes: { locale: appleLocale, ...infoAttrs }, relationships: { appInfo: { data: { type: "appInfos", id: appInfoId } } } } };

        const r = await asc(url, headers, { method, body: JSON.stringify(body) });
        const rText = await r.text();
        if (!r.ok) errors.push(`AppInfo [${appleLocale}] ${r.status}: ${rText}`);
      }
    }
  } else {
    errors.push(`AppInfo (warning): no editable version found — name and subtitle were not updated`);
  }

  // ── AppStoreVersionLocalizations: description + keywords + promoText ───────
  if (versionForLocs) {
    const versionLocsRes = await asc(
      `${BASE}/appStoreVersions/${versionForLocs.id}/appStoreVersionLocalizations`,
      headers
    );
    const versionLocs: Array<{ id: string; attributes: { locale: string } }> =
      versionLocsRes.ok ? (await versionLocsRes.json()).data ?? [] : [];

    for (const row of metaRows) {
      const appleLocale = toAppleLocale(row.locale);
      const existing = versionLocs.find((l) => l.attributes.locale === appleLocale);
      const method = existing ? "PATCH" : "POST";
      const url = existing ? `${BASE}/appStoreVersionLocalizations/${existing.id}` : `${BASE}/appStoreVersionLocalizations`;

      const versionAttrs = {
        description: row.description,
        keywords: row.keywords,
        promotionalText: row.promoText,
        ...(product.supportUrl ? { supportUrl: product.supportUrl } : {}),
      };
      const body = existing
        ? { data: { type: "appStoreVersionLocalizations", id: existing.id, attributes: versionAttrs } }
        : { data: { type: "appStoreVersionLocalizations", attributes: { locale: appleLocale, ...versionAttrs }, relationships: { appStoreVersion: { data: { type: "appStoreVersions", id: versionForLocs.id } } } } };

      const r = await asc(url, headers, { method, body: JSON.stringify(body) });
      const rText = await r.text();
      if (!r.ok) errors.push(`VersionLoc [${appleLocale}] ${r.status}: ${rText}`);
    }
  }

  const warnings = errors.filter((e) => e.includes("(warning)"));
  const hardErrors = errors.filter((e) => !e.includes("(warning)"));

  if (hardErrors.length) {
    return NextResponse.json({ ok: false, errors: hardErrors, warnings }, { status: 207 });
  }
  return NextResponse.json({ ok: true, warnings });
}
