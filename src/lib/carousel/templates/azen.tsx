import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { SlideCounter, BackgroundLayer } from "./shared";

/**
 * Azen business template — @leadgenman style.
 * Dark charcoal bg, massive bold centered text, accent word in brand color.
 * Ultra-minimal: no decorations, no logo bar. Just typography.
 */

const BG = "#1a1a1a";
const WHITE = "#f5f5f5";
const MUTED = "#666666";

export function AzenCover({ headline, accentWord, theme, slideNumber, totalSlides, backgroundImage }: CoverSlideProps) {
  const parts = headline.split(accentWord);

  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 80, position: "relative", overflow: "hidden" }}>
      {backgroundImage && <BackgroundLayer base64={backgroundImage} overlayOpacity={0.3} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
        <div style={{ color: WHITE, fontSize: 110, fontWeight: 700, textAlign: "center", lineHeight: 1.15, display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 950 }}>
          {parts[0]}
          <span style={{ color: theme.accentColor }}>{accentWord}</span>
          {parts[1] || ""}
        </div>
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function AzenContent({ headline, bodyText, slideNumber, totalSlides, theme, backgroundImage }: ContentSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", padding: "100px 100px", position: "relative", overflow: "hidden" }}>
      {backgroundImage && <BackgroundLayer base64={backgroundImage} overlayOpacity={0.3} />}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, gap: 30 }}>
        <div style={{ color: theme.accentColor, fontSize: 48, fontWeight: 700, lineHeight: 1.2, maxWidth: 900 }}>
          {headline}
        </div>
        <div style={{ color: WHITE, fontSize: 34, lineHeight: 1.7, fontWeight: 400, maxWidth: 880 }}>
          {bodyText}
        </div>
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function AzenCta({ headline, ctaText, slideNumber, totalSlides, theme, backgroundImage }: CtaSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 100, position: "relative", overflow: "hidden" }}>
      {backgroundImage && <BackgroundLayer base64={backgroundImage} overlayOpacity={0.3} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 40 }}>
        <div style={{ color: WHITE, fontSize: 80, fontWeight: 700, textAlign: "center", lineHeight: 1.2, maxWidth: 850 }}>
          {headline}
        </div>
        <div style={{ color: theme.accentColor, fontSize: 40, fontWeight: 700, textAlign: "center" }}>
          {ctaText}
        </div>
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}
