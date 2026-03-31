import { readFile } from "fs/promises";
import path from "path";

const cache = new Map<string, ArrayBuffer>();

async function loadFont(filename: string): Promise<ArrayBuffer> {
  if (cache.has(filename)) return cache.get(filename)!;
  const buf = await readFile(path.join(process.cwd(), "public", "fonts", filename));
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  cache.set(filename, ab);
  return ab;
}

export async function loadFonts() {
  const [interBold, interRegular, dmSerifRegular, dmSansRegular, dmSansSemiBold] = await Promise.all([
    loadFont("Inter-Bold.woff"),
    loadFont("Inter-Regular.woff"),
    loadFont("DMSerifDisplay-Regular.ttf"),
    loadFont("DMSans-Regular.ttf"),
    loadFont("DMSans-SemiBold.ttf"),
  ]);

  return [
    { name: "Inter" as const, data: interBold, weight: 700 as const, style: "normal" as const },
    { name: "Inter" as const, data: interRegular, weight: 400 as const, style: "normal" as const },
    { name: "DM Serif Display" as const, data: dmSerifRegular, weight: 400 as const, style: "normal" as const },
    { name: "DM Sans" as const, data: dmSansRegular, weight: 400 as const, style: "normal" as const },
    { name: "DM Sans" as const, data: dmSansSemiBold, weight: 600 as const, style: "normal" as const },
  ];
}
