import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { LogoBar, SlideCounter } from "./shared";

const BG = "#0a0e1a";
const WHITE = "#ffffff";
const MUTED = "#8892b0";

export function BoldCover({ headline, accentWord, subtitle, account, theme, slideNumber, totalSlides }: CoverSlideProps) {
  const parts = headline.split(accentWord);

  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 80, position: "relative", overflow: "hidden" }}>
      {/* Large rotated rectangle decoration */}
      <div style={{ position: "absolute", width: 600, height: 600, background: theme.accentColor, opacity: 0.15, top: -100, right: -100, borderRadius: 40, transform: "rotate(25deg)" }} />

      <div style={{ color: WHITE, fontSize: 68, fontWeight: 700, textAlign: "center", lineHeight: 1.2, display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 900, textTransform: "uppercase" as const, letterSpacing: -1 }}>
        {parts[0]}
        <span style={{ color: theme.accentColor }}>{accentWord}</span>
        {parts[1] || ""}
      </div>

      {subtitle && (
        <div style={{ color: MUTED, fontSize: 26, fontWeight: 400, marginTop: 30, textTransform: "uppercase" as const, letterSpacing: 3 }}>{subtitle}</div>
      )}

      <div style={{ width: 60, height: 4, background: theme.accentColor, marginTop: 40, borderRadius: 2 }} />

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function BoldContent({ headline, bodyText, slideNumber, totalSlides, account, theme }: ContentSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, position: "relative", overflow: "hidden" }}>
      {/* Corner triangle decoration */}
      <div style={{ position: "absolute", width: 300, height: 300, background: theme.accentColor, opacity: 0.12, top: -100, left: -100, borderRadius: 40, transform: "rotate(45deg)" }} />

      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 72, fontWeight: 700, color: theme.accentColor, marginRight: 20, lineHeight: 1 }}>
          {String(slideNumber).padStart(2, "0")}
        </div>
        <div style={{ width: 3, height: 50, background: theme.accentColor, marginRight: 20, borderRadius: 2 }} />
        <div style={{ color: WHITE, fontSize: 40, fontWeight: 700, lineHeight: 1.3, textTransform: "uppercase" as const, maxWidth: 700 }}>
          {headline}
        </div>
      </div>

      <div style={{ color: MUTED, fontSize: 30, lineHeight: 1.8, fontWeight: 400, maxWidth: 800, paddingLeft: 4 }}>
        {bodyText}
      </div>

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function BoldCta({ headline, ctaText, account, theme, slideNumber, totalSlides }: CtaSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, display: "flex", position: "relative", overflow: "hidden" }}>
      {/* Left half */}
      <div style={{ width: 540, height: 1080, background: theme.accentColor, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", padding: "80px 40px 80px 60px" }}>
        <div style={{ color: BG, fontSize: 46, fontWeight: 700, textAlign: "right", lineHeight: 1.3, textTransform: "uppercase" as const }}>
          {headline}
        </div>
      </div>
      {/* Right half */}
      <div style={{ width: 540, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "80px 60px 80px 40px" }}>
        <div style={{ color: WHITE, fontSize: 30, fontWeight: 400, lineHeight: 1.6 }}>
          {ctaText}
        </div>
      </div>

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}
