/**
 * Quick test: generate tayyib cover, content, and CTA slides as PNGs.
 * Run: npx tsx scripts/test-tayyib.ts
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { writeFileSync, readFileSync, existsSync } from "fs";
import React from "react";
import { loadFonts } from "../src/lib/carousel/fonts";
import { TayyibCover, TayyibContent, TayyibCta } from "../src/lib/carousel/templates/tayyib";

const W = 1080;
const H = 1350;

async function getTestBackground(): Promise<string | null> {
  // If the user dropped a sample background at test-bg.jpg/png, use it; otherwise null.
  const candidates = ["test-bg.jpg", "test-bg.png", "test-bg.jpeg"];
  for (const c of candidates) {
    if (existsSync(c)) {
      const raw = readFileSync(c);
      const processed = await sharp(raw)
        .resize(W, H, { fit: "cover", position: "center" })
        .grayscale()
        .linear(1.1, -(0.1 * 128))
        .modulate({ brightness: 0.75 })
        .png()
        .toBuffer();
      return processed.toString("base64");
    }
  }
  return null;
}

async function main() {
  const fonts = await loadFonts();
  const theme = { variant: "tayyib" as const, accentColor: "#C5F04A", account: "personal" as const, pillar: "hottakes" };
  const bg = await getTestBackground();
  console.log(bg ? "Using test-bg.{jpg,png} as background" : "No test-bg found — using solid fallback");

  // Cover
  console.log("Tayyib cover");
  const coverEl = React.createElement(TayyibCover, {
    headline: "How to design a minimal",
    accentWord: "Carousel",
    subtitle: "Steal the exact designs\nI use for my posts.",
    account: "personal" as const, theme, slideNumber: 1, totalSlides: 8, backgroundImage: bg ?? undefined,
  });
  const coverSvg = await satori(coverEl, { width: W, height: H, fonts });
  writeFileSync("test-tayyib-cover.png", new Resvg(coverSvg, { fitTo: { mode: "width", value: W } }).render().asPng());
  console.log("  -> Saved test-tayyib-cover.png");

  // Content
  console.log("Tayyib content");
  const contentEl = React.createElement(TayyibContent, {
    headline: "Start with contrast",
    bodyText: "Dark images + bright accent text = instant hierarchy. Don't overthink the palette; one accent does the work.",
    account: "personal" as const, theme, slideNumber: 3, totalSlides: 8, backgroundImage: bg ?? undefined,
  });
  const contentSvg = await satori(contentEl, { width: W, height: H, fonts });
  writeFileSync("test-tayyib-content.png", new Resvg(contentSvg, { fitTo: { mode: "width", value: W } }).render().asPng());
  console.log("  -> Saved test-tayyib-content.png");

  // CTA
  console.log("Tayyib CTA");
  const ctaEl = React.createElement(TayyibCta, {
    headline: "Ready to ship better posts?",
    ctaText: "Steal my templates.",
    account: "personal" as const, theme, slideNumber: 8, totalSlides: 8, backgroundImage: bg ?? undefined,
  });
  const ctaSvg = await satori(ctaEl, { width: W, height: H, fonts });
  writeFileSync("test-tayyib-cta.png", new Resvg(ctaSvg, { fitTo: { mode: "width", value: W } }).render().asPng());
  console.log("  -> Saved test-tayyib-cta.png");
}

main().catch(console.error);
