import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { SlideCounter } from "./shared";

const BG = "#0a0e1a";
const WHITE = "#ffffff";
const ACCENT = "#00d4aa";
const BODY_BLUE = "#a0c4e8";
const MUTED_BLUE = "#6b8db5";

/**
 * Tayyib personal template — inspired by @itstylergermain style.
 * Dark navy bg, top-left aligned bold headlines, teal accent with underline,
 * body text in soft blue shades. No grey anywhere.
 */

export function TayyibCover({ headline, accentWord, subtitle, account, slideNumber, totalSlides }: CoverSlideProps) {
  const parts = headline.split(accentWord);

  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", padding: "80px 80px 60px", position: "relative" }}>
      {/* Headline — top-left, bold, accent word with underline */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
        <div style={{ color: WHITE, fontSize: 76, fontWeight: 700, lineHeight: 1.15, display: "flex", flexWrap: "wrap", maxWidth: 900 }}>
          {parts[0]}
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: ACCENT }}>{accentWord}</span>
            <div style={{ width: "100%", height: 6, background: ACCENT, borderRadius: 3, marginTop: 4 }} />
          </span>
          {parts[1] || ""}
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ color: BODY_BLUE, fontSize: 34, fontWeight: 400, marginTop: 40, lineHeight: 1.5 }}>
          {subtitle}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom bar — handle left, save for later right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: WHITE, fontSize: 24, fontWeight: 700 }}>@tayyib.ai</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: MUTED_BLUE, fontSize: 20, fontWeight: 400 }}>save for later</span>
        </div>
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED_BLUE} />
    </div>
  );
}

export function TayyibContent({ headline, bodyText, slideNumber, totalSlides }: ContentSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", padding: "80px 80px 60px", position: "relative" }}>
      {/* Headline — top-left with accent color */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 20 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2, maxWidth: 900, display: "flex", flexWrap: "wrap" }}>
          <span style={{ color: WHITE }}>{headline.split(" ").slice(0, Math.ceil(headline.split(" ").length / 2)).join(" ")} </span>
          <span style={{ color: ACCENT }}>{headline.split(" ").slice(Math.ceil(headline.split(" ").length / 2)).join(" ")}</span>
        </div>
        <div style={{ width: 60, height: 5, background: ACCENT, borderRadius: 3, marginTop: 12 }} />
      </div>

      {/* Body text */}
      <div style={{ color: BODY_BLUE, fontSize: 32, lineHeight: 1.7, fontWeight: 400, marginTop: 40, maxWidth: 900 }}>
        {bodyText}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: WHITE, fontSize: 24, fontWeight: 700 }}>@tayyib.ai</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: MUTED_BLUE, fontSize: 20, fontWeight: 400 }}>save for later</span>
        </div>
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED_BLUE} />
    </div>
  );
}

export function TayyibCta({ headline, ctaText, slideNumber, totalSlides }: CtaSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "80px 80px 60px", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 40 }}>
        <div style={{ color: WHITE, fontSize: 62, fontWeight: 700, textAlign: "center", lineHeight: 1.25, maxWidth: 800 }}>
          {headline}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ color: ACCENT, fontSize: 38, fontWeight: 700, textAlign: "center" }}>{ctaText}</span>
          <div style={{ width: "100%", height: 5, background: ACCENT, borderRadius: 3, marginTop: 6 }} />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: WHITE, fontSize: 24, fontWeight: 700 }}>@tayyib.ai</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: MUTED_BLUE, fontSize: 20, fontWeight: 400 }}>save for later</span>
        </div>
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED_BLUE} />
    </div>
  );
}
