import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { loadFonts } from "./fonts";
import { getTemplate } from "./templates";
import { resolveTheme } from "./theme";
import { generateBackground } from "../gemini/client";
import { getBackgroundPrompt } from "./backgrounds";
import { hasStaticTexture, loadStaticTexture } from "./static-textures";
import type { TemplateVariant } from "./types";
import React from "react";

export async function generateSlideImage(
  slideType: "cover" | "content" | "cta",
  props: Record<string, unknown>,
  options?: {
    account?: "business" | "personal";
    pillar?: string;
    variant?: TemplateVariant;
    backgroundImage?: string | null;
  }
): Promise<Buffer> {
  const fonts = await loadFonts();

  const theme = resolveTheme(
    (options?.account || (props.account as string) || "business") as "business" | "personal",
    (options?.pillar || "education") as string,
    options?.variant
  );

  const Template = getTemplate(theme.variant, slideType);

  // Use pre-generated background if provided, otherwise generate one
  // Azen variant uses solid background — skip Gemini entirely
  let backgroundImage: string | null = options?.backgroundImage ?? null;
  if (theme.variant === "azen") {
    backgroundImage = null;
  } else if (!backgroundImage && hasStaticTexture(theme.variant)) {
    // Static texture — skip Gemini entirely (faster, consistent, free)
    console.log(`[Static] Loading texture for ${theme.variant}/${slideType}`);
    backgroundImage = await loadStaticTexture(theme.variant);
  } else if (!backgroundImage && process.env.GEMINI_API_KEY) {
    try {
      const prompt = getBackgroundPrompt(theme.variant, slideType, theme.accentColor);
      console.log(`[Gemini] Generating background for ${theme.variant}/${slideType}...`);
      backgroundImage = await generateBackground(prompt);
      console.log(`[Gemini] Background result: ${backgroundImage ? `${backgroundImage.length} chars` : "null"}`);
    } catch (err) {
      console.error("[Gemini] Background generation failed, using solid fallback:", err);
    }
  }

  // Ensure all string props have defaults — Satori crashes on undefined text nodes
  const safeProps = {
    ...props,
    headline: props.headline || "",
    bodyText: props.bodyText || "",
    accentWord: props.accentWord || "",
    ctaText: props.ctaText || "",
    subtitle: props.subtitle || "",
    slideNumber: props.slideNumber ?? 1,
    totalSlides: props.totalSlides ?? 1,
    theme,
    backgroundImage,
  };

  const element = React.createElement(Template, safeProps);

  // Azen uses 1080x1350 portrait; all other templates use 1080x1080 square
  const height = theme.variant === "azen" ? 1350 : 1080;

  const svg = await satori(element, {
    width: 1080,
    height,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1080 },
  });

  return Buffer.from(resvg.render().asPng());
}

/**
 * Pre-generate all AI backgrounds for a set of slides in sequence.
 * Returns a map of slideType -> base64 image.
 * Running sequentially avoids Gemini rate limits.
 */
export async function generateBackgrounds(
  variant: TemplateVariant,
  slideTypes: ("cover" | "content" | "cta")[],
  accentColor?: string
): Promise<Map<number, string | null>> {
  const results = new Map<number, string | null>();

  // Azen variant uses solid color background — no Gemini needed
  if (variant === "azen") {
    console.log("[Azen] Solid background, skipping Gemini");
    return results;
  }

  // Static texture variants skip Gemini entirely
  if (hasStaticTexture(variant)) {
    console.log(`[Static] Using static texture for all ${variant} slides`);
    const texture = await loadStaticTexture(variant);
    for (let i = 0; i < slideTypes.length; i++) {
      results.set(i, texture);
    }
    return results;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log("[Gemini] No API key, skipping background generation");
    return results;
  }

  // Deduplicate: generate one background per slideType, reuse for same types
  const typeCache = new Map<string, string | null>();

  for (let i = 0; i < slideTypes.length; i++) {
    const slideType = slideTypes[i];

    // Reuse one background per slide type (3 Gemini calls max, not 8)
    const cacheKey = slideType;

    if (typeCache.has(cacheKey)) {
      results.set(i, typeCache.get(cacheKey)!);
      continue;
    }

    try {
      const prompt = getBackgroundPrompt(variant, slideType, accentColor);
      console.log(`[Gemini] Generating background ${i + 1}/${slideTypes.length} (${slideType})...`);
      const bg = await generateBackground(prompt);
      console.log(`[Gemini] Background ${i + 1}: ${bg ? `${bg.length} chars` : "null (failed)"}`);
      typeCache.set(cacheKey, bg);
      results.set(i, bg);
    } catch (err) {
      console.error(`[Gemini] Background ${i + 1} failed:`, err);
      results.set(i, null);
    }
  }

  return results;
}
