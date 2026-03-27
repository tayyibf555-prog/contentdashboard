import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { LogoBar, SlideCounter, DecoCircle, NumberedMarker } from "./shared";

const WHITE = "#ffffff";
const LIGHT = "#e0e0e0";

function darken(hex: string): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 180);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 180);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 180);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function GradientCover({ headline, accentWord, subtitle, account, theme, slideNumber, totalSlides }: CoverSlideProps) {
  const dark = darken(theme.accentColor);
  const parts = headline.split(accentWord);

  return (
    <div style={{ width: 1080, height: 1080, background: `radial-gradient(circle at 30% 40%, ${dark} 0%, #080810 100%)`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 80, position: "relative" }}>
      <DecoCircle size={350} color={theme.accentColor} opacity={0.12} top={-80} right={-60} />
      <DecoCircle size={200} color={theme.accentColor} opacity={0.08} bottom={100} left={-40} />

      <div style={{ color: WHITE, fontSize: 58, fontWeight: 700, textAlign: "center", lineHeight: 1.3, display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 900 }}>
        {parts[0]}
        <div style={{ background: theme.accentColor, borderRadius: 8, padding: "4px 16px", margin: "0 8px" }}>
          <span style={{ color: "#0a0e1a", fontWeight: 700 }}>{accentWord}</span>
        </div>
        {parts[1] || ""}
      </div>

      {subtitle && (
        <div style={{ color: LIGHT, fontSize: 26, fontWeight: 400, marginTop: 30 }}>{subtitle}</div>
      )}

      <div style={{ color: LIGHT, fontSize: 24, marginTop: 40, fontWeight: 400, opacity: 0.7 }}>Swipe to learn more</div>

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={LIGHT} />
    </div>
  );
}

export function GradientContent({ headline, bodyText, slideNumber, totalSlides, account, theme }: ContentSlideProps) {
  const dark = darken(theme.accentColor);

  return (
    <div style={{ width: 1080, height: 1080, background: `radial-gradient(circle at 70% 60%, ${dark} 0%, #080810 100%)`, display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, position: "relative" }}>
      <DecoCircle size={180} color={theme.accentColor} opacity={0.06} bottom={60} right={40} />

      <NumberedMarker number={slideNumber} color={theme.accentColor} />

      <div style={{ color: WHITE, fontSize: 44, fontWeight: 700, marginBottom: 24, lineHeight: 1.3, maxWidth: 800 }}>
        {headline}
      </div>
      <div style={{ color: LIGHT, fontSize: 28, lineHeight: 1.8, fontWeight: 400, maxWidth: 800 }}>
        {bodyText}
      </div>

      <LogoBar account={account} color={WHITE} />
      <SlideCounter current={slideNumber} total={totalSlides} color={LIGHT} />
    </div>
  );
}

export function GradientCta({ headline, ctaText, account, theme, slideNumber, totalSlides }: CtaSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: theme.accentColor, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 80, position: "relative" }}>
      <DecoCircle size={400} color="#ffffff" opacity={0.08} top={-100} right={-80} />

      <div style={{ color: "#0a0e1a", fontSize: 50, fontWeight: 700, textAlign: "center", lineHeight: 1.3, marginBottom: 30, maxWidth: 800 }}>
        {headline}
      </div>
      <div style={{ color: "#0a0e1a", fontSize: 32, fontWeight: 400, textAlign: "center", opacity: 0.8 }}>
        {ctaText}
      </div>

      <LogoBar account={account} color="#0a0e1a" />
      <SlideCounter current={slideNumber} total={totalSlides} color="rgba(10,14,26,0.5)" />
    </div>
  );
}
