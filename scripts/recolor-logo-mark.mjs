/**
 * One-off: retint `public/logo-mark.png` (the frame-corners + silhouette icon
 * next to the wordmark in Header/Footer) to match the exact gray used by
 * `logo-wordmark-light-silver.png` (the site's `frame-silver` token,
 * #C9C9CE) instead of its original, slightly darker gray — so the icon and
 * the wordmark it sits beside read as the same color, not the "by Barzilay"
 * caption below them.
 *
 * The source icon is effectively flat-color (a silhouette + corner marks
 * with anti-aliased edges, no shading), so this keeps its alpha channel
 * (shape) as-is and just swaps the RGB fill to the target color.
 *
 * Usage: node scripts/recolor-logo-mark.mjs
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const TARGET_PATH = path.join(ROOT, "public", "logo-mark.png");
// frame-silver (#C9C9CE) — matches logo-wordmark-light-silver.png's fill.
const TARGET_RGB = { r: 0xc9, g: 0xc9, b: 0xce };

async function main() {
  const image = sharp(TARGET_PATH);
  const { width, height } = await image.metadata();
  const alpha = await image
    .clone()
    .ensureAlpha()
    .extractChannel(3)
    .raw()
    .toBuffer();

  const recolored = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: TARGET_RGB,
    },
  })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png({ quality: 80, palette: true, effort: 10 })
    .toBuffer();

  await sharp(recolored).toFile(TARGET_PATH);
  console.log(`Recolored ${TARGET_PATH} to rgb(${TARGET_RGB.r}, ${TARGET_RGB.g}, ${TARGET_RGB.b}).`);
}

main();
