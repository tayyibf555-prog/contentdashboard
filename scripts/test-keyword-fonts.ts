/**
 * Render the cover slide with two alternative keyword fonts side by side.
 *   npx tsx scripts/test-keyword-fonts.ts
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import React from "react";
import { loadFonts } from "../src/lib/carousel/fonts";
import { getGrainTiles } from "../src/lib/carousel/grain";

const W = 1080;
const H = 1350;
const ACCENT = "#3B82F6";

function loadExtraFont(filename: string) {
  const buf = readFileSync(path.join(process.cwd(), "public", "fonts", filename));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function CoverWithFont({ fontName }: { fontName: string }) {
  const { coarse, fine } = getGrainTiles();
  return React.createElement(
    "div",
    { style: { width: W, height: H, display: "flex", position: "relative", overflow: "hidden" } },
    // base
    React.createElement("div", { style: { position: "absolute", top: 0, left: 0, width: W, height: H, background: "#000" } }),
    // gradient glow
    React.createElement("div", {
      style: {
        position: "absolute", top: 0, left: 0, width: W, height: H,
        background: "radial-gradient(ellipse 150% 120% at 105% -10%, #3B82F6 0%, #2458E0 14%, #1C3FBC 26%, #152A8F 40%, #0C1957 55%, rgba(6,10,40,0.7) 70%, transparent 92%)",
      },
    }),
    // vignette bottom-left
    React.createElement("div", {
      style: {
        position: "absolute", top: 0, left: 0, width: W, height: H,
        background: "radial-gradient(ellipse 90% 80% at 10% 110%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.25) 55%, transparent 80%)",
      },
    }),
    // grain
    React.createElement("img", { src: `data:image/png;base64,${coarse}`, width: W, height: H, style: { position: "absolute", top: 0, left: 0, width: W, height: H, opacity: 0.08 } }),
    React.createElement("img", { src: `data:image/png;base64,${fine}`, width: W, height: H, style: { position: "absolute", top: 0, left: 0, width: W, height: H, opacity: 0.04 } }),
    // content
    React.createElement(
      "div",
      {
        style: {
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "0 86px",
        },
      },
      // font name tag (top)
      React.createElement("span", {
        style: {
          position: "absolute", top: 40, left: 0, right: 0,
          textAlign: "center", color: "rgba(255,255,255,0.5)",
          fontFamily: "Outfit", fontSize: 22, letterSpacing: "0.2em", textTransform: "uppercase",
        },
      }, fontName),
      // title
      React.createElement(
        "span",
        { style: { fontFamily: "Outfit", fontWeight: 500, fontSize: 88, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.05, textAlign: "center", whiteSpace: "pre-line" } },
        "How to use AI\nto save"
      ),
      // keyword — italic in the chosen font
      React.createElement(
        "span",
        { style: { fontFamily: fontName, fontWeight: 600, fontStyle: "italic", fontSize: 80, color: ACCENT, letterSpacing: "-0.01em", lineHeight: 1.05, marginTop: 16, textAlign: "center" } },
        "10 hours a week"
      )
    )
  );
}

async function render(fontName: string, extraFontFile: string, extraWeight: 400 | 600, outName: string) {
  const baseFonts = await loadFonts();
  const extraFontData = loadExtraFont(extraFontFile);
  const fonts = [
    ...baseFonts,
    { name: fontName as "Instrument Serif", data: extraFontData, weight: extraWeight, style: "italic" as const },
  ];
  const svg = await satori(CoverWithFont({ fontName }), { width: W, height: H, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
  writeFileSync(outName, png);
  console.log(`  -> ${outName}`);
}

async function main() {
  console.log("Rendering keyword-font previews…");
  await render("Instrument Serif", "InstrumentSerif-Italic.ttf", 400, "test-font-instrument-serif.png");
  await render("Fraunces", "Fraunces-SemiBoldItalic.ttf", 600, "test-font-fraunces.png");
  console.log("\nAlso showing current Playfair 600 italic for comparison:");
  await render("Playfair Display", "PlayfairDisplay-SemiBoldItalic.ttf", 600, "test-font-playfair.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
