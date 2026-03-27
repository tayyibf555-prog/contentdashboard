import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { LogoBar, SlideCounter } from "./shared";

const BG = "#0a0e1a";
const WHITE = "#ffffff";
const ACCENT = "#7eb8ff";
const MUTED = "#8892b0";

/**
 * Azen business template — inspired by @leadgenman style.
 * Dark navy bg, large bold white text, accent words in light blue.
 * Clean, no decorative elements. Just typography.
 */

export function AzenCover({ headline, accentWord, theme, slideNumber, totalSlides, account }: CoverSlideProps) {
  const parts = headline.split(accentWord);

  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 100, position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
        <div style={{ color: WHITE, fontSize: 82, fontWeight: 700, textAlign: "center", lineHeight: 1.2, display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 900 }}>
          {parts[0]}
          <span style={{ color: ACCENT }}>{accentWord}</span>
          {parts[1] || ""}
        </div>
      </div>

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function AzenContent({ headline, bodyText, slideNumber, totalSlides, account }: ContentSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", padding: "100px 90px", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
        <div style={{ color: WHITE, fontSize: 36, lineHeight: 1.7, fontWeight: 400, maxWidth: 920, display: "flex", flexWrap: "wrap" }}>
          <span style={{ color: ACCENT, fontWeight: 700 }}>{headline} </span>
          <span>{bodyText}</span>
        </div>
      </div>

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function AzenCta({ headline, ctaText, account, slideNumber, totalSlides }: CtaSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 100, position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 40 }}>
        <div style={{ color: WHITE, fontSize: 64, fontWeight: 700, textAlign: "center", lineHeight: 1.25, maxWidth: 800 }}>
          {headline}
        </div>
        <div style={{ color: ACCENT, fontSize: 36, fontWeight: 700, textAlign: "center" }}>
          {ctaText}
        </div>
      </div>

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}
