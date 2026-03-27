import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { LogoBar, SlideCounter, AccentStripe, NumberWatermark } from "./shared";

const BG = "#0a0e1a";
const MUTED = "#8892b0";
const WHITE = "#ffffff";

export function ArchitectCover({ headline, accentWord, subtitle, account, theme, slideNumber, totalSlides }: CoverSlideProps) {
  const parts = headline.split(accentWord);

  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 80, position: "relative" }}>
      <AccentStripe orientation="vertical" color={theme.accentColor} thickness={6} length="100%" top={120} left={0} bottom={120} />

      <div style={{ color: WHITE, fontSize: 60, fontWeight: 700, textAlign: "center", lineHeight: 1.3, display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 900 }}>
        {parts[0]}
        <span style={{ color: theme.accentColor }}>{accentWord}</span>
        {parts[1] || ""}
      </div>

      <div style={{ width: 80, height: 3, background: theme.accentColor, marginTop: 30, marginBottom: 30, borderRadius: 2 }} />

      {subtitle && (
        <div style={{ color: MUTED, fontSize: 28, fontWeight: 400 }}>{subtitle}</div>
      )}

      <div style={{ color: MUTED, fontSize: 26, marginTop: 40, fontWeight: 400 }}>Swipe to learn more</div>

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function ArchitectContent({ headline, bodyText, slideNumber, totalSlides, account, theme }: ContentSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, position: "relative" }}>
      <AccentStripe orientation="vertical" color={theme.accentColor} thickness={6} length="100%" top={120} left={0} bottom={120} />
      <NumberWatermark number={slideNumber} color={theme.accentColor} />

      <div style={{ color: theme.accentColor, fontSize: 46, fontWeight: 700, marginBottom: 30, lineHeight: 1.3, maxWidth: 800 }}>
        {headline}
      </div>
      <div style={{ color: WHITE, fontSize: 30, lineHeight: 1.8, fontWeight: 400, maxWidth: 800 }}>
        {bodyText}
      </div>

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function ArchitectCta({ headline, ctaText, account, theme, slideNumber, totalSlides }: CtaSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 80, position: "relative" }}>
      <AccentStripe orientation="vertical" color={theme.accentColor} thickness={6} length="100%" top={120} left={0} bottom={120} />

      <div style={{ color: WHITE, fontSize: 50, fontWeight: 700, textAlign: "center", lineHeight: 1.3, marginBottom: 40, maxWidth: 800 }}>
        {headline}
      </div>

      <div style={{ background: theme.accentColor, borderRadius: 12, padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: BG, fontSize: 30, fontWeight: 700 }}>{ctaText}</span>
      </div>

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}
