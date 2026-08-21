/**
 * Build only the brand files the site actually serves.
 *
 *   public/favicon-light.png      32×32 dark mark (light system UI)
 *   public/favicon-dark.png       32×32 light mark (dark system UI / incognito)
 *   public/favicon.ico            /favicon.ico fallback (dark-tab mark)
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
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
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

async function squareContain(input, size, background) {
  return sharp(input)
    .resize(size, size, { fit: "contain", background })
    .png(PNG)
    .toBuffer();
}

async function compressPng(input, { width, height } = {}) {
  let img = sharp(input);
  if (width || height) {
    img = img.resize({
      width,
      height,
      fit: width && height ? "fill" : "inside",
      withoutEnlargement: true,
    });
  }
  return img.png(PNG).toBuffer();
}

function pngToIco(pngBuffer, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(pngBuffer.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, pngBuffer]);
}

async function fromRaw(data, width, height) {
  return sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

/** Hair is heavy at the bottom, so equal pixel gaps still look tighter there. */
async function opticalShiftMarkUp(png, shift) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const { width: w, height: h } = info;
  const arm = Math.round(w * 0.22);
  const thickness = Math.max(3, Math.round(w * 0.06));
  const frame = Buffer.alloc(data.length);
  const mark = Buffer.alloc(data.length);
  const inFrameL = (x, y) => {
    const left = x < thickness;
    const right = x >= w - thickness;
    const top = y < thickness;
    const bottom = y >= h - thickness;
    const nearLeft = x < arm;
    const nearRight = x >= w - arm;
    const nearTop = y < arm;
    const nearBottom = y >= h - arm;
    return (
      (top && nearLeft) ||
      (left && nearTop) ||
      (top && nearRight) ||
      (right && nearTop) ||
      (bottom && nearLeft) ||
      (left && nearBottom) ||
      (bottom && nearRight) ||
      (right && nearBottom)
    );
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      data.copy(inFrameL(x, y) ? frame : mark, i, i, i + 4);
    }
  }
  const framePng = await fromRaw(frame, w, h);
  const markPng = await fromRaw(mark, w, h);
  const shiftedMark = await sharp(markPng)
    .extract({ left: 0, top: shift, width: w, height: h - shift })
    .extend({ bottom: shift, background: TRANSPARENT })
    .png()
    .toBuffer();
  return sharp({
    create: { width: w, height: h, channels: 4, background: TRANSPARENT },
  })
    .composite([{ input: framePng }, { input: shiftedMark }])
    .png()
    .toBuffer();
}

async function dilate1px(png) {
  const { width, height } = await sharp(png).metadata();
  const r = 1;
  const canvas = await sharp({
    create: {
      width: width + r * 2,
      height: height + r * 2,
      channels: 4,
      background: TRANSPARENT,
    },
  })
    .png()
    .toBuffer();
  const layers = [];
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      layers.push({ input: png, left: r + dx, top: r + dy });
    }
  }
  return sharp(canvas).composite(layers).png().toBuffer();
}

async function squarePng32(input) {
  const hi = 64;
  const base = await sharp(input)
    .resize(hi, hi, { fit: "contain", background: TRANSPARENT })
    .ensureAlpha()
    .png()
    .toBuffer();
  const balanced = await opticalShiftMarkUp(base, 4);
  const thicker = await dilate1px(balanced);
  const png = await sharp(thicker)
    .resize(32, 32)
    .ensureAlpha()
    .png({ quality: 90, effort: 10, compressionLevel: 9 })
    .toBuffer();
  const meta = await sharp(png).metadata();
  if (meta.width !== 32 || meta.height !== 32) {
    throw new Error(`Favicon must be 32×32, got ${meta.width}×${meta.height}`);
  }
  return png;
}

async function main() {
  const lightUi = await squarePng32(src("favicon-silhouette-dark-black.png"));
  const darkUi = await squarePng32(src("favicon-silhouette-light-silver.png"));
  await writePng(lightUi, path.join(ROOT, "public", "favicon-light.png"));
  await writePng(darkUi, path.join(ROOT, "public", "favicon-dark.png"));

  const svgPath = path.join(ROOT, "public", "icon.svg");
  if (fs.existsSync(svgPath)) fs.unlinkSync(svgPath);

  const icoPath = path.join(ROOT, "public", "favicon.ico");
  fs.writeFileSync(icoPath, pngToIco(darkUi, 32));
  console.log(`${path.relative(ROOT, icoPath)}  ${(fs.statSync(icoPath).size / 1024).toFixed(1)}KB`);

  const legacyPng = path.join(APP, "icon.png");
  if (fs.existsSync(legacyPng)) {
    fs.unlinkSync(legacyPng);
    console.log(`removed ${path.relative(ROOT, legacyPng)}`);
  }

  await writePng(
    await compressPng(src("app-icon-1024.png"), { width: 180, height: 180 }),
    path.join(APP, "apple-icon.png"),
  );

  await writePng(
    await squareContain(src("icon-silhouette-light-silver.png"), 288, {
      r: 0,
      g: 0,
      b: 0,
      alpha: 0,
    }),
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
