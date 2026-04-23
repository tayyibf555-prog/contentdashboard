/**
 * One-shot: render the two feTurbulence grain tiles the Tayyib JSON spec
 * calls for, save them as PNGs under public/grain/. The tayyib template then
 * loads + embeds them at render time — this lets resvg treat the grain as
 * raster data instead of trying (and failing) to evaluate the SVG filter at
 * render-time.
 *
 *   npx tsx scripts/generate-grain-tiles.ts
 */
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const W = 1080;
const H = 1350;

function grainSvg(baseFrequency: number, numOctaves: number) {
  // Pure-white noise on transparent. Per-slide compositing will control tint
  // + opacity. stitchTiles='stitch' avoids edge seams if we ever tile.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <filter id="n" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="${numOctaves}" stitchTiles="stitch" seed="2"/>
      <feColorMatrix values="0 0 0 0 1
                              0 0 0 0 1
                              0 0 0 0 1
                              0 0 0 1 0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#n)"/>
  </svg>`;
}

function render(svg: string, outPath: string) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: W } });
  const png = resvg.render().asPng();
  writeFileSync(outPath, png);
}

function main() {
  const outDir = path.join(process.cwd(), "public", "grain");
  mkdirSync(outDir, { recursive: true });

  console.log("Rendering coarse grain (baseFreq 1.2, 4 octaves)…");
  render(grainSvg(1.2, 4), path.join(outDir, "grain-coarse.png"));
  console.log("  -> public/grain/grain-coarse.png");

  console.log("Rendering fine grain (baseFreq 2.5, 2 octaves)…");
  render(grainSvg(2.5, 2), path.join(outDir, "grain-fine.png"));
  console.log("  -> public/grain/grain-fine.png");

  console.log("\nDone.");
}

main();
