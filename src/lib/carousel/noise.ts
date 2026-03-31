import { deflateSync } from "zlib";

/**
 * Generate a subtle noise/grain texture as a base64-encoded PNG.
 * Returns a small tile that gets stretched to fill the canvas.
 * Rendered at low opacity (0.08) for the "textured dark background" feel.
 */

// CRC-32 lookup table for PNG chunk checksums
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

let cachedNoise: string | null = null;

export function getNoiseTexture(): string {
  if (cachedNoise) return cachedNoise;

  const width = 120;
  const height = 150; // 4:5 aspect ratio matching 1080:1350

  // IHDR chunk data
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 0;  // color type: grayscale
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw pixel data: filter byte + grayscale pixel per row
  const rowSize = 1 + width;
  const raw = Buffer.alloc(rowSize * height);

  // Deterministic PRNG for consistent output
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    raw[offset] = 0; // No filter
    for (let x = 0; x < width; x++) {
      raw[offset + 1 + x] = Math.floor(rand() * 180) + 38; // grayscale 38-218
    }
  }

  const compressed = deflateSync(raw);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = pngChunk("IHDR", ihdr);
  const idatChunk = pngChunk("IDAT", compressed);
  const iendChunk = pngChunk("IEND", Buffer.alloc(0));

  const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  cachedNoise = png.toString("base64");
  return cachedNoise;
}
