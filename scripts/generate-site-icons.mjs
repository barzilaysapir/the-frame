/**
 * Build only the brand files the site actually serves.
 *
 *   app/icon.png                  tab favicon (32px, edge-to-edge silhouette)
 *   app/apple-icon.png            iOS home screen
 *   app/opengraph-image.png       social share card
 *   public/logos/logo-mark.png    header + footer mark
 *   public/logos/logo-wordmark-light-silver.png   header + footer "The Frame"
 *
 * Reads `.tmp-brand/` (short copies of the designer exports).
 * Usage: node scripts/generate-site-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, ".tmp-brand");
const LOGOS = path.join(ROOT, "public", "logos");
const APP = path.join(ROOT, "app");

const PNG = { quality: 80, palette: true, effort: 10 };
const FRAME_BG = { r: 0x0f, g: 0x0f, b: 0x11, alpha: 1 };

function src(name) {
  const file = path.join(SRC, name);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file} — copy designer exports into .tmp-brand first.`);
  }
  return file;
}

async function writePng(buffer, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const before = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
  await sharp(buffer).toFile(dest);
  const after = fs.statSync(dest).size;
  console.log(
    `${path.relative(ROOT, dest)}  ${(after / 1024).toFixed(1)}KB` +
      (before ? ` (was ${(before / 1024).toFixed(1)}KB)` : ""),
  );
}

async function squarePad(input, size) {
  const { width, height } = await sharp(input).metadata();
  const side = Math.max(width, height);
  const padX = Math.floor((side - width) / 2);
  const padY = Math.floor((side - height) / 2);
  return sharp(input)
    .extend({
      top: padY,
      bottom: side - height - padY,
      left: padX,
      right: side - width - padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(size, size)
    .png(PNG)
    .toBuffer();
}

async function compressPng(input, { width, height } = {}) {
  let img = sharp(input);
  if (width || height) {
    img = img.resize({ width, height, withoutEnlargement: true });
  }
  return img.png(PNG).toBuffer();
}

async function favicon32() {
  const padded = await squarePad(src("favicon-silhouette-light-silver.png"), 32);
  return sharp(padded).flatten({ background: FRAME_BG }).png(PNG).toBuffer();
}

async function main() {
  await writePng(await favicon32(), path.join(APP, "icon.png"));

  await writePng(
    await compressPng(src("app-icon-1024.png"), { width: 180, height: 180 }),
    path.join(APP, "apple-icon.png"),
  );

  await writePng(
    await squarePad(src("icon-silhouette-light-silver.png"), 288),
    path.join(LOGOS, "logo-mark.png"),
  );

  // Same 240px-wide convention as the previous wordmark (header/footer h-6).
  await writePng(
    await compressPng(src("title-only-light-silver.png"), { width: 240 }),
    path.join(LOGOS, "logo-wordmark-light-silver.png"),
  );

  const lockup = await sharp(src("logo-stacked-light-cream.png"))
    .resize({ height: 420, withoutEnlargement: true })
    .png()
    .toBuffer();
  const lockupMeta = await sharp(lockup).metadata();
  const og = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: FRAME_BG },
  })
    .composite([
      {
        input: lockup,
        left: Math.round((1200 - lockupMeta.width) / 2),
        top: Math.round((630 - lockupMeta.height) / 2),
      },
    ])
    .png(PNG)
    .toBuffer();
  await writePng(og, path.join(APP, "opengraph-image.png"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
