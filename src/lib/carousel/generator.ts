import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { loadFonts } from "./fonts";
import { getTemplate } from "./templates";
import { resolveTheme } from "./theme";
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

  const element = React.createElement(Template, {
    ...props,
    theme,
  });

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
