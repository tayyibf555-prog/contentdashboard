import { deflateSync } from "zlib";

/**
 * Dual-layer paper grain texture for the azen template.
 * Combines coarse mottled patches + fine grain into a single PNG tile.
 * Coarse: generated at 1/4 resolution, upscaled — creates organic paper feel.
 * Fine: full resolution noise — adds fine grain on top.
 * Blended together into one grayscale image, rendered at ~15% opacity.
 */

// CRC-32 lookup table
const CRC_TABLE: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, checksum]);
}

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

let cachedTexture: string | null = null;

/**
 * Combined paper grain texture — single PNG with both coarse + fine layers blended.
 * Small tile (120x150) that gets stretched to fill the canvas.
 */
export function getPaperTexture(): string {
  if (cachedTexture) return cachedTexture;

  const width = 120;
  const height = 150; // 4:5 aspect ratio

  // --- Layer 1: Coarse mottled patches ---
  // Generate at 1/4 size and bilinear upscale
  const smallW = 30;
  const smallH = 38;
  const rand1 = createRng(42);
  const small = new Uint8Array(smallW * smallH);
  for (let i = 0; i < small.length; i++) {
    small[i] = Math.floor(rand1() * 256);
  }

  const coarse = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const srcY = (y / height) * (smallH - 1);
    const y0 = Math.floor(srcY);
    const y1 = Math.min(y0 + 1, smallH - 1);
    const fy = srcY - y0;
    for (let x = 0; x < width; x++) {
      const srcX = (x / width) * (smallW - 1);
      const x0 = Math.floor(srcX);
      const x1 = Math.min(x0 + 1, smallW - 1);
      const fx = srcX - x0;
      coarse[y * width + x] = Math.round(
        small[y0 * smallW + x0] * (1 - fx) * (1 - fy) +
        small[y0 * smallW + x1] * fx * (1 - fy) +
        small[y1 * smallW + x0] * (1 - fx) * fy +
        small[y1 * smallW + x1] * fx * fy
      );
    }
  }

  // --- Layer 2: Fine grain ---
  const rand2 = createRng(1337);
  const fine = new Uint8Array(width * height);
  for (let i = 0; i < fine.length; i++) {
    fine[i] = Math.floor(rand2() * 220) + 18;
  }

  // --- Blend: coarse (70%) + fine (30%) ---
  const pixels = new Uint8Array(width * height);
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = Math.round(coarse[i] * 0.7 + fine[i] * 0.3);
  }

  // Encode as PNG
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 0; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const rowSize = 1 + width;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0;
    for (let x = 0; x < width; x++) {
      raw[y * rowSize + 1 + x] = pixels[y * width + x];
    }
  }

  const compressed = deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);

  cachedTexture = png.toString("base64");
  return cachedTexture;
}
