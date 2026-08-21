/**
 * One-off fix for the mock-catalog media expansion: the AI-generated avatar
 * and poster images were saved at full resolution (1024x1024 / 1536x1024,
 * some mislabeled .jpg files that are actually PNG-encoded), 100-170x larger
 * than the site's existing convention. This recompresses them in place —
 * same filenames/paths, no references anywhere need to change.
 *
 * Usage: node scripts/compress-generated-media.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// New instructor avatars only — the 3 original (daniel-cohen, maya-azulai,
// noa-sagi) are already properly sized real photos and stay untouched.
const NEW_AVATARS = [
  "amit-sharabi.jpg",
  "efrat-wolde.jpg",
  "guy-ravid.jpg",
  "hila-ben-ari.jpg",
  "maya-rozin.jpg",
  "michal-buzaglo.jpg",
  "noga-eliyahu.jpg",
  "omer-tzur.jpg",
  "or-katz.jpg",
  "oran-ben-david.jpg",
  "tali-mizrahi.jpg",
  "tamir-levy.jpg",
  "yael-bar.jpg",
  "yahel-hayat.jpg",
  "yasmin-kadosh.jpg",
  "yonatan-tesfaye.jpg",
];

// All 7 poster images (3 original + 4 new) — keeps .png extension/path,
// just recompressed as a much smaller resized palette PNG.
const POSTERS = [
  "routine-poster-midnight-static.png",
  "routine-poster-neon-nights.png",
  "routine-poster-velvet-heels.png",
  "routine-poster-jazz-glow.png",
  "routine-poster-afro-sunburst.png",
  "routine-poster-dancehall-block.png",
  "routine-poster-commercial-spotlight.png",
];

async function compressAvatar(filename) {
  const filePath = path.join(ROOT, "public", "instructors", filename);
  const before = fs.statSync(filePath).size;
  const buffer = await sharp(filePath)
    .resize(320, 320, { fit: "cover" })
    .jpeg({ quality: 82 })
    .toBuffer();
  fs.writeFileSync(filePath, buffer);
  const after = buffer.length;
  console.log(`avatar ${filename}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
}

async function compressPoster(filename) {
  const filePath = path.join(ROOT, "public", "routine-posters", filename);
  const before = fs.statSync(filePath).size;
  const buffer = await sharp(filePath)
    .resize(960, 640, { fit: "cover" })
    .png({ quality: 70, palette: true, effort: 10 })
    .toBuffer();
  fs.writeFileSync(filePath, buffer);
  const after = buffer.length;
  console.log(`poster ${filename}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
}

async function main() {
  for (const f of NEW_AVATARS) await compressAvatar(f);
  for (const f of POSTERS) await compressPoster(f);
}

main();
