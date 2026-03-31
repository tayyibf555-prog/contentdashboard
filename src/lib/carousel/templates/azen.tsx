import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";
import { getPaperTexture } from "../noise";

/**
 * Azen business template — Plus Jakarta Sans geometric sans-serif.
 * 1080x1350 portrait, #0A0E1A background, dual-layer paper grain texture.
 */

const BG = "#0A0E1A";
const PRIMARY = "#EEEAE4";
const ACCENT = "#5BC4F7";
const W = 1080;
const H = 1350;
const FONT = "Plus Jakarta Sans";

// ─── Dual-layer paper grain texture ─────────────────────────────────────────

function PaperGrain() {
  const base64 = getPaperTexture();
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
        opacity: 0.12,
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
// EXACTLY 2 text lines + 1 watermark. headline = line1 (white), accentWord = line2 (blue).
// Font size is calculated so the LONGER line fills ~85% of canvas width (920px usable).

function calcCoverFontSize(line1: string, line2: string): number {
  const maxWidth = 920; // 1080 - 2*80px padding
  const longer = line1.length >= line2.length ? line1 : line2;
  if (!longer) return 180;
  // Plus Jakarta Sans 800 avg char width ≈ 0.55 * fontSize
  const target = maxWidth * 0.85;
  const estimated = Math.floor(target / (longer.length * 0.55));
  return Math.min(220, Math.max(60, estimated));
}

export function AzenCover({
  headline,
  accentWord,
}: CoverSlideProps) {
  // headline = line1 (white), accentWord = line2 (blue). Render EXACTLY as provided.
  let line1 = headline || "";
  let line2 = accentWord || "";

  // Fallback only if no line2 provided — split headline roughly in half
  if (!line2 && line1) {
    const words = line1.trim().split(/\s+/);
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      line2 = words.slice(mid).join(" ");
      line1 = words.slice(0, mid).join(" ");
    }
  }

  const fontSize = calcCoverFontSize(line1, line2);

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
      <PaperGrain />

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
            fontFamily: FONT,
            fontSize,
            fontWeight: 800,
            color: PRIMARY,
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          {line1}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize,
            fontWeight: 800,
            color: ACCENT,
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
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

export function AzenContent({
  headline,
  bodyText,
}: ContentSlideProps) {
  const displayText = bodyText || headline || "";
  const keywords = autoDetectKeywords(displayText);
  const keywordsLower = keywords.map((k) => k.toLowerCase());

  // Shrink font for long text — min 32px per spec
  const charCount = displayText.length;
  let fontSize = 42;
  if (charCount > 250) fontSize = 40;
  if (charCount > 300) fontSize = 38;
  if (charCount > 350) fontSize = 36;
  if (charCount > 400) fontSize = 34;
  if (charCount > 500) fontSize = 32;

  const spaceWidth = Math.round(fontSize * 0.27);
  const words = displayText.split(/\s+/).filter(Boolean);

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
      <PaperGrain />

      <div
        style={{
          fontFamily: FONT,
          fontSize,
          fontWeight: 500,
          lineHeight: 1.55,
          color: PRIMARY,
          display: "flex",
          flexWrap: "wrap",
          maxWidth: 920,
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
                color: isKeyword ? ACCENT : PRIMARY,
                fontWeight: isKeyword ? 700 : 500,
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

// ─── CTA SLIDE ───────────────────────────────────────────────────────────────

export function AzenCta({
  headline,
  ctaText,
}: CtaSlideProps) {
  const sentence = ctaText || headline || "Book your free audit now";
  const keywords = autoDetectCtaKeywords(sentence);
  const keywordsLower = keywords.map((k) => k.toLowerCase());

  // Auto-size: shorter text = bigger font (80-140)
  const wordCount = sentence.split(/\s+/).length;
  let fontSize = 140;
  if (wordCount > 4) fontSize = 120;
  if (wordCount > 6) fontSize = 100;
  if (wordCount > 8) fontSize = 80;

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
        padding: "0 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <PaperGrain />

      <div
        style={{
          fontFamily: FONT,
          fontSize,
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          textAlign: "center",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 920,
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
                color: isKeyword ? ACCENT : PRIMARY,
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
