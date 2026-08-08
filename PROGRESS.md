# Progress — Photo Pipeline, Floating Gallery, Theming

**Last updated:** 2026-08-07
**Full plan:** [`docs/superpowers/plans/2026-07-31-photo-pipeline-and-floating-gallery.md`](docs/superpowers/plans/2026-07-31-photo-pipeline-and-floating-gallery.md)

This file is a cold-start handoff. Read it first, then the plan.

---

## Where things stand

**Shipped and live as of 2026-08-07.** `main` is at `ad47246`; the GitHub Pages deploy succeeded and rutvijdhotey.com serves the new build.

| Merged | PR | Contents |
|---|---|---|
| `feature/paris-chapter` | [#8](https://github.com/rutvijdhotey/portfolio/pull/8) | Paris chapter (8 photos, section 04) |
| `feature/photo-pipeline-floating-gallery` | [#9](https://github.com/rutvijdhotey/portfolio/pull/9) | Photo pipeline, floating collage gallery, covers, hero video removal |

Verified against the live site, not just the build: `/creative` serves `photo-band` markup and `optimized/` derivatives, with zero references to the old masters or the hero `.mov`. Home and engineering serve the AVIF covers.

> **Every commit hash quoted below is from before the pre-push rewrite and no longer resolves.** Both branches were rewritten to fix six misattributed commits (see Known gaps), which invalidated every hash. They are left in place as a record of what was done in what order, not as references you can `git show`.

`masters/` (191.4 MB) and `derivatives/` (37.3 MB) exist locally and are gitignored. Supabase still holds the only remote copy of the masters.

---

## The problem being solved

Measured against the live site on 2026-07-31:

> **Correction (2026-08-06):** the `cache-control` row below was wrong. Supabase's CDN returns `no-cache` on *any* HEAD request regardless of stored metadata, and the original measurement used HEAD. On a real GET the masters serve `max-age=3600`. Caching was weak (1 hour), not absent. The size figures are unaffected. `measure.mjs` now uses a ranged GET.

| Asset | Weight |
|---|---|
| 29 gallery images | **191.4 MB** (6.60 MB avg, 16.95 MB largest) — now 39 images / 211.7 MB with Copenhagen |
| Hero video (`.mov`, autoplay) | **32.4 MB** |
| Home cover PNG (`app/home.css:28`) | 2.46 MB |
| Engineering cover PNG (`app/engineering/engineering.css:81`) | 1.90 MB |
| Case-study MP4 (`app/engineering/into-your-stories/page.tsx:12`) | 10.76 MB |
| `cache-control` on every asset | `max-age=3600` (see correction above) |

**Target: under 8 MB — met at the asset level.** Measured 2026-08-06, both via ranged GET:

| | Photos | Total | Average | Largest | cache-control |
|---|---|---|---|---|---|
| before | 39 | 211.7 MB | 5.43 MB | 16.95 MB | `max-age=3600` |
| after | 39 | **6.9 MB** | 0.18 MB | 0.52 MB | `public, max-age=31536000, immutable` |

The site actually requests these files. Verified at a 1440px viewport: 39 photos, all `optimized/` AVIF, 1 eager / 38 lazy, no `-2560` fetched on load, and the overlay mounts zero images until it is first opened. The band layout later widened rung selection from all-1800 to a 768/1200/1800 mix, since a photo at a 30% share only needs ~390px.

**Whole-page result**, once the covers and the hero video were dealt with too:

| Asset class | Before | After |
|---|---|---|
| 39 gallery photos | 211.7 MB | **6.9 MB** |
| 3 full-bleed covers | 4.93 MB | **442 KB** |
| Hero video (autoplay) | 32.4 MB (+33.1 MB on mobile) | **removed** — 156 KB poster still |
| Case-study MP4 | 11.3 MB | unchanged, but `preload="metadata"` so it is not fetched until played |

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
| 5. Upload | ✅ Done — `09bbace`. 372 files under `optimized/`, remote count matches local, masters byte-identical. |
| 6. `Photo` component | ✅ Done — `392887f` |
| 7. Floating layout | ✅ Redone as bands — see [the collage spec](docs/superpowers/specs/2026-08-07-floating-collage-gallery-design.md). 39 photos in 21 bands. **Reviewed and accepted by Rutvij, 2026-08-07** — every derived band stands, no overrides added beyond the Dotonbori pair. Review badge removed. |
| 8. Overlay fixes | ✅ Done — `392887f` |
| 9. Hero video and covers | ✅ Done for everything that does not need ffmpeg. Three covers converted to AVIF (4.93 MB → 442 KB), hero poster added, then the hero video removed entirely. **Re-encoding is still open.** |
| 10. Verify and finish | ✅ Done — merged via #8 and #9, deployed, and verified live. |

---

## Blocked on the user — video only

**1. ffmpeg — not installed.** Needed to re-encode the hero and case-study videos. Either install it, or supply encoded MP4/WebM files directly.

~~Also unresolved: whether the `.mov` hero ever played in Chrome.~~ **Resolved 2026-08-07: it plays.** Both heroes were loaded directly in Chrome 148 — each decodes cleanly, `readyState` 4, no error, 3840×2160. They are H.264 in a QuickTime container, and Chrome sniffs the codec rather than trusting the container MIME (`canPlayType('video/quicktime')` returns `""` even though playback works). So this was always a performance problem, never a correctness one.

**The hero video has been removed from the site** (2026-08-07), pending re-encoding. Measured sizes, by ranged GET:

| File | Size | Status |
|---|---|---|
| `Videos/IMG_7855.mov` — desktop hero | 32.4 MB | no longer referenced |
| `Videos/IMG_7946 (1).mov` — "mobile" hero | 33.1 MB | no longer referenced |
| `Videos/movie.mp4` — case study | 11.3 MB | **still referenced** |

Note the mobile hero was *larger* than the desktop one, and both were 4K. They are different clips, though, so the `innerWidth <= 768` branch was an art-direction choice rather than a bandwidth one — restore both if the videos come back.

**To restore the hero:** `app/creative/page.tsx` renders an `<img className="video-hero__video">` using the poster. Swap it back to a `<video>` with the same class (the CSS is unchanged and still named for it), and reinstate the two URL constants above plus the `innerWidth` branch. Nothing on Supabase was deleted — the originals are untouched under `Videos/`.

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

- **The case-study MP4 is deliberately untouched.** 11.3 MB at `app/engineering/into-your-stories/page.tsx:12`. Unlike the hero it is `preload="metadata"` behind `controls`, so it downloads only a few KB of container metadata on page load — it costs nothing until a visitor presses play. It is also content rather than decoration: the demo of Into Your Stories, with a "Watch demo →" CTA pointing at the same file. Re-encode it when ffmpeg is available, but do not remove it for weight.
- **The light palette was never designed.** Theming is agreed in principle but pure `#ffffff` will fight the cream `#f0ede8` text and make the photographs look clinical — likely a warm off-white instead. Must be decided before branch 2.
- ~~**All 39 photos need a human review pass.**~~ **Done 2026-08-07.** Rutvij reviewed
  all 21 bands against the running page and accepted every derived grouping; the only
  authored exception remains the Dotonbori pair in `BAND_OVERRIDES`. The dev-only
  `id · share ↓drop` badge that supported the pass has been removed.
  Future adjustments: `lib/gallery-bands.ts` derives grouping from aspect ratio, and
  `lib/gallery-layout.ts` holds the tuning plus the authored exceptions — add a
  `BAND_OVERRIDES` entry for a specific pairing, or change `TUNING` if the whole scale
  is off rather than individual bands.
- ~~**Git identity: fixed going forward, not retroactively.**~~ **Resolved 2026-08-07, before the push.** The six commits carrying `rutvijdhotey@Rutvijs-MacBook-Pro.local` were rewritten across both stacked branches — `feature/paris-chapter` first, then the pipeline branch replayed with `git rebase --onto`. Verified afterwards that the diff against the pre-rewrite backups was empty (metadata only, no content change), the commit count was unchanged at 28, and every one of the 28 resolves to the `rutvijdhotey` GitHub account via the API. The rewrite invalidated every commit hash quoted in this file.
  - **Still outstanding, and deliberately left alone:** roughly 40 older commits already on `main` are also unlinked, from before the global identity was set. Fixing those means rewriting published history on `main` — a materially different proposition from cleaning up unpushed work, and not recommended.

- **The 8 Bend Oregon masters are only 2048px wide**, so they skip the 2560 overlay rung (the pipeline never upscales) — 21 of 29 photos have it. Task 8's overlay must fall back to the 1800 rung when the dedicated one is absent, rather than assuming it always exists.

---

## To resume

> The photo pipeline and floating collage gallery on rutvijdhotey.com are shipped and live as of 2026-08-07. Read `PROGRESS.md` first. Two things remain: re-encoding the videos (needs ffmpeg, not installed) and theming (needs its own spec — the light palette was never designed).

**This branch of work is finished.** Tasks 1–10 are complete, merged via #8 and #9, deployed, and verified against the live site.

**What is left, in the order it was agreed:**

1. **Video re-encoding.** Blocked on ffmpeg, which is not installed — do not install it unprompted; Rutvij's standing preference is to supply converted assets himself. Three files, all still untouched on Supabase: `IMG_7855.mov` (32.4 MB), `IMG_7946 (1).mov` (33.1 MB), `movie.mp4` (11.3 MB). The first two are no longer referenced by the site; the third still is, but it sits behind `preload="metadata"` and `controls`, so it costs almost nothing until someone presses play.
2. **Theming** — light/dark with dark as the forced default and media surfaces exempt. A separate branch, and it needs its own spec before any code. The light palette is the open design question.

Verification habit worth keeping: check Supabase headers with a **ranged GET**, never HEAD.

```bash
curl -s -o /dev/null -D- -r 0-1 "<url>" | grep -iE "cache-control|content-range"
```
