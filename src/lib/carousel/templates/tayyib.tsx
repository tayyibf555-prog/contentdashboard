import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { getPaperTexture } from "../noise";

/**
 * Tayyib personal template — 4:5 (1080x1350) carousel.
 * User-uploaded background (grayscale/dim/contrast treated upstream by sharp).
 * Accent: lime green #C5F04A. Eyebrow: Permanent Marker. Hero: Playfair Italic 900.
 */

const W = 1080;
const H = 1350;
const ACCENT = "#C5F04A";
const WHITE = "#FFFFFF";
const MARKER = "Permanent Marker";
const SERIF = "Playfair Display";
const SANS = "Plus Jakarta Sans";

function BackgroundImage({ base64 }: { base64: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`data:image/png;base64,${base64}`}
      alt=""
      width={W}
      height={H}
      style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }}
    />
  );
}

function GradientOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: H,
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.55) 100%)",
      }}
    />
  );
}

function GrainOverlay() {
  const base64 = getPaperTexture();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`data:image/png;base64,${base64}`}
      alt=""
      width={W}
      height={H}
      style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover", opacity: 0.08 }}
    />
  );
}

function SolidFallback() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, background: "#0B0F14" }} />
  );
}

function PageCounter({ current, total }: { current: number; total: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        right: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 20,
        background: "rgba(0,0,0,0.45)",
      }}
    >
      <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 500, color: WHITE }}>
        {current}/{total}
      </span>
    </div>
  );
}

function Byline() {
  return (
    <div style={{ position: "absolute", bottom: 50, left: 60, display: "flex", alignItems: "center" }}>
      <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 600, color: ACCENT }}>by @tayyib.ai</span>
    </div>
  );
}

function SwipeArrow() {
  return (
    <div style={{ position: "absolute", bottom: 46, right: 60, display: "flex", alignItems: "center" }}>
      <span style={{ fontFamily: SANS, fontSize: 40, fontWeight: 700, color: ACCENT, lineHeight: 1 }}>→</span>
    </div>
  );
}

// ─── COVER ──────────────────────────────────────────────────────────────────

export function TayyibCover({ headline, accentWord, subtitle, slideNumber, totalSlides, backgroundImage }: CoverSlideProps) {
  const eyebrow = (headline || "").toUpperCase();
  const hero = accentWord || "";
  const sub = subtitle || "";

  // Adjust hero font size based on length so it fits the canvas
  let heroSize = 200;
  if (hero.length > 8) heroSize = 160;
  if (hero.length > 12) heroSize = 130;
  if (hero.length > 16) heroSize = 100;

  return (
    <div style={{ width: W, height: H, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {backgroundImage ? <BackgroundImage base64={backgroundImage} /> : <SolidFallback />}
      <GradientOverlay />
      <GrainOverlay />

      <PageCounter current={slideNumber} total={totalSlides} />

      {/* Eyebrow */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: MARKER,
            fontWeight: 400,
            fontSize: 42,
            color: WHITE,
            letterSpacing: 1,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {eyebrow}
        </span>
      </div>

      {/* Hero title */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: SERIF,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: heroSize,
            color: ACCENT,
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {hero}
        </span>
      </div>

      {/* Subhead */}
      {sub && (
        <div
          style={{
            position: "absolute",
            top: 760,
            left: 60,
            display: "flex",
            maxWidth: 620,
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 48,
              color: ACCENT,
              lineHeight: 1.2,
            }}
          >
            {sub}
          </span>
        </div>
      )}

      <Byline />
      <SwipeArrow />
    </div>
  );
}

// ─── CONTENT ────────────────────────────────────────────────────────────────

export function TayyibContent({ headline, bodyText, slideNumber, totalSlides, backgroundImage }: ContentSlideProps) {
  return (
    <div style={{ width: W, height: H, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {backgroundImage ? <BackgroundImage base64={backgroundImage} /> : <SolidFallback />}
      <GradientOverlay />
      <GrainOverlay />

      <PageCounter current={slideNumber} total={totalSlides} />

      {/* Headline — italic serif accent, positioned upper-left */}
      <div style={{ position: "absolute", top: 160, left: 60, right: 60, display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: SERIF,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 84,
            color: ACCENT,
            lineHeight: 1.05,
            maxWidth: 960,
          }}
        >
          {headline || ""}
        </span>
      </div>

      {/* Body — sans, white */}
      <div style={{ position: "absolute", top: 520, left: 60, right: 60, display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 40,
            color: WHITE,
            lineHeight: 1.4,
            maxWidth: 960,
          }}
        >
          {bodyText || ""}
        </span>
      </div>

      <Byline />
      <SwipeArrow />
    </div>
  );
}

// ─── CTA ────────────────────────────────────────────────────────────────────

export function TayyibCta({ headline, ctaText, slideNumber, totalSlides, backgroundImage }: CtaSlideProps) {
  const cta = ctaText || headline || "";

  return (
    <div style={{ width: W, height: H, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {backgroundImage ? <BackgroundImage base64={backgroundImage} /> : <SolidFallback />}
      <GradientOverlay />
      <GrainOverlay />

      <PageCounter current={slideNumber} total={totalSlides} />

      {/* Eyebrow */}
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <span
          style={{
            fontFamily: MARKER,
            fontWeight: 400,
            fontSize: 42,
            color: WHITE,
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          YOUR NEXT STEP
        </span>
      </div>

      {/* Big italic CTA */}
      <div style={{ position: "absolute", top: 460, left: 60, right: 60, display: "flex", justifyContent: "center" }}>
        <span
          style={{
            fontFamily: SERIF,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 110,
            color: ACCENT,
            lineHeight: 1.05,
            textAlign: "center",
            maxWidth: 960,
          }}
        >
          {cta}
        </span>
      </div>

      <Byline />
      <SwipeArrow />
    </div>
  );
}
