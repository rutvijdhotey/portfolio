# Progress — Photo Pipeline, Floating Gallery, Theming

**Last updated:** 2026-08-05
**Full plan:** [`docs/superpowers/plans/2026-07-31-photo-pipeline-and-floating-gallery.md`](docs/superpowers/plans/2026-07-31-photo-pipeline-and-floating-gallery.md)

This file is a cold-start handoff. Read it first, then the plan.

---

## Where things stand

| Branch | Commit | State |
|---|---|---|
| `feature/paris-chapter` | `ec007e1` | Paris chapter (8 photos, section 04). Was sitting uncommitted on `main`; rescued onto its own branch. **Not pushed, no PR.** |
| `feature/photo-pipeline-floating-gallery` | `e32c401` | Task 1 — pipeline config + URL helpers. 4/4 tests pass. `masterUrl` verified against live Supabase (HTTP 200, 735564 bytes). |
| ″ | `abaf2c6` | The implementation plan. |
| ″ | `351db83` | Task 2 — fetch masters. |
| ″ | `d453f5c` | Task 4 — measurement harness + recorded baseline. |
| ″ | `fdb684e` | Task 3 — derivative ladder + `lib/photo-manifest.json`. |

Nothing pushed to GitHub. `masters/` (191.4 MB) and `derivatives/` (37.3 MB) exist locally and are gitignored.

**Branch stacking:** `feature/photo-pipeline-floating-gallery` is branched off `feature/paris-chapter`, **not** off `main` — the pipeline's source list and the generated manifest both need the Paris photos. Merge the Paris PR first, then rebase this branch onto `main`.

---

## The problem being solved

Measured against the live site on 2026-07-31:

| Asset | Weight |
|---|---|
| 29 gallery images | **191.4 MB** (6.60 MB avg, 16.95 MB largest) |
| Hero video (`.mov`, autoplay) | **32.4 MB** |
| Home cover PNG (`app/home.css:28`) | 2.46 MB |
| Engineering cover PNG (`app/engineering/engineering.css:81`) | 1.90 MB |
| Case-study MP4 (`app/engineering/into-your-stories/page.tsx:12`) | 10.76 MB |
| `cache-control` on every asset | **`no-cache`** — nothing caches, returning visitors re-download everything |

**Target: under 8 MB.** Re-run `npm run photos:measure` to reproduce the baseline; `npm run photos:measure after` compares once derivatives are live.

Two defects found while measuring, both being fixed as part of this work:

1. **The creative hero has no `poster` and no `src` in markup.** `app/creative/page.tsx:41` assigns `videoRef.current.src` inside a `useEffect`, so the page paints a black box, hydrates, and only *then* starts fetching 32 MB. LCP is effectively empty for seconds.
2. **`OverlayViewer` is always mounted with a live `src`** (`components/OverlayViewer.tsx:88`), so image #1 downloads at full resolution on every page load whether or not anyone opens the viewer.

---

## Decisions settled (grill-me interview, 2026-07-31)

1. **Offline `sharp` pipeline**, re-upload to Supabase. No hosting migration — GitHub Pages stays.
2. **Repeatable, not one-shot.** Gitignored `masters/` is source of truth; gallery data generated from a manifest. Chosen over a quick backfill because Supabase holds the *only* copy of 16 masters, so step one is also a backup that doesn't currently exist.
3. **Dedicated ~2560px overlay rung** + neighbour prefetch, so arrow-key navigation is instant. AVIF with WebP fallback in `<picture>`.
4. **Editorial stagger layout** — varied widths, alternating alignment, generous vertical rhythm. `object-fit: cover` is removed.
5. **Whole site themes, media surfaces exempt.** Photo/video heroes keep dark scrims and white text in both modes; a light scrim over a photograph destroys legibility depending on what's in frame.
6. **Dark is the forced default, ignoring OS preference**, with an opt-in toggle. Deliberate: the site was designed against `#0a0a0a` and light mode will always be the second-best presentation of the photographs. Accepted trade-off — it overrides a stated user preference.
7. **Hero re-encoded with a poster** that becomes the LCP element.
8. **Two branches**, theming strictly second.

---

## Task status

