import { readFile } from "fs/promises";
import path from "path";

const cache = new Map<string, string>();

const TEXTURE_FILES: Record<string, string> = {
  azen: "azen-dark-grain.png",
};

/**
 * Load a static background texture as a base64 string.
 * Returns null if no static texture exists for the given variant.
 * Cached in memory after first load (same pattern as fonts.ts).
 */
export async function loadStaticTexture(variant: string): Promise<string | null> {
  const filename = TEXTURE_FILES[variant];
  if (!filename) return null;

  if (cache.has(variant)) return cache.get(variant)!;

  const filePath = path.join(process.cwd(), "public", "textures", filename);
  const buf = await readFile(filePath);
  const base64 = buf.toString("base64");
  cache.set(variant, base64);
  return base64;
}

/** Check if a variant has a static texture (no Gemini needed). */
export function hasStaticTexture(variant: string): boolean {
  return variant in TEXTURE_FILES;
}
