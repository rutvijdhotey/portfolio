<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Active work — read before anything else

The current effort is the **speed + engineering restructure**, on branch
`rebuild/speed-and-engineering`.

**Start here:** [`docs/rebuild/REBUILD_PROGRESS.md`](docs/rebuild/REBUILD_PROGRESS.md)

That file is the cold-start handoff. It holds the goal, the decisions Rutvij
has already made, the local baseline, the map of every external asset that has
to be self-hosted, what is blocked and why, and the open questions. Read it
fully before proposing or writing anything, and keep it updated as the work
proceeds.

Two things are blocking progress as of 2026-10-31:
1. Whether the Supabase image host still serves files.
2. Reading https://www.poulo.site/ — the design reference. No visual work can
   be planned until it has actually been read. Do not invent a description of
   it.

The earlier photography-first rebuild is merged and lives on `main`; its
handoff is [`PROGRESS.md`](PROGRESS.md) in the repo root.
