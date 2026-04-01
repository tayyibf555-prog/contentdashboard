import { deflateSync } from "zlib";

/**
 * Dark felt/fabric texture for the azen template.
 * Generates short fiber-like strokes over a subtle base — mimics dark felt material.
 * Tile is 360x450, Satori stretches 3x for visible fiber grain.
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

export function getPaperTexture(): string {
  if (cachedTexture) return cachedTexture;

  const width = 360;
  const height = 450; // 4:5 aspect ratio — Satori stretches 3x

  const rand = createRng(42);

  // --- Felt/fabric texture: fiber strokes over subtle base ---

  // Base: subtle low-contrast variation
  const pixels = new Uint8Array(width * height);
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = 105 + Math.floor(rand() * 25); // 105-129
  }

  // Short fiber marks — creates the organic felt/fabric texture
  const numFibers = 75000;
  for (let f = 0; f < numFibers; f++) {
    const x = Math.floor(rand() * width);
    const y = Math.floor(rand() * height);
    const angle = rand() * Math.PI * 2;
    const len = 1 + Math.floor(rand() * 4); // 1-4 pixels long

    // Mix of lighter and darker fibers
    const val = rand() > 0.4
      ? 145 + Math.floor(rand() * 65) // lighter fibers (60%)
      : 50 + Math.floor(rand() * 45);  // darker fibers (40%)

    for (let s = 0; s <= len; s++) {
      const px = Math.round(x + Math.cos(angle) * s);
      const py = Math.round(y + Math.sin(angle) * s);
      if (px >= 0 && px < width && py >= 0 && py < height) {
        const idx = py * width + px;
        pixels[idx] = Math.round(pixels[idx] * 0.35 + val * 0.65);
      }
    }
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
