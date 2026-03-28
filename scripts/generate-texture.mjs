/**
 * One-time script to generate a dark paper grain texture PNG for the Azen carousel template.
 * Uses only Node.js built-ins (no external deps).
 *
 * Run: node scripts/generate-texture.mjs
 * Output: public/textures/azen-dark-grain.png
 */

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WIDTH = 1080;
const HEIGHT = 1080;

// Base color: very dark charcoal (#1a1a1a = rgb(26,26,26))
const BASE_R = 26;
const BASE_G = 26;
const BASE_B = 26;

// Noise range: +/- this value per channel for subtle paper grain
const NOISE = 6;

function randomNoise() {
  return Math.floor(Math.random() * (NOISE * 2 + 1)) - NOISE;
}

function clamp(v) {
  return Math.max(0, Math.min(255, v));
}

// --- Build raw RGBA pixel rows with filter byte ---
// PNG row format: [filterByte=0, R, G, B, A, R, G, B, A, ...]
const rowLen = 1 + WIDTH * 4; // 1 filter byte + 4 bytes per pixel
const rawBuf = Buffer.alloc(rowLen * HEIGHT);

for (let y = 0; y < HEIGHT; y++) {
  const rowStart = y * rowLen;
  rawBuf[rowStart] = 0; // filter: None
  for (let x = 0; x < WIDTH; x++) {
    const offset = rowStart + 1 + x * 4;
    rawBuf[offset] = clamp(BASE_R + randomNoise());     // R
    rawBuf[offset + 1] = clamp(BASE_G + randomNoise()); // G
    rawBuf[offset + 2] = clamp(BASE_B + randomNoise()); // B
    rawBuf[offset + 3] = 255;                            // A (fully opaque)
  }
}

// --- PNG encoding ---
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// PNG signature
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// IHDR: width, height, bit depth 8, color type 6 (RGBA), compression 0, filter 0, interlace 0
const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(WIDTH, 0);
ihdrData.writeUInt32BE(HEIGHT, 4);
ihdrData[8] = 8;  // bit depth
ihdrData[9] = 6;  // color type: RGBA
ihdrData[10] = 0; // compression
ihdrData[11] = 0; // filter
ihdrData[12] = 0; // interlace

// IDAT: zlib-compressed pixel data
const compressed = deflateSync(rawBuf, { level: 9 });

// IEND
const iendData = Buffer.alloc(0);

const png = Buffer.concat([
  signature,
  pngChunk("IHDR", ihdrData),
  pngChunk("IDAT", compressed),
  pngChunk("IEND", iendData),
]);

const outDir = join(__dirname, "..", "public", "textures");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "azen-dark-grain.png");
writeFileSync(outPath, png);

console.log(`Generated: ${outPath} (${(png.length / 1024).toFixed(1)} KB)`);
