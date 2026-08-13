/**
 * One-off: compress the "The Frame" script wordmark logos (4 color variants,
 * transparent PNG, script cursive text only — no icon mark) from their
 * source export size down to the site's asset convention before they land
 * in `public/`.
 *
 * Usage: node scripts/compress-logo-wordmarks.mjs
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
    "C:/Users/sap/.cursor/projects/d-projects-dev-the-frame/assets/c__Users_sap_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_frame-title-only-dark-charcoal-2970fac5-2024-4e6d-9efb-8e58589285a0.png",
    "logo-wordmark-dark-charcoal.png",
  ],
  [
    "C:/Users/sap/.cursor/projects/d-projects-dev-the-frame/assets/c__Users_sap_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_frame-title-only-dark-black-00311e87-e506-4882-b6bc-09219a9f6f37.png",
    "logo-wordmark-dark-black.png",
  ],
  [
    "C:/Users/sap/.cursor/projects/d-projects-dev-the-frame/assets/c__Users_sap_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_frame-title-only-light-silver-4a91bd02-c5bb-4147-bb0f-4292c31d8789.png",
    "logo-wordmark-light-silver.png",
  ],
  [
    "C:/Users/sap/.cursor/projects/d-projects-dev-the-frame/assets/c__Users_sap_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_frame-title-only-light-cream-3d5526d1-6b97-4004-befc-98c3b50e9bb4.png",
    "logo-wordmark-light-cream.png",
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
