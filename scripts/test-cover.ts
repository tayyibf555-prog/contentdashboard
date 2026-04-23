/**
 * Quick test: generate azen cover, content, and CTA slides as PNGs.
 * Run: npx tsx scripts/test-cover.ts
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "fs";
import React from "react";
import { loadFonts } from "../src/lib/carousel/fonts";
import { AzenCover, AzenContent, AzenCta } from "../src/lib/carousel/templates/azen";

async function main() {
  const fonts = await loadFonts();
  const theme = { variant: "azen" as const, accentColor: "#5BC4F7", account: "business" as const, pillar: "education" };

  // Cover slides
  const covers = [
    { line1: "Claude", line2: "skills." },
    { line1: "5 AI Systems", line2: "you need." },
    { line1: "Stop Guessing", line2: "start scaling." },
  ];

  for (let i = 0; i < covers.length; i++) {
    const { line1, line2 } = covers[i];
    console.log(`Cover ${i + 1}: "${line1}" / "${line2}"`);
    const el = React.createElement(AzenCover, {
      headline: line1, accentWord: line2,
      account: "business" as const, theme, slideNumber: 1, totalSlides: 8,
    });
    const svg = await satori(el, { width: 1080, height: 1350, fonts });
    const png = new Resvg(svg, { fitTo: { mode: "width", value: 1080 } }).render().asPng();
    writeFileSync(`test-cover-${i + 1}.png`, png);
    console.log(`  -> Saved test-cover-${i + 1}.png`);
  }

  // Content slide
  console.log("Content slide");
  const contentEl = React.createElement(AzenContent, {
    headline: "AI Automation",
    bodyText: "Most businesses waste 40% of their team's time on repetitive tasks that AI can handle in seconds. From customer support to data entry, the opportunity cost of not automating is massive.",
    account: "business" as const, theme, slideNumber: 3, totalSlides: 8,
  });
  const contentSvg = await satori(contentEl, { width: 1080, height: 1350, fonts });
  const contentPng = new Resvg(contentSvg, { fitTo: { mode: "width", value: 1080 } }).render().asPng();
  writeFileSync("test-content.png", contentPng);
  console.log("  -> Saved test-content.png");

  // CTA slide
  console.log("CTA slide");
  const ctaEl = React.createElement(AzenCta, {
    headline: "Get Started",
    ctaText: "Book your free AI audit today",
    account: "business" as const, theme, slideNumber: 8, totalSlides: 8,
  });
  const ctaSvg = await satori(ctaEl, { width: 1080, height: 1350, fonts });
  const ctaPng = new Resvg(ctaSvg, { fitTo: { mode: "width", value: 1080 } }).render().asPng();
  writeFileSync("test-cta.png", ctaPng);
  console.log("  -> Saved test-cta.png");
}

main().catch(console.error);
