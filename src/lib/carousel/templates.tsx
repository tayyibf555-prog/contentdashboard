import React from "react";

const BRAND = {
  bg: "#0a1628",
  accent: "#00d4aa",
  white: "#ffffff",
  muted: "#8892b0",
  cardBg: "#0d1f3c",
};

export function CoverSlide({
  headline,
  accentWord,
  account,
}: {
  headline: string;
  accentWord: string;
  account: "business" | "personal";
}) {
  const logo = account === "business" ? "azen" : "tayyib.ai";
  const parts = headline.split(accentWord);

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: `linear-gradient(160deg, ${BRAND.bg} 0%, ${BRAND.cardBg} 50%, ${BRAND.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        position: "relative",
      }}
    >
      <div
        style={{
          color: BRAND.white,
          fontSize: 64,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.3,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {parts[0]}
        <span style={{ color: BRAND.accent }}>{accentWord}</span>
        {parts[1] || ""}
      </div>
      <div style={{ color: BRAND.muted, fontSize: 32, marginTop: 40 }}>
        Swipe to learn more
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ color: BRAND.white, fontSize: 28, fontWeight: 600 }}>
          {logo}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 30,
          color: BRAND.muted,
          fontSize: 24,
        }}
      >
        1/8
      </div>
    </div>
  );
}

export function ContentSlide({
  headline,
  bodyText,
  slideNumber,
  totalSlides,
  account,
}: {
  headline: string;
  bodyText: string;
  slideNumber: number;
  totalSlides: number;
  account: "business" | "personal";
}) {
  const logo = account === "business" ? "azen" : "tayyib.ai";

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: BRAND.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        position: "relative",
      }}
    >
      <div
        style={{
          color: BRAND.accent,
          fontSize: 48,
          fontWeight: 700,
          marginBottom: 30,
          lineHeight: 1.3,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          color: BRAND.white,
          fontSize: 32,
          lineHeight: 1.7,
        }}
      >
        {bodyText}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 80,
          color: BRAND.white,
          fontSize: 24,
          fontWeight: 600,
        }}
      >
        {logo}
      </div>
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 30,
          color: BRAND.muted,
          fontSize: 24,
        }}
      >
        {slideNumber}/{totalSlides}
      </div>
    </div>
  );
}

export function CtaSlide({
  headline,
  ctaText,
  account,
  totalSlides,
}: {
  headline: string;
  ctaText: string;
  account: "business" | "personal";
  totalSlides: number;
}) {
  const logo = account === "business" ? "azen" : "tayyib.ai";

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: `linear-gradient(160deg, ${BRAND.bg} 0%, ${BRAND.cardBg} 50%, ${BRAND.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        position: "relative",
      }}
    >
      <div
        style={{
          color: BRAND.white,
          fontSize: 52,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 40,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          color: BRAND.accent,
          fontSize: 36,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {ctaText}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ color: BRAND.white, fontSize: 28, fontWeight: 600 }}>
          {logo}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 30,
          color: BRAND.muted,
          fontSize: 24,
        }}
      >
        {totalSlides}/{totalSlides}
      </div>
    </div>
  );
}
