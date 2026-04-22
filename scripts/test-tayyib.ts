/**
 * Quick test: generate tayyib cover, content, and CTA slides as PNGs.
 * Run: npx tsx scripts/test-tayyib.ts
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "fs";
import React from "react";
import { loadFonts } from "../src/lib/carousel/fonts";
import { TayyibCover, TayyibContent, TayyibCta } from "../src/lib/carousel/templates/tayyib";

async function main() {
  const fonts = await loadFonts();
  const theme = { variant: "tayyib" as const, accentColor: "#22D3EE", account: "personal" as const, pillar: "hottakes" };

  // Cover
  console.log("Tayyib cover");
  const coverEl = React.createElement(TayyibCover, {
    headline: "Most founders fail at AI adoption",
    accentWord: "fail",
    subtitle: "Here's what actually works when you stop chasing hype.",
    account: "personal" as const, theme, slideNumber: 1, totalSlides: 8,
  });
  const coverSvg = await satori(coverEl, { width: 1080, height: 1080, fonts });
  writeFileSync("test-tayyib-cover.png", new Resvg(coverSvg, { fitTo: { mode: "width", value: 1080 } }).render().asPng());
  console.log("  -> Saved test-tayyib-cover.png");

  // Content
  console.log("Tayyib content");
  const contentEl = React.createElement(TayyibContent, {
    headline: "Stop building features nobody uses",
    bodyText: "The best AI tools solve real workflow problems. Talk to 10 customers before you write a single line of code.",
    account: "personal" as const, theme, slideNumber: 3, totalSlides: 8,
  });
  const contentSvg = await satori(contentEl, { width: 1080, height: 1080, fonts });
  writeFileSync("test-tayyib-content.png", new Resvg(contentSvg, { fitTo: { mode: "width", value: 1080 } }).render().asPng());
  console.log("  -> Saved test-tayyib-content.png");

  // CTA
  console.log("Tayyib CTA");
  const ctaEl = React.createElement(TayyibCta, {
    headline: "Ready to build AI that works?",
    ctaText: "DM me 'AUDIT'",
    account: "personal" as const, theme, slideNumber: 8, totalSlides: 8,
  });
  const ctaSvg = await satori(ctaEl, { width: 1080, height: 1080, fonts });
  writeFileSync("test-tayyib-cta.png", new Resvg(ctaSvg, { fitTo: { mode: "width", value: 1080 } }).render().asPng());
  console.log("  -> Saved test-tayyib-cta.png");
}

main().catch(console.error);
