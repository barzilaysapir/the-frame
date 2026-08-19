/**
 * One-off compression for the new flat-vector style-card cover images
 * (public/style-covers/). Resizes to 960x540 — matching the StyleCard's
 * `aspect-video` (16:9) container so `object-cover` never crops them —
 * and recompresses as a palette PNG per the site's card/poster convention.
 *
 * Usage: node scripts/compress-style-covers.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "public", "style-covers");

async function compressCover(filename) {
  const filePath = path.join(DIR, filename);
  const before = fs.statSync(filePath).size;
  const buffer = await sharp(filePath)
    .resize(960, 540, { fit: "cover" })
    .png({ quality: 70, palette: true, effort: 10 })
    .toBuffer();
  fs.writeFileSync(filePath, buffer);
  const after = buffer.length;
  console.log(`${filename}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
}

async function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".png"));
  for (const f of files) await compressCover(f);
}

main();
