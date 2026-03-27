import { readFile } from "fs/promises";
import path from "path";

let fontBold: Buffer | null = null;
let fontRegular: Buffer | null = null;

export async function loadFonts() {
  if (!fontBold) {
    fontBold = await readFile(
      path.join(process.cwd(), "public", "fonts", "Inter-Bold.woff")
    );
  }
  if (!fontRegular) {
    fontRegular = await readFile(
      path.join(process.cwd(), "public", "fonts", "Inter-Regular.woff")
    );
  }
  return [
    { name: "Inter" as const, data: fontBold, weight: 700 as const, style: "normal" as const },
    { name: "Inter" as const, data: fontRegular, weight: 400 as const, style: "normal" as const },
  ];
}
