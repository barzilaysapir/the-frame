/**
 * One-off quality fix for public/course-covers/vibe-on-heels.png.
 * Source was 643x371 (below the site's 960x540 course-cover convention)
 * with visible compression block-noise and a near-invisible heel icon.
 * Denoises, lifts the icon's contrast, upscales to 960x540, sharpens,
 * and recompresses as a palette PNG per the site's cover convention.
 *
 * Usage: node scripts/fix-vibe-on-heels-cover.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, "..", "public", "course-covers", "vibe-on-heels.png");

async function main() {
  const before = fs.statSync(filePath).size;
  const buffer = await sharp(filePath)
    .median(3)
    .linear(2.2, -14)
    .resize(960, 540, { fit: "cover", kernel: "lanczos3" })
    .sharpen({ sigma: 0.6 })
    .png({ quality: 70, palette: true, effort: 10 })
    .toBuffer();
  fs.writeFileSync(filePath, buffer);
  const after = buffer.length;
  console.log(`vibe-on-heels.png: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
}

main();
