import React from "react";

export type RichTextSegment =
  | { t: "text"; v: string }
  | { t: "br" }
  | { t: "accent"; v: string };

/** Convert a RichTextSegment array to a React node, using accentColor for accent segments. */
export function renderRichText(segments: RichTextSegment[], accentColor: string): React.ReactNode {
  if (segments.length === 1 && segments[0].t === "text") return segments[0].v;
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.t === "br") return <br key={i} />;
        if (seg.t === "accent") return <span key={i} style={{ color: accentColor }}>{seg.v}</span>;
        return <React.Fragment key={i}>{seg.v}</React.Fragment>;
      })}
    </>
  );
}

/** Helpers to build segment arrays concisely in the seed file. */
export const txt = (v: string): RichTextSegment => ({ t: "text", v });
export const br = (): RichTextSegment => ({ t: "br" });
export const acc = (v: string): RichTextSegment => ({ t: "accent", v });

/**
 * Convert RichTextSegment[] to editable markup string.
 * accent segments → **text**, br segments → \n, text segments → plain.
 */
export function segmentsToMarkup(segments: RichTextSegment[]): string {
  return segments.map((seg) => {
    if (seg.t === "br") return "\\n";
    if (seg.t === "accent") return `**${seg.v}**`;
    return seg.v;
  }).join("");
}

/**
 * Parse editable markup string back to RichTextSegment[].
 * **text** → accent, \n → br, everything else → text.
 */
export function markupToSegments(markup: string): RichTextSegment[] {
  const segments: RichTextSegment[] = [];
  // Split on **...** and \n tokens
  const parts = markup.split(/(\*\*[^*]*\*\*|\\n)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part === "\\n") {
      segments.push({ t: "br" });
    } else if (part.startsWith("**") && part.endsWith("**")) {
      segments.push({ t: "accent", v: part.slice(2, -2) });
    } else {
      segments.push({ t: "text", v: part });
    }
  }
  return segments.length ? segments : [{ t: "text", v: "" }];
}
