import type { TemplateVariant } from "./types";

const VARIANT_STYLES: Record<TemplateVariant, { base: string; cover: string; content: string; cta: string }> = {
  azen: {
    base: "Dark charcoal abstract background, subtle grain noise texture, moody professional atmosphere, very dark gray tones, minimal and clean",
    cover: "slightly dramatic lighting, faint directional light from top left, dark vignette edges",
    content: "very subtle and muted, text-friendly, minimal visual noise, almost solid dark with faint texture",
    cta: "slightly warmer undertone, subtle warmth in the darkness, inviting mood",
  },
  tayyib: {
    base: "Dark moody abstract background, subtle organic brush stroke textures, warm undertones in deep blacks, artistic and creative feel",
    cover: "visible brush texture marks, slightly more dramatic, warm amber hint in shadows",
    content: "subdued organic texture, gentle and text-friendly, dark with faint warm brush marks",
    cta: "warm inviting dark background, subtle golden warmth, organic brush feel",
  },
  architect: {
    base: "Dark professional abstract background, subtle geometric line patterns, structured and corporate feel, deep navy and charcoal tones",
    cover: "faint architectural grid lines, subtle blueprint feel, professional depth",
    content: "very subtle geometric texture, minimal, dark structured background for text",
    cta: "structured with subtle accent light, professional and polished",
  },
  gradient: {
    base: "Dark abstract gradient background, smooth color transitions, soft bokeh light effects, rich and expressive",
    cover: "visible soft gradient shift, subtle bokeh orbs, atmospheric depth",
    content: "gentle gradient, subdued and text-friendly, soft dark tones",
    cta: "warm gradient shift, inviting atmospheric feel, soft light",
  },
  minimal: {
    base: "Near-black clean abstract background, extremely subtle texture, modern minimalist feel, almost solid dark",
    cover: "faintest hint of texture, clean and modern, barely visible grain",
    content: "virtually solid dark background with micro-texture, ultra clean",
    cta: "clean dark background with the softest hint of warmth",
  },
  bold: {
    base: "Dark high-contrast abstract background, dramatic shadows and highlights, bold geometric shapes in deep shadows, energetic",
    cover: "dramatic contrast, bold abstract shapes barely visible in the dark, powerful mood",
    content: "strong but subdued, dark with faint bold geometric elements",
    cta: "dramatic dark background, high energy feel, bold abstract elements",
  },
};

/**
 * Build a prompt for Gemini image generation based on template variant and slide type.
 * All backgrounds are designed to be dark enough for white text overlay.
 */
export function getBackgroundPrompt(
  variant: TemplateVariant,
  slideType: "cover" | "content" | "cta",
  accentColor?: string
): string {
  const style = VARIANT_STYLES[variant];
  const colorHint = accentColor ? `, with very subtle hints of ${accentColor} color in the shadows` : "";

  return `${style.base}, ${style[slideType]}${colorHint}. Square format, 1:1 aspect ratio. No text, no words, no letters, no numbers, no logos, no watermarks. Abstract background only.`;
}
