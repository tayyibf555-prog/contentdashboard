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
  const [
    interBold, interRegular,
    dmSerifRegular, dmSansRegular, dmSansSemiBold,
    outfitBold, outfitMedium, outfitRegular,
    plusJakartaMedium, plusJakartaBold, plusJakartaExtraBold,
    permanentMarker, playfairSemiBoldItalic, playfairBlackItalic,
  ] = await Promise.all([
    loadFont("Inter-Bold.woff"),
    loadFont("Inter-Regular.woff"),
    loadFont("DMSerifDisplay-Regular.ttf"),
    loadFont("DMSans-Regular.ttf"),
    loadFont("DMSans-SemiBold.ttf"),
    loadFont("Outfit-Bold.ttf"),
    loadFont("Outfit-Medium.ttf"),
    loadFont("Outfit-Regular.ttf"),
    loadFont("PlusJakartaSans-Medium.ttf"),
    loadFont("PlusJakartaSans-Bold.ttf"),
    loadFont("PlusJakartaSans-ExtraBold.ttf"),
    loadFont("PermanentMarker-Regular.ttf"),
    loadFont("PlayfairDisplay-SemiBoldItalic.ttf"),
    loadFont("PlayfairDisplay-BlackItalic.ttf"),
  ]);

  return [
    { name: "Inter" as const, data: interBold, weight: 700 as const, style: "normal" as const },
    { name: "Inter" as const, data: interRegular, weight: 400 as const, style: "normal" as const },
    { name: "DM Serif Display" as const, data: dmSerifRegular, weight: 400 as const, style: "normal" as const },
    { name: "DM Sans" as const, data: dmSansRegular, weight: 400 as const, style: "normal" as const },
    { name: "DM Sans" as const, data: dmSansSemiBold, weight: 600 as const, style: "normal" as const },
    { name: "Outfit" as const, data: outfitBold, weight: 700 as const, style: "normal" as const },
    { name: "Outfit" as const, data: outfitMedium, weight: 500 as const, style: "normal" as const },
    { name: "Outfit" as const, data: outfitRegular, weight: 400 as const, style: "normal" as const },
    { name: "Plus Jakarta Sans" as const, data: plusJakartaMedium, weight: 500 as const, style: "normal" as const },
    { name: "Plus Jakarta Sans" as const, data: plusJakartaBold, weight: 700 as const, style: "normal" as const },
    { name: "Plus Jakarta Sans" as const, data: plusJakartaExtraBold, weight: 800 as const, style: "normal" as const },
    { name: "Permanent Marker" as const, data: permanentMarker, weight: 400 as const, style: "normal" as const },
    { name: "Playfair Display" as const, data: playfairSemiBoldItalic, weight: 600 as const, style: "italic" as const },
    { name: "Playfair Display" as const, data: playfairBlackItalic, weight: 900 as const, style: "italic" as const },
  ];
}
