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
