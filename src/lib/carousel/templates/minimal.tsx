import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { SlideCounter } from "./shared";

const BG = "#fafafa";
const DARK = "#111111";
const MUTED = "#666666";

export function MinimalCover({ headline, accentWord, subtitle, account, theme, slideNumber, totalSlides }: CoverSlideProps) {
  const logo = account === "business" ? "azen" : "tayyib.ai";
  const parts = headline.split(accentWord);

  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 100, position: "relative" }}>
      <div style={{ color: DARK, fontSize: 56, fontWeight: 700, textAlign: "center", lineHeight: 1.4, display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 860 }}>
        {parts[0]}
        <span style={{ color: DARK, borderBottom: `4px solid ${theme.accentColor}`, paddingBottom: 2 }}>{accentWord}</span>
        {parts[1] || ""}
      </div>

      {subtitle && (
        <div style={{ color: MUTED, fontSize: 26, fontWeight: 400, marginTop: 30 }}>{subtitle}</div>
      )}

      <div style={{ color: MUTED, fontSize: 22, marginTop: 50, fontWeight: 400 }}>Swipe to learn more</div>

      <div style={{ position: "absolute", bottom: 40, left: 100, display: "flex", alignItems: "center" }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: theme.accentColor, marginRight: 10 }} />
        <span style={{ color: DARK, fontSize: 24, fontWeight: 700 }}>{logo}</span>
      </div>
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function MinimalContent({ headline, bodyText, slideNumber, totalSlides, account, theme }: ContentSlideProps) {
  const logo = account === "business" ? "azen" : "tayyib.ai";

  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", padding: 100, position: "relative" }}>
      <div style={{ width: "100%", height: 4, background: theme.accentColor, position: "absolute", top: 0, left: 0 }} />

      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 18, background: theme.accentColor, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
          <span style={{ color: "#ffffff", fontSize: 18, fontWeight: 700 }}>{slideNumber}</span>
        </div>
        <div style={{ color: DARK, fontSize: 42, fontWeight: 700, lineHeight: 1.3 }}>{headline}</div>
      </div>

      <div style={{ color: "#444444", fontSize: 28, lineHeight: 1.8, fontWeight: 400, maxWidth: 800, paddingLeft: 52 }}>
        {bodyText}
      </div>

      <div style={{ position: "absolute", bottom: 40, left: 100, display: "flex", alignItems: "center" }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: theme.accentColor, marginRight: 10 }} />
        <span style={{ color: DARK, fontSize: 24, fontWeight: 700 }}>{logo}</span>
      </div>
      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function MinimalCta({ headline, ctaText, account, theme, slideNumber, totalSlides }: CtaSlideProps) {
  const logo = account === "business" ? "azen" : "tayyib.ai";

  return (
    <div style={{ width: 1080, height: 1080, background: theme.accentColor, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 100, position: "relative" }}>
      <div style={{ color: "#ffffff", fontSize: 50, fontWeight: 700, textAlign: "center", lineHeight: 1.3, marginBottom: 30, maxWidth: 800 }}>
        {headline}
      </div>
      <div style={{ color: "#ffffff", fontSize: 28, fontWeight: 400, textAlign: "center", opacity: 0.9 }}>
        {ctaText}
      </div>

      <div style={{ position: "absolute", bottom: 40, left: 100, display: "flex", alignItems: "center" }}>
        <span style={{ color: "#ffffff", fontSize: 24, fontWeight: 700 }}>{logo}</span>
      </div>
      <SlideCounter current={slideNumber} total={totalSlides} color="rgba(255,255,255,0.6)" />
    </div>
  );
}
