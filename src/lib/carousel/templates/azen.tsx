import React from "react";
import type { CoverSlideProps, ContentSlideProps, CtaSlideProps } from "../types";

/**
 * Azen business template — bold typography on dark background.
 * 1080x1350 portrait format.
 * Cover: two-line centered serif, line1 white + line2 accent.
 * Content: left-aligned body paragraph with keyword highlighting.
 * CTA: action word + accent keyword + split-color brand name.
 */

const BG = "#0A0E1A";
const PRIMARY = "#EEEAE4";
const ACCENT = "#00D4AA";

// Words that should never be highlighted
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

/**
 * Auto-detect 3-6 high-impact keywords from text.
 * Prioritises: brand names, technical terms, numbers, action verbs, key nouns.
 */
function autoDetectKeywords(text: string): string[] {
  const words = text.split(/\s+/);
  const scored: { word: string; score: number; index: number }[] = [];

  for (let i = 0; i < words.length; i++) {
    const raw = words[i];
    const clean = raw.replace(/[.,;:!?'"()\[\]{}]/g, "").toLowerCase();
    if (clean.length < 3 || SKIP_WORDS.has(clean)) continue;

    let score = 0;

    // Numbers and metrics get high priority
    if (/\d/.test(raw)) score += 5;
    // Capitalised words (likely proper nouns / brand names)
    if (/^[A-Z]/.test(raw) && i > 0) score += 4;
    // ALL CAPS (acronyms, brand names)
    if (/^[A-Z]{2,}$/.test(raw.replace(/[^A-Za-z]/g, ""))) score += 6;
    // Longer words tend to be more meaningful
    if (clean.length >= 6) score += 2;
    if (clean.length >= 8) score += 1;
    // Technical / business terms (heuristic: contains hyphen or camelCase)
    if (raw.includes("-") || /[a-z][A-Z]/.test(raw)) score += 3;
    // Action verbs (common high-impact ones)
    const actionVerbs = ["build", "create", "launch", "scale", "grow", "transform", "automate", "deploy", "implement", "optimize", "generate", "analyze", "deliver", "drive", "boost", "reduce", "increase", "save", "replace", "eliminate"];
    if (actionVerbs.includes(clean)) score += 3;

    if (score > 0) {
      scored.push({ word: raw.replace(/[.,;:!?]+$/, ""), score, index: i });
    }
  }

  // Sort by score descending, take top 3-6
  scored.sort((a, b) => b.score - a.score);
  const count = Math.min(Math.max(3, Math.floor(scored.length * 0.3)), 6);
  return scored.slice(0, count).map((s) => s.word);
}

/**
 * Render text with highlighted keywords — word-by-word with margin spacing.
 * Satori's flex model collapses whitespace between flex children, so we use
 * marginRight on each word-span to simulate natural word spacing.
 */
function renderHighlightedText(
  text: string,
  keywords: string[],
  accentColor: string,
  fontSize: number
): React.ReactNode[] {
  const keywordsLower = keywords.map((k) => k.toLowerCase());
  const words = text.split(/\s+/).filter(Boolean);
  // Space width ≈ 0.27em for DM Sans
  const spaceWidth = Math.round(fontSize * 0.27);

  return words.map((word, i) => {
    const stripped = word.replace(/[.,;:!?'"()\[\]{}]+$/, "");
    const isKeyword = keywordsLower.some(
      (kw) => stripped.toLowerCase() === kw
    );
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

/** Subtle "azen" watermark at bottom center */
function AzenWatermark() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "DM Sans",
          fontSize: 28,
          fontWeight: 600,
          color: PRIMARY,
          opacity: 0.4,
          letterSpacing: "0.05em",
        }}
      >
        azen
      </span>
    </div>
  );
}

/** Hand-drawn circle arrow flourish (SVG) */
function CircleArrowFlourish({ color }: { color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        width: 160,
        height: 80,
        marginTop: -10,
        marginLeft: -20,
      }}
    >
      <svg
        width="160"
        height="80"
        viewBox="0 0 160 80"
        fill="none"
      >
        <path
          d="M20 50 C20 20, 60 10, 90 15 C120 20, 145 35, 140 55 C135 70, 105 75, 80 65 C65 58, 55 48, 65 40"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M58 45 L65 40 L62 48"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

export function AzenCover({
  headline,
  accentWord,
  theme,
}: CoverSlideProps) {
  const accent = theme.accentColor || ACCENT;

  // Split headline into primary line and accent line
  // If accentWord is provided, use that as line2
  // Otherwise treat last word as the accent
  let line1 = headline;
  let line2 = accentWord || "";

  if (!line2 && headline) {
    const words = headline.trim().split(/\s+/);
    if (words.length > 1) {
      line2 = words.pop()!;
      line1 = words.join(" ");
    }
  }

  // Add period to line2 if it doesn't have punctuation
  if (line2 && !/[.!?]$/.test(line2)) {
    line2 = line2 + ".";
  }

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
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
      {/* Main text block */}
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
            fontFamily: "DM Serif Display",
            fontSize: 160,
            fontWeight: 400,
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
            fontFamily: "DM Serif Display",
            fontSize: 160,
            fontWeight: 400,
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

export function AzenContent({
  headline,
  bodyText,
  theme,
}: ContentSlideProps) {
  const accent = theme.accentColor || ACCENT;

  // Use bodyText as the main content. If bodyText is short/empty, fall back to headline + bodyText combined
  const displayText = bodyText || headline || "";
  const keywords = autoDetectKeywords(displayText);

  // Dynamic font size: shrink if text is long
  const charCount = displayText.length;
  let fontSize = 42;
  if (charCount > 300) fontSize = 38;
  if (charCount > 400) fontSize = 34;
  if (charCount > 500) fontSize = 32;

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        background: BG,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "120px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
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

export function AzenCta({
  headline,
  ctaText,
  theme,
}: CtaSlideProps) {
  const accent = theme.accentColor || ACCENT;

  // headline = action word (e.g. "Comment", "Follow")
  // ctaText = accent keyword (e.g. '"Skills"', '"AI"')
  const actionWord = headline || "Follow";
  let accentKeyword = ctaText || "";

  // Wrap in quotes if not already quoted
  if (accentKeyword && !accentKeyword.startsWith('"') && !accentKeyword.startsWith('\u201C')) {
    accentKeyword = `\u201C${accentKeyword}\u201D`;
  }

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
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
      {/* CTA text block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Action word */}
        <div
          style={{
            fontFamily: "DM Serif Display",
            fontSize: 140,
            fontWeight: 400,
            color: PRIMARY,
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {actionWord}
        </div>

        {/* Accent keyword */}
        <div
          style={{
            fontFamily: "DM Serif Display",
            fontSize: 150,
            fontWeight: 400,
            color: accent,
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {accentKeyword}
        </div>
      </div>

      {/* Brand name with split color + arrow */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 40,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", position: "relative" }}>
          <span
            style={{
              fontFamily: "DM Sans",
              fontSize: 60,
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: accent,
            }}
          >
            az
          </span>
          <span
            style={{
              fontFamily: "DM Sans",
              fontSize: 60,
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: PRIMARY,
            }}
          >
            en
          </span>
        </div>
        <CircleArrowFlourish color={accent} />
      </div>

      {/* No watermark on CTA — brand name is already featured */}
    </div>
  );
}
