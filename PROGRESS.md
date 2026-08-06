# Progress — Photo Pipeline, Floating Gallery, Theming

**Last updated:** 2026-08-02
**Full plan:** [`docs/superpowers/plans/2026-07-31-photo-pipeline-and-floating-gallery.md`](docs/superpowers/plans/2026-07-31-photo-pipeline-and-floating-gallery.md)

This file is a cold-start handoff. Read it first, then the plan.

---

## Where things stand

| Branch | Commit | State |
|---|---|---|
| `feature/paris-chapter` | `ec007e1` | Paris chapter (8 photos, section 04). Was sitting uncommitted on `main`; rescued onto its own branch. **Not pushed, no PR.** |
| `feature/photo-pipeline-floating-gallery` | `e32c401` | Task 1 — pipeline config + URL helpers. 4/4 tests pass. `masterUrl` verified against live Supabase (HTTP 200, 735564 bytes). |
| ″ | `abaf2c6` | The implementation plan. |

Working tree clean. Nothing pushed to GitHub.

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
| 2. Fetch masters | Not started — **unblocked** |
| 3. Derivatives and manifest | Not started — unblocked (needs 2) |
| 4. Measurement harness | Not started — unblocked. Capture baseline **before** Task 5 uploads. |
| 5. Upload | 🔒 Blocked — Supabase credentials |
| 6. `Photo` component | Not started — needs 3 |
| 7. Floating layout | Not started — needs 6 |
| 8. Overlay fixes | Not started — needs 6 |
| 9. Hero video and covers | Partially blocked — poster/cover work unblocked, re-encode needs ffmpeg |
| 10. Verify and finish | Not started |

---

## Blocked on the user

**1. ffmpeg — not installed.** Needed to re-encode the 32 MB hero and the 10.8 MB case-study video. Either install it, or supply encoded MP4/WebM files and poster stills directly. Blocks only Task 9 Step 5.

Also unresolved: **whether the `.mov` hero ever played in Chrome.** QuickTime container support is unreliable outside Safari. If it's HEVC, a chunk of visitors have been seeing a black hero, and this is a correctness fix rather than a performance one. Verify in the browser before treating it as perf-only.

**2. Supabase service key — no `.env.local` exists.** Create it yourself:

```
SUPABASE_URL=https://knlwzjvuqipjrjpgnovc.supabase.co
SUPABASE_SERVICE_KEY=<your service key>
```

Never paste the key into a chat, a commit, or a log line. Scripts read `process.env` and run via `node --env-file=.env.local`. `.gitignore` already covers `.env*` — confirm with `git check-ignore -v .env.local` before the first upload.

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
- **No global git identity is set.** All three commits are authored as `rutvijdhotey@Rutvijs-MacBook-Pro.local`, which GitHub won't link to the account. Fix before pushing:
  ```bash
  git config --global user.email "rutvij.dhotey@gmail.com"
  ```
  Existing commits need `git rebase --reset-author` to pick it up — cheap while it's only three.

---

## To resume

> Continue the photo pipeline work on rutvijdhotey.com — read `PROGRESS.md`, then the plan's Progress section, and start Task 2.

Tasks 2, 3, and 4 need nothing from the user and can run immediately. Execution has been running subagent-driven: one implementer per task, spec review then quality review, commit per task.
