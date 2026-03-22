import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "fs/promises";
import path from "path";
import { CoverSlide, ContentSlide, CtaSlide } from "./templates";
import React from "react";

let fontData: Buffer | null = null;

async function loadFont() {
  if (fontData) return fontData;
  const fontPath = path.join(process.cwd(), "public", "fonts", "Inter-Bold.woff");
  fontData = await readFile(fontPath);
  return fontData;
}

export async function generateSlideImage(
  slideType: "cover" | "content" | "cta",
  props: Record<string, unknown>
): Promise<Buffer> {
  const font = await loadFont();

  let element: React.ReactElement;

  switch (slideType) {
    case "cover":
      element = React.createElement(CoverSlide, props as any);
      break;
    case "content":
      element = React.createElement(ContentSlide, props as any);
      break;
    case "cta":
      element = React.createElement(CtaSlide, props as any);
      break;
  }

  const svg = await satori(element, {
    width: 1080,
    height: 1080,
    fonts: [
      {
        name: "Inter",
        data: font,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1080 },
  });

  return Buffer.from(resvg.render().asPng());
}
