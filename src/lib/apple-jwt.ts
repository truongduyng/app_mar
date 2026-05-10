import crypto from "crypto";

export function generateAppleJWT(keyId: string, issuerId: string, privateKeyPem: string): string {
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: issuerId,
    iat: now,
    exp: now + 1200, // 20 min — Apple's maximum
    aud: "appstoreconnect-v1",
  })).toString("base64url");

  const data = `${header}.${payload}`;
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  sign.end();

  // dsaEncoding: "ieee-p1363" outputs raw R||S bytes (64 bytes) instead of DER,
  // which is what App Store Connect expects for ES256 JWTs.
  const sig = sign.sign({ key: privateKeyPem, dsaEncoding: "ieee-p1363" }).toString("base64url");
  return `${data}.${sig}`;
}
