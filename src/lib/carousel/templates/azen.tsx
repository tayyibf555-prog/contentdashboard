import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { getNoiseTexture } from "../noise";

/**
 * Azen business template — exact match to brand JSON spec.
 * 1080x1350 portrait, #0A0E1A background, subtle noise texture at 8% opacity.
 */

const BG = "#0A0E1A";
const PRIMARY = "#EEEAE4";
const ACCENT = "#5BC4F7";
const W = 1080;
const H = 1350;

// ─── Noise texture overlay ───────────────────────────────────────────────────

function NoiseOverlay() {
  const base64 = getNoiseTexture();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`data:image/png;base64,${base64}`}
      alt=""
      width={W}
      height={H}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: H,
        objectFit: "cover",
        opacity: 0.08,
      }}
    />
  );
}

// ─── Keyword detection + highlighting ────────────────────────────────────────

const SKIP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "it", "its",
  "this", "that", "these", "those", "i", "you", "he", "she", "we",
  "they", "me", "him", "her", "us", "them", "my", "your", "his",
  "our", "their", "not", "no", "so", "if", "then", "than", "as",
  "just", "also", "very", "too", "quite", "really", "about", "into",
]);

function autoDetectKeywords(text: string): string[] {
  const words = text.split(/\s+/);
  const scored: { word: string; score: number }[] = [];

  for (let i = 0; i < words.length; i++) {
    const raw = words[i];
    const clean = raw.replace(/[.,;:!?'"()\[\]{}]/g, "").toLowerCase();
    if (clean.length < 3 || SKIP_WORDS.has(clean)) continue;

    let score = 0;
    if (/\d/.test(raw)) score += 5;
    if (/^[A-Z]/.test(raw) && i > 0) score += 4;
    if (/^[A-Z]{2,}$/.test(raw.replace(/[^A-Za-z]/g, ""))) score += 6;
    if (clean.length >= 6) score += 2;
    if (clean.length >= 8) score += 1;
    if (raw.includes("-") || /[a-z][A-Z]/.test(raw)) score += 3;

    const actionVerbs = ["build", "create", "launch", "scale", "grow", "transform", "automate", "deploy", "implement", "optimize", "generate", "analyze", "deliver", "drive", "boost", "reduce", "increase", "save", "replace", "eliminate"];
    if (actionVerbs.includes(clean)) score += 3;

    if (score > 0) {
      scored.push({ word: raw.replace(/[.,;:!?]+$/, ""), score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const count = Math.min(Math.max(3, Math.floor(scored.length * 0.3)), 6);
  return scored.slice(0, count).map((s) => s.word);
}

function renderHighlightedText(
  text: string,
  keywords: string[],
  accentColor: string,
  fontSize: number
): React.ReactNode[] {
  const keywordsLower = keywords.map((k) => k.toLowerCase());
  const words = text.split(/\s+/).filter(Boolean);
  const spaceWidth = Math.round(fontSize * 0.27);

  return words.map((word, i) => {
    const stripped = word.replace(/[.,;:!?'"()\[\]{}]+$/, "");
    const isKeyword = keywordsLower.some((kw) => stripped.toLowerCase() === kw);
    const isLast = i === words.length - 1;

    return (
      <span
        key={i}
        style={{
          color: isKeyword ? accentColor : PRIMARY,
          fontWeight: isKeyword ? 600 : 400,
          marginRight: isLast ? 0 : spaceWidth,
        }}
      >
        {word}
      </span>
    );
  });
}

// ─── Watermark ───────────────────────────────────────────────────────────────

function AzenWatermark() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 50,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "Outfit",
          fontSize: 16,
          fontWeight: 400,
          color: PRIMARY,
          opacity: 0.35,
          letterSpacing: "0.05em",
        }}
      >
        azen
      </span>
    </div>
  );
}

// ─── COVER SLIDE ─────────────────────────────────────────────────────────────
// JSON: bold_typography_post — two centered serif lines, line1 white, line2 accent

export function AzenCover({
  headline,
  accentWord,
  theme,
}: CoverSlideProps) {
  const accent = ACCENT;

  let line1 = headline;
  let line2 = accentWord || "";

  if (!line2 && headline) {
    const words = headline.trim().split(/\s+/);
    if (words.length > 1) {
      line2 = words.pop()!;
      line1 = words.join(" ");
    }
  }

  return (
    <div
      style={{
        width: W,
        height: H,
        background: BG,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <NoiseOverlay />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: "Playfair Display",
            fontSize: 180,
            fontWeight: 900,
            color: PRIMARY,
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {line1}
        </div>
        <div
          style={{
            fontFamily: "Playfair Display",
            fontSize: 180,
            fontWeight: 900,
            color: accent,
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {line2}
        </div>
      </div>

      <AzenWatermark />
    </div>
  );
}

// ─── CONTENT SLIDE ───────────────────────────────────────────────────────────
// JSON: body_text_slide — left-aligned paragraph with keyword highlighting

export function AzenContent({
  headline,
  bodyText,
  theme,
}: ContentSlideProps) {
  const accent = ACCENT;

  const displayText = bodyText || headline || "";
  const keywords = autoDetectKeywords(displayText);

  // overflow: shrink_font — min 32px per JSON spec
  const charCount = displayText.length;
  let fontSize = 42;
  if (charCount > 250) fontSize = 40;
  if (charCount > 300) fontSize = 38;
  if (charCount > 350) fontSize = 36;
  if (charCount > 400) fontSize = 34;
  if (charCount > 500) fontSize = 32;

  return (
    <div
      style={{
        width: W,
        height: H,
        background: BG,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "120px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <NoiseOverlay />

      <div
        style={{
          fontFamily: "DM Sans",
          fontSize,
          fontWeight: 400,
          lineHeight: 1.55,
          color: PRIMARY,
          display: "flex",
          flexWrap: "wrap",
          maxWidth: 920,
        }}
      >
        {renderHighlightedText(displayText, keywords, accent, fontSize)}
      </div>

      <AzenWatermark />
    </div>
  );
}

// ─── CTA keyword detection ──────────────────────────────────────────────────

const CTA_PRIORITY_WORDS = new Set([
  "free", "now", "today", "audit", "call", "strategy", "start", "book",
  "claim", "unlock", "discover",
]);

const CTA_NEVER_HIGHLIGHT = new Set([
  "your", "a", "the", "at", "in", "on", "and", "or", "is", "to",
]);

function autoDetectCtaKeywords(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const scored: { word: string; score: number }[] = [];

  for (const word of words) {
    const clean = word.replace(/[.,;:!?'"()\[\]{}]+/g, "").toLowerCase();
    if (CTA_NEVER_HIGHLIGHT.has(clean)) continue;
    let score = 0;
    if (CTA_PRIORITY_WORDS.has(clean)) score += 10;
    if (clean.length >= 4) score += 1;
    if (score > 0) scored.push({ word: word.replace(/[.,;:!?]+$/, ""), score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 2).map((s) => s.word);
}

// ─── CTA SLIDE ───────────────────────────────────────────────────────────────
// JSON: cta_slide — single centered CTA sentence, 1-2 keywords in accent blue

export function AzenCta({
  headline,
  ctaText,
  theme,
}: CtaSlideProps) {
  const accent = ACCENT;

  // Build the CTA sentence from headline + ctaText
  const sentence = ctaText || headline || "Book your free audit now";
  const keywords = autoDetectCtaKeywords(sentence);
  const keywordsLower = keywords.map((k) => k.toLowerCase());

  const fontSize = 100;
  const spaceWidth = Math.round(fontSize * 0.27);
  const words = sentence.split(/\s+/).filter(Boolean);

  return (
    <div
      style={{
        width: W,
        height: H,
        background: BG,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <NoiseOverlay />

      <div
        style={{
          fontFamily: "Playfair Display",
          fontSize,
          fontWeight: 900,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          textAlign: "center",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 880,
        }}
      >
        {words.map((word, i) => {
          const stripped = word.replace(/[.,;:!?'"()\[\]{}]+$/, "");
          const isKeyword = keywordsLower.some((kw) => stripped.toLowerCase() === kw);
          const isLast = i === words.length - 1;

          return (
            <span
              key={i}
              style={{
                color: isKeyword ? accent : PRIMARY,
                marginRight: isLast ? 0 : spaceWidth,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      <AzenWatermark />
    </div>
  );
}