| Task | Status |
|---|---|
| 1. Pipeline config and URL helpers | ✅ Done — `e32c401` |
| 2. Fetch masters | ✅ Done — `351db83`. All 29 masters local, 191.4 MB. Re-run skips all 29. |
| 3. Derivatives and manifest | ✅ Done — `fdb684e`. 274 derivatives, 37.3 MB on disk; 1800 AVIF rung is 5.64 MB for all 29. |
| 4. Measurement harness | ✅ Done — `d453f5c`. Baseline captured before any upload. |
| 5. Upload | Not started — **unblocked**, `.env.local` verified (role `service_role`, bucket `portfolio` reachable) |
| 6. `Photo` component | Not started — needs 3 |
| 7. Floating layout | Not started — needs 6 |
| 8. Overlay fixes | Not started — needs 6 |
| 9. Hero video and covers | Partially blocked — poster/cover work unblocked, re-encode needs ffmpeg |
| 10. Verify and finish | Not started |

---

## Blocked on the user

**1. ffmpeg — not installed.** Needed to re-encode the 32 MB hero and the 10.8 MB case-study video. Either install it, or supply encoded MP4/WebM files and poster stills directly. Blocks only Task 9 Step 5.

Also unresolved: **whether the `.mov` hero ever played in Chrome.** QuickTime container support is unreliable outside Safari. If it's HEVC, a chunk of visitors have been seeing a black hero, and this is a correctness fix rather than a performance one. Verify in the browser before treating it as perf-only.

**2. ~~Supabase service key~~ — RESOLVED 2026-08-05.** `.env.local` exists with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`. Verified: the key decodes to role `service_role`, and `GET /storage/v1/bucket` returns 200 with the `portfolio` bucket. `git check-ignore` confirms `.gitignore:34` (`.env*`) covers it. Scripts read `process.env` and run via `node --env-file=.env.local`. Never paste the key into a chat, a commit, or a log line.

---

## Safety rails — do not violate

- **Supabase holds the only copy of 16 masters** (all 8 Paris, all 8 Bend Oregon). `npm run photos:fetch` is therefore a backup as much as a build step. Derivatives upload **only** under the new `optimized/` prefix; `upload.mjs` throws if a key falls outside it. Originals are never overwritten.
- After the first upload, verify the master is untouched:
  ```bash
  curl -sI "https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Images/City/Japan/RJ405649.jpg" | grep -i content-length
  ```
  Expected: still `5669767`.
- **No new dependencies.** Tests use Node's built-in runner (`node --test`). `sharp` was already present as a transitive dep of Next and is now declared explicitly. Don't add vitest, jest, or an image library.

---

## Known gaps

- **The case-study MP4 has no task.** 10.76 MB at `app/engineering/into-your-stories/page.tsx:12`. Blocked on the same ffmpeg decision; fold it into Task 9 once that's resolved.
- **The light palette was never designed.** Theming is agreed in principle but pure `#ffffff` will fight the cream `#f0ede8` text and make the photographs look clinical — likely a warm off-white instead. Must be decided before branch 2.
- **All 29 photos need a human review pass.** Dropping `object-fit: cover` means every photo displays uncropped for the first time; the current layout has been silently cropping compositions to fit its rows. Some will improve, some won't. Adjust `size`/`align` per photo in `lib/gallery-layout.ts`. This is a real review, not a formality.
- **Git identity: fixed going forward, not retroactively.** `user.name`/`user.email` are now set globally, so `fdb684e` onward is correctly attributed. The six earlier commits — `ec007e1` on `feature/paris-chapter`, plus `e32c401`, `abaf2c6`, `584622d`, `351db83`, `d453f5c` here — still carry `rutvijdhotey@Rutvijs-MacBook-Pro.local` and won't link to the GitHub account. Rewriting them spans both stacked branches, so the order matters: rewrite `feature/paris-chapter` first, then replay this branch with `git rebase --onto`. Nothing is pushed, so it's still free. The rewrite invalidates every commit hash quoted in this file.

- **The 8 Bend Oregon masters are only 2048px wide**, so they skip the 2560 overlay rung (the pipeline never upscales) — 21 of 29 photos have it. Task 8's overlay must fall back to the 1800 rung when the dedicated one is absent, rather than assuming it always exists.

---

## To resume

> Continue the photo pipeline work on rutvijdhotey.com — read `PROGRESS.md`, then the plan's Progress section, and start Task 5.

Task 5 (upload) is unblocked and is the first step that **writes** to Supabase. Everything before it was read-only. Upload only under the `optimized/` prefix; `upload.mjs` must throw if a key falls outside it. Verify a master is byte-identical afterwards using the `curl` check above.
