import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { loadFonts } from "./fonts";
import { getTemplate } from "./templates";
import { resolveTheme } from "./theme";
import { generateBackground } from "../gemini/client";
import { getBackgroundPrompt } from "./backgrounds";
import type { TemplateVariant } from "./types";
import React from "react";

export async function generateSlideImage(
  slideType: "cover" | "content" | "cta",
  props: Record<string, unknown>,
  options?: {
    account?: "business" | "personal";
    pillar?: string;
    variant?: TemplateVariant;
  }
): Promise<Buffer> {
  const fonts = await loadFonts();

  const theme = resolveTheme(
    (options?.account || (props.account as string) || "business") as "business" | "personal",
    (options?.pillar || "education") as string,
    options?.variant
  );

  const Template = getTemplate(theme.variant, slideType);

  // Generate AI background — falls back to solid color templates if Gemini fails
  let backgroundImage: string | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = getBackgroundPrompt(theme.variant, slideType, theme.accentColor);
      backgroundImage = await generateBackground(prompt);
    } catch (err) {
      console.error("Background generation failed, using solid fallback:", err);
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

  const svg = await satori(element, {
    width: 1080,
    height: 1080,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1080 },
  });

  return Buffer.from(resvg.render().asPng());
}
