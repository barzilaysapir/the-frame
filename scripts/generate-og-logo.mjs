/**
 * Builds the default Open Graph share card: full lockup (mark + "The Frame"
 * wordmark + "by Barzilay") on the site background, 1200×630 JPEG.
 *
 * Usage: node scripts/generate-og-logo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND = { r: 15, g: 15, b: 17 };
const MARK = 240;
const GAP = 40;
const WORD_W = 520;

async function main() {
  const mark = await sharp(path.join(ROOT, "app/icon.png"))
    .resize(MARK, MARK, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const wordmark = await sharp(
    path.join(ROOT, "public/logos/logo-wordmark-light-cream.png"),
  )
    .resize(WORD_W, null, { fit: "inside" })
    .png()
    .toBuffer();
  const wm = await sharp(wordmark).metadata();
  const wmH = wm.height ?? 124;
  const wmW = wm.width ?? WORD_W;

  const subtitleH = 36;
  const textBlockH = wmH + 14 + subtitleH;
  const lockupW = MARK + GAP + wmW;
  const lockupH = Math.max(MARK, textBlockH);
  const originX = Math.round((WIDTH - lockupW) / 2);
  const originY = Math.round((HEIGHT - lockupH) / 2);
  const markY = originY + Math.round((lockupH - MARK) / 2);
  const textX = originX + MARK + GAP;
  const textY = originY + Math.round((lockupH - textBlockH) / 2);

  const subtitle = Buffer.from(
    `<svg width="${wmW}" height="${subtitleH}" xmlns="http://www.w3.org/2000/svg">
  <text x="${wmW}" y="22" text-anchor="end"
    font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
    font-size="18" font-weight="500" letter-spacing="5"
    fill="#8A8A90">BY BARZILAY</text>
</svg>`,
  );

  const out = path.join(ROOT, "public/og/logo.jpg");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: BACKGROUND },
  })
    .composite([
      { input: mark, left: originX, top: markY },
      { input: wordmark, left: textX, top: textY },
      { input: subtitle, left: textX, top: textY + wmH + 10 },
    ])
    .jpeg({ quality: 88, progressive: false })
    .toFile(out);

  const info = await sharp(out).metadata();
  console.log(
    `og/logo.jpg ${info.width}x${info.height} ${(fs.statSync(out).size / 1024).toFixed(0)}KB`,
  );
}

main();
