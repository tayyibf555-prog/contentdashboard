import { readFile } from "fs/promises";
import path from "path";

let fontBold: ArrayBuffer | null = null;
let fontRegular: ArrayBuffer | null = null;

export async function loadFonts() {
  if (!fontBold) {
    const buf = await readFile(
      path.join(process.cwd(), "public", "fonts", "Inter-Bold.woff")
    );
    fontBold = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  if (!fontRegular) {
    const buf = await readFile(
      path.join(process.cwd(), "public", "fonts", "Inter-Regular.woff")
    );
    fontRegular = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  return [
    { name: "Inter" as const, data: fontBold, weight: 700 as const, style: "normal" as const },
    { name: "Inter" as const, data: fontRegular, weight: 400 as const, style: "normal" as const },
  ];
}
