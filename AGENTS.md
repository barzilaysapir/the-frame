<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Language

Always reply in English unless the user explicitly asks for another language.

# Mock content vs translations vs server

- **`dictionaries/`** — UI translations only (nav, chrome, auth, player controls). Stays client-side.
- **`mocks/`** + `lib/routines.ts` / `lib/instructors.ts` — demo catalog; also the source for D1 seed SQL (`migrations/0002_catalog_seed.sql`).
- **`lib/server/db.ts`** — shared app D1 binding (`DB` in `wrangler.jsonc`; physical DB name `the-frame-catalog`). Domains: catalog + users + purchases.
- **`lib/server/catalog/`** — catalog repository. Prefer D1; fall back to in-memory mocks when the binding is missing.
- **`lib/server/users/`** — app profile + paid library queries (keyed by Firebase UID).
- **`app/api/v1/`** — HTTP API (`source: d1|mock` for catalog; `/me*` requires Firebase ID token).
- **Demo catalog visibility** — `routines`/`instructors` (all rows) and most of `external_courses` are `is_demo = 1` placeholder content; only `external_courses.slug = 'gisha-gmisha-foundations'` is real. Demo rows are hidden by default; `/api/preview?token=<PREVIEW_CATALOG_TOKEN>` sets a cookie (`lib/preview.ts`) that reveals them for testing on any deployment, without a second Cloudflare environment.

## App D1 (one database)

| Domain | Tables |
| --- | --- |
| Catalog | `instructors`, `routines`, i18n, chapters, … |
| Users | `users` (`firebase_uid` PK; profile cache + prefs) |
| Commerce | `purchases` (entitlements; library = `status = paid`) |

Firebase Auth remains identity. D1 does not store passwords/sessions.

## Catalog API

| Endpoint | Notes |
| --- | --- |
| `GET /api/v1/health` | Liveness + active `source` (`d1` or `mock`) |
| `GET /api/v1/routines?locale=he\|en` | Optional `instructor`, `style`, `level` filters |
| `GET /api/v1/routines/[slug]?locale=` | Single routine |
| `GET /api/v1/instructors?locale=` | Teacher list |
| `GET /api/v1/instructors/[slug]?locale=` | Single teacher |

## Me / library API (Bearer Firebase ID token)

| Endpoint | Notes |
| --- | --- |
| `GET /api/v1/me` | Verify token → upsert `users` → profile |
| `PATCH /api/v1/me` | Update `displayName` / `localePref` in D1 |
| `GET /api/v1/me/library?locale=` | Paid purchases joined to catalog routines |

Demo catalog data is **already in D1** via seed migration. Apply migrations with `npm run db:migrate:local` or `npm run db:migrate:remote`.

# Task git workflow

For every implementation task:

1. Create a GitHub issue (`gh issue create`) for the task.
2. Add the issue (and later the PR) to the **The Frame** project board: https://github.com/users/barzilaysapir/projects/4 (`gh project item-add 4 --owner "@me" --url …`).
3. Open a dedicated branch from `preview` (not `main`), e.g. `feat/12-short-slug`.
4. Link the PR/commits to the issue (`Fixes #N` / `Refs #N`).
5. Open PRs into `preview`. Promote to production only via `preview` → `main`.
6. When the PR merges into `preview`: close the linked issue and move the board item to **Done**.

Details: `.cursor/rules/`

# Cloudflare / OpenNext notes

- Locale routing uses Edge **`middleware.ts`** (not Next 16 `proxy.ts`). `@opennextjs/cloudflare@1.20.x` still rejects Node.js proxy with “Node.js middleware is not currently supported”; switch back when OpenNext ships proxy support (see opennextjs-cloudflare#1309).
- Firebase `NEXT_PUBLIC_*` must be set in Cloudflare **Build variables and secrets** (Workers Builds) *and* as Worker **runtime** vars/secrets. `.env.local` is local-only (gitignored) and does not reach production. Deploy scripts use `--keep-vars` so dashboard vars are not wiped.
