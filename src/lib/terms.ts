export const STANDARD_EULA_URL =
  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

/** Keep the EULA link present after any AI rewrite or translation. */
export function ensureTermsOfUse(
  description: string,
  termsUrl = STANDARD_EULA_URL,
): string {
  const url = termsUrl.trim() || STANDARD_EULA_URL;
  if (description.includes(url)) return description;

  const termsLine = `Terms of Use (EULA): ${url}`;
  const body = description.trim().slice(0, Math.max(0, 4000 - termsLine.length - 2));
  return `${body}\n\n${termsLine}`.trim();
}
