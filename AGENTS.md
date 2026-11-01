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

Status as of 2026-10-31 (session 4): the old blockers are resolved. The
Supabase hosts are alive and poulo.site has been read. The work now is
rebuilding `/engineering` to follow poulo.site, per
`docs/superpowers/plans/2026-10-31-poulo-faithful-engineering-site.md`. Read
the "Session 4" section at the bottom of `REBUILD_PROGRESS.md` first: it lists
what is uncommitted, the seven design-feedback points, the open questions, and
the next steps. Rutvij wants a **lightweight preview shown in chat before any
code is written**, work re-checked in a browser before he sees it, and **no
commits until he says so**.

Update (session 5, same day): the portrait is approved and `/engineering` is rebuilt; the
`_v1..v3` studies are deleted. Read "Session 5, part 2" at the bottom of
`REBUILD_PROGRESS.md` for what was built, what was checked, and what is still open.
Still nothing committed.

Update (session 6): deploy path worked out, then glass nav, timer seasons, the "About me" lake and
the vapor role title were added. Read "Session 6" at the bottom of `REBUILD_PROGRESS.md`.

The earlier photography-first rebuild is merged and lives on `main`; its
handoff is [`PROGRESS.md`](PROGRESS.md) in the repo root.
