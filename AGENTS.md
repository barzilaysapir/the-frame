<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Language

Always reply in English unless the user explicitly asks for another language.

# Mock content

Teachers, songs, bios, Instagram URLs, posters, and `lib/name-bank.ts` are **mocks for UI/demo** until real production content is provided. Prefer the name bank for new sample rows; do not treat them as final/legal content.

# Task git workflow

For every implementation task:

1. Create a GitHub issue (`gh issue create`) for the task.
2. Add the issue (and later the PR) to the **The Frame** project board: https://github.com/users/barzilaysapir/projects/4 (`gh project item-add 4 --owner "@me" --url …`).
3. Open a dedicated branch from `preview` (not `main`), e.g. `feat/12-short-slug`.
4. Link the PR/commits to the issue (`Fixes #N` / `Refs #N`).
5. Open PRs into `preview`. Promote to production only via `preview` → `main`.
6. Move the board item to **Done** when the work is finished (merged/closed).

Details: `.cursor/rules/`
