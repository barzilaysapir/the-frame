/**
 * @deprecated Use `scripts/generate-site-icons.mjs` — the site only ships
 * the light-silver wordmark used in the header/footer.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// [source absolute path, destination filename under public/]
const WORDMARKS = [
  [
    "C:/Users/sap/.cursor/projects/d-projects-dev-the-frame/assets/c__Users_sap_AppData_Roaming_Cursor_User_workspaceStorage_57f41323adce4e793ebbab7cf9ae87b0_images_frame-title-only-light-silver-ac1fb23b-93b5-4bec-a6e9-98b39f7f82ae-cfadd8f5-d30b-4652-b300-dabd3bf118fd.png",
    "logo-wordmark-light-silver.png",
  ],
];

// Source is already ~689x165. Both current usages (Header.tsx, Footer.tsx)
// render this at h-6 (24px tall, ~100px wide) — `images.unoptimized: true`
// in next.config.mjs means whatever we ship downloads as-is, no runtime
// resizing. 240px wide covers 2x retina at that display size with some
// headroom for a slightly larger future usage; no reason to ship more.
const TARGET_WIDTH = 240;

async function compressWordmark(srcPath, destFilename) {
  const destPath = path.join(ROOT, "public", "logos", destFilename);
  const before = fs.statSync(srcPath).size;
  const buffer = await sharp(srcPath)
    .resize(TARGET_WIDTH, null, { withoutEnlargement: true })
    .png({ quality: 80, palette: true, effort: 10 })
    .toBuffer();
  fs.writeFileSync(destPath, buffer);
  const after = buffer.length;
  console.log(`${destFilename}: ${(before / 1024).toFixed(1)}KB -> ${(after / 1024).toFixed(1)}KB`);
}

async function main() {
  for (const [src, dest] of WORDMARKS) await compressWordmark(src, dest);
}

main();
