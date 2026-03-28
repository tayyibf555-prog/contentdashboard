import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { SlideCounter } from "./shared";

/**
 * Tayyib personal template — @itstylergermain style.
 * Dark bg, bold text, accent word with wavy brush-stroke underline.
 * Bottom bar: @tayyib.ai + save for later.
 */

const BG = "#111111";
const WHITE = "#f5f5f5";
const BODY = "#c8c8c8";
const MUTED = "#666666";

function WavyLine({ width, color }: { width: number; color: string }) {
  // Hand-drawn style wavy underline using SVG path
  const w = width;
  return (
    <svg width={w} height={24} viewBox={`0 0 ${w} 24`} style={{ marginTop: 4 }}>
      <path
        d={`M 5 16 C ${w * 0.12} 6, ${w * 0.25} 22, ${w * 0.4} 10 S ${w * 0.65} 20, ${w * 0.82} 8 C ${w * 0.9} 4, ${w * 0.95} 14, ${w - 5} 12`}
        stroke={color}
        fill="none"
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TayyibCover({ headline, accentWord, subtitle, slideNumber, totalSlides, theme }: CoverSlideProps) {
  const parts = headline.split(accentWord);

  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", padding: "80px 80px 60px", position: "relative" }}>
      {/* Headline — bold, accent word with wavy underline */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 60 }}>
        <div style={{ color: WHITE, fontSize: 82, fontWeight: 700, lineHeight: 1.15, display: "flex", flexWrap: "wrap", maxWidth: 920 }}>
          {parts[0]}
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: theme.accentColor }}>{accentWord}</span>
            <WavyLine width={Math.max(300, accentWord.length * 52)} color={theme.accentColor} />
          </span>
          {parts[1] || ""}
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ color: BODY, fontSize: 36, fontWeight: 400, marginTop: 50, lineHeight: 1.5, maxWidth: 800 }}>
          {subtitle}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom bar — handle left, save for later right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: WHITE, fontSize: 24, fontWeight: 700 }}>@tayyib.ai</span>
        <span style={{ color: MUTED, fontSize: 20, fontWeight: 400 }}>save for later</span>
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function TayyibContent({ headline, bodyText, slideNumber, totalSlides, theme }: ContentSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", padding: "80px 80px 60px", position: "relative" }}>
      {/* Headline with accent color */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
        <div style={{ color: theme.accentColor, fontSize: 52, fontWeight: 700, lineHeight: 1.2, maxWidth: 900 }}>
          {headline}
        </div>
        <WavyLine width={Math.min(500, Math.max(200, headline.length * 28))} color={theme.accentColor} />
      </div>

      {/* Body text */}
      <div style={{ color: BODY, fontSize: 34, lineHeight: 1.7, fontWeight: 400, marginTop: 50, maxWidth: 900 }}>
        {bodyText}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: WHITE, fontSize: 24, fontWeight: 700 }}>@tayyib.ai</span>
        <span style={{ color: MUTED, fontSize: 20, fontWeight: 400 }}>save for later</span>
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}

export function TayyibCta({ headline, ctaText, slideNumber, totalSlides, theme }: CtaSlideProps) {
  return (
    <div style={{ width: 1080, height: 1080, background: BG, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "80px 80px 60px", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 40 }}>
        <div style={{ color: WHITE, fontSize: 72, fontWeight: 700, textAlign: "center", lineHeight: 1.2, maxWidth: 850 }}>
          {headline}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ color: theme.accentColor, fontSize: 40, fontWeight: 700, textAlign: "center" }}>{ctaText}</span>
          <WavyLine width={Math.max(250, ctaText.length * 24)} color={theme.accentColor} />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <span style={{ color: WHITE, fontSize: 24, fontWeight: 700 }}>@tayyib.ai</span>
        <span style={{ color: MUTED, fontSize: 20, fontWeight: 400 }}>save for later</span>
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} color={MUTED} />
    </div>
  );
}
