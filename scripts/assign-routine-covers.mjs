/**
 * One-off fix for library/class cards all sharing one repeated stock photo
 * per dance style (`POSTER_BY_STYLE` in generate-mock-catalog.ts): every
 * routine in a style pointed at the exact same `/routine-poster-*.png` file,
 * so browsing the library showed the same photo 13-15 times over for
 * unrelated classes. This assigns each routine a cover deterministically
 * picked from a 4-image-per-style pool (based on a stable hash of its
 * slug — never random/per-request), then rewrites `lib/routines.ts` and
 * emits an additive D1 migration so the seed stays in parity.
 *
 * Usage: node scripts/assign-routine-covers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

/** 4 distinct cover photos per style — index 0 is the original shared poster. */
const POSTER_POOL_BY_STYLE = {
  "jazz-funk": [
    "/routine-poster-midnight-static.png",
    "/routine-poster-concrete-groove.png",
    "/routine-poster-amber-loft.png",
    "/routine-poster-city-lights-funk.png",
  ],
  "hip-hop": [
    "/routine-poster-neon-nights.png",
    "/routine-poster-street-cypher.png",
    "/routine-poster-warehouse-glow.png",
    "/routine-poster-block-party.png",
  ],
  heels: [
    "/routine-poster-velvet-heels.png",
    "/routine-poster-neon-runway.png",
    "/routine-poster-penthouse-heels.png",
    "/routine-poster-city-glam.png",
  ],
  jazz: [
    "/routine-poster-jazz-glow.png",
    "/routine-poster-spotlight-lyrical.png",
    "/routine-poster-amber-stage.png",
    "/routine-poster-velvet-curtain.png",
  ],
  afro: [
    "/routine-poster-afro-sunburst.png",
    "/routine-poster-afro-rhythm.png",
    "/routine-poster-tribal-energy.png",
    "/routine-poster-afro-groove.png",
  ],
  dancehall: [
    "/routine-poster-dancehall-block.png",
    "/routine-poster-dancehall-bounce.png",
    "/routine-poster-carnival-vibes.png",
    "/routine-poster-island-heat.png",
  ],
  voguing: [
    "/routine-poster-voguing-spotlight.png",
    "/routine-poster-ballroom-runway.png",
    "/routine-poster-vogue-glam.png",
    "/routine-poster-house-of-style.png",
  ],
};

/** Stable djb2 string hash — deterministic per slug, not RNG-based. */
function hashString(value) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function coverForRoutine(slug, style) {
  const pool = POSTER_POOL_BY_STYLE[style];
  if (!pool) throw new Error(`No cover pool for style: ${style}`);
  return pool[hashString(slug) % pool.length];
}

// --- Parsing helpers (mirrors scripts/verify-mock-db-parity.ts) ------------
//
// Unlike verify-mock-db-parity.ts, this works directly on the raw file text
// (no comment-stripping pass) so edit offsets stay aligned with the file we
// write back. Safe because lib/routines.ts's `//` comments never contain a
// quote character (verified before writing this script) — the string-aware
// brace scanner below already ignores braces/`//` inside real string
// literals, which is the only thing that actually matters here.

function splitTopLevelObjects(arraySource) {
  const objects = [];
  let depth = 0;
  let start = -1;
  let inString = null;
  for (let i = 0; i < arraySource.length; i += 1) {
    const ch = arraySource[i];
    const prev = arraySource[i - 1];
    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        objects.push({ start, end: i + 1, text: arraySource.slice(start, i + 1) });
        start = -1;
      }
    }
  }
  return objects;
}

function field(objSource, name) {
  const m = new RegExp(`\\b${name}:\\s*"([^"]*)"`).exec(objSource);
  return m ? m[1] : null;
}

function main() {
  const filePath = path.join(ROOT, "lib", "routines.ts");
  const rawContent = fs.readFileSync(filePath, "utf8");

  const marker = "export const ROUTINES: RoutineRecord[] = [";
  const markerIdx = rawContent.indexOf(marker);
  if (markerIdx === -1) throw new Error(`Marker not found: ${marker}`);
  const closeMatch = /\r?\n\];\r?\n/.exec(rawContent.slice(markerIdx));
  if (!closeMatch) throw new Error(`Closing "];" not found after marker`);
  const arrayEnd = markerIdx + closeMatch.index + closeMatch[0].length;
  const arraySource = rawContent.slice(markerIdx, arrayEnd);

  const objects = splitTopLevelObjects(arraySource);

  // Apply edits back-to-front so earlier offsets stay valid as later ones
  // are spliced in (poster URLs share a common length within a style, but
  // don't rely on that).
  const edits = [];
  const updates = [];
  for (const obj of objects) {
    const slug = field(obj.text, "slug");
    const style = field(obj.text, "style");
    if (!slug || !style) throw new Error(`Could not read slug/style from object: ${obj.text.slice(0, 80)}`);
    const cover = coverForRoutine(slug, style);
    updates.push({ slug, cover });

    const posterFieldRe = /(\bposter:\s*)"([^"]*)"/;
    const m = posterFieldRe.exec(obj.text);
    if (!m) throw new Error(`Could not find poster field for slug ${slug}`);
    edits.push({
      start: markerIdx + obj.start + m.index,
      end: markerIdx + obj.start + m.index + m[0].length,
      text: `${m[1]}${JSON.stringify(cover)}`,
    });
  }

  edits.sort((a, b) => b.start - a.start);
  let updatedContent = rawContent;
  for (const edit of edits) {
    updatedContent = `${updatedContent.slice(0, edit.start)}${edit.text}${updatedContent.slice(edit.end)}`;
  }
  fs.writeFileSync(filePath, updatedContent);
  console.log(`Updated poster field on ${updates.length} routines in lib/routines.ts`);

  const migrationLines = [
    "-- Additive fix: library/class cards all shared one repeated stock photo per",
    "-- dance style — every routine in a style pointed at the same",
    "-- /routine-poster-*.png file. Gives each routine a cover deterministically",
    "-- picked from a 4-image-per-style pool (see scripts/assign-routine-covers.mjs),",
    "-- so browsing the library no longer shows one photo repeated 13-15x.",
    "",
  ];
  for (const { slug, cover } of updates) {
    migrationLines.push(
      `UPDATE routines SET poster = '${cover}' WHERE slug = '${slug.replace(/'/g, "''")}';`,
    );
  }
  migrationLines.push("");

  const migrationPath = path.join(ROOT, "migrations", "0015_routine_cover_variety.sql");
  fs.writeFileSync(migrationPath, migrationLines.join("\n"));
  console.log(`Wrote ${migrationPath}`);
}

main();
