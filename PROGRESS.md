# Progress — Photography-First Rebuild

**Last updated:** 2026-09-04 (rev 3)
**Plan:** [`docs/superpowers/plans/2026-08-27-photography-first-rebuild.md`](docs/superpowers/plans/2026-08-27-photography-first-rebuild.md)

This file is a cold-start handoff. Read it first, then the plan.

> The previous handoff (photo pipeline + floating collage, shipped 2026-08-07) is
> superseded. That work is on `main` and still underpins everything here — the
> `sharp` ladder, the committed manifest, the Supabase `optimized/` prefix. What
> changed is the site built on top of it.

---

## Where things stand

**Plan 1 of 3 is built and pushed. Not merged.**

- Branch: `feature/photography-first-rebuild`, 17 commits ahead of `main`
- PR: **https://github.com/rutvijdhotey/portfolio/pull/11** — `MERGEABLE`, 42 files, +3,776 / −1,171
- `main` is untouched; rutvijdhotey.com still serves the old split-door site

**CI now gates this PR.** `ci.yml` runs tests, `tsc` and the build on every
pull request; `deploy.yml` runs the same three before it publishes, so a direct
push to `main` can no longer ship a red build. Lint runs as an advisory job —
see "Known red" below.

| Check | Result |
|---|---|
| `npm test` | 81 / 81 |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | 9 routes, 11 HTML files |
| `node scripts/photos/measure.mjs after` | 121.1 MB masters → 2.7 MB, avg 0.12 MB — **understated, see below** |
| real page weight @1280×720 DPR2 | `/photography` 2.44 MB · paris 0.42 · copenhagen 0.76 · japan 1.14 |
| cache-control | `public, max-age=31536000, immutable` ×22 |

Verified in a browser: every route 200 with correct titles; theme survives a
reload; zero horizontal overflow at 375px; overlay opens / arrow-advances /
escape-closes and restores scroll; reduced motion collapses the filmstrip.

**Fixed after that first pass (`66b67de`): every Roll frame over-fetched.**
`.roll__frame` is bounded on both axes — `min(72vw, calc(62vh * --arn))` — but
`sizes` declared only the `72vw` half, and `sizes` is what picks the rung. All
22 frames on the three trip pages pulled a rung or two too high: 4.68 MB where
2.32 MB does. `rollSizes()` in `lib/roll.ts` now emits both bounds per frame.
Same class of defect as the retina gap — a layout/ladder mismatch that tests,
`tsc` and `npm run build` all pass straight through.

---

## What the site is now

```
/                       identity landing — statement, two doors, one quiet photograph
/photography            Print Room — 12 Selected frames, single column, up to 1440px
/photography/[slug]     The Roll — horizontal filmstrip (japan, copenhagen, paris)
/about                  engineering + colophon
/creative               meta-refresh redirect to /photography (do not delete)
/engineering            legacy, deliberately untouched, pinned to dark
```

- **Corpus cut 39 → 22.** Japan 8, Copenhagen 9, Paris 5. Oregon and "Random"
  removed entirely. Nothing deleted from Supabase — those derivatives are simply
  unreferenced.
- **The Roll:** native vertical scroll drives horizontal travel inside a sticky
  stage. **The wheel is never intercepted.** Continuous scrub, not snap — an
  explicit design decision.
- **Theme:** three-tier tokens in `app/tokens.css`. Only the semantic tier flips.
  Dark is the bare `:root`, so no OS signal → dark; a light OS preference is
  respected; the toggle overrides both and persists in `localStorage`.

---

## Action items for Rutvij

**Before merging PR #11:**

1. `npm run dev`, then look at `/photography` and `/photography/copenhagen`.
2. **Does continuous scrub feel right?** The maths is verified (frames centre
   exactly, counter tracks). Whether it *feels* good is a judgment call. Snap is
   a two-line change if not.
3. **Review `SELECTED_IDS` and its order** in `lib/trips.ts`, and the `ALT` map
   beside it. Both were authored by Claude from looking at the contact sheet —
   the sequence is the most visible editorial decision in the rebuild, and the
   alt text is what screen readers announce.

**Known red — lint, 2 errors.** `react-hooks/set-state-in-effect` fires on
`components/ThemeToggle.tsx:12` and `components/OverlayViewer.tsx:33`. Both read
client-only state on mount (localStorage / matchMedia; a prop mirror held local
during a GSAP transition), which is legitimate but is the pattern the new React
Compiler rule rejects. The fixes are real refactors of browser-verified
behaviour — `useSyncExternalStore` for the toggle, adjust-during-render for the
viewer — not a lint tidy, so lint is advisory in CI rather than blocking. Pay it
off deliberately, with the running page open.

**Only Rutvij can do:**

4. **Re-request high-resolution film scans.** All seven current scans are
   1565×1037 — the lab's smallest tier, below even the 1800 rung. Same negatives,
   no re-developing, usually a small fee. Labs don't keep scans forever.
   Also: the gyoza-counter frame is **missing** from
   `~/Documents/Temp Edit Photos/Film` and is one of the three best.
5. **ffmpeg / video** — still unresolved from the previous project. Standing
   preference is to supply converted assets rather than install tooling.

---

## Settled — the derivative cache (decided 2026-09-04)

**mtime freshness will not survive a cold CI runner.** `photos:fetch` rewrites
every master with a fresh timestamp, so all derivatives look stale and the whole
ladder re-encodes — exactly what Task 1 exists to prevent.

**Decision: cache `masters/` and `derivatives/` together via `actions/cache`.**
It archives with tar, which preserves mtimes on restore, so `needsRebuild()` in
`scripts/photos/freshness.mjs` keeps working unchanged. Content hashing was the
alternative; it is more portable but buys nothing until the pipeline runs on
more than one machine, and it means a sidecar to write and keep in sync.

**Not implemented yet, and deliberately so.** Neither workflow runs
`photos:fetch` or `photos:build` today — the manifest is committed and the
derivatives are already on Supabase, so a cache step now would archive two empty
directories. Add it in Plan 2, in the same job that first runs the pipeline:

```yaml
- uses: actions/cache@v6
  with:
    path: |
      masters
      derivatives
    key: photos-${{ hashFiles('lib/photo-manifest.json') }}
    restore-keys: photos-
```

Both paths must sit in **one** cache entry. Split across two, a hit on
`derivatives/` alongside a miss on `masters/` restores fresh master mtimes
against old derivatives and re-encodes the whole ladder anyway.

---

## Still to write

- **Plan 2 — CMS backend.** Supabase schema (`trips`, `assets`, `collections`,
  `collection_assets`), RLS, manifest generation from Postgres, GitHub Actions
  ingest triggered by a database webhook → `repository_dispatch`.
- **Plan 3 — `/admin`.** Client-side inside the static site, Supabase Auth.
  Three screens: upload, arrange trip, arrange Selected.

Schema decisions already settled: `status` and `sort_order` on everything, never
a hard delete; `medium` enum (`digital | film`) from day one; `shot_at` nullable
and hand-editable (film scans carry only the scanner's date).

---

## Deliberately out of scope

- **`/engineering`** keeps its 51 hardcoded light-on-dark colours and reports the
  site-wide title "Rutvij Dhotey — Street Photography". It is pinned to dark via
  the `.engineering-page` wrapper and works in both themes. Rebuild later.
- **`lib/gallery-bands.ts` / `gallery-layout.ts`** are referenced by nothing but
  their own 20 tests. Retained on purpose — the pairing algorithm is non-trivial
  and multi-column trip layouts return once trips outgrow a single strip. There
  is a note at the top of the file saying so.
- **Film** is parked. See the memory note for the full findings.

---

## Traps — do not relearn these the hard way

- **Trip slug ≠ storage category.** Trip `japan` keeps `storageCategory: 'city'`.
  Renaming the Supabase prefix means re-uploading 200+ derivatives for nothing.
- **`--accent` changed meaning.** It used to be a near-invisible hairline
  (`rgba(240,237,232,0.06)`); it is now amber. The legacy palette (`--bg`,
  `--bg-eng`, `--text`, `--muted`, `--faint`, `--gap`) is pinned to literal dark
  values in `globals.css` and is **deliberately not theme-aware** — `/engineering`
  hardcodes light-on-dark alongside it and would be unreadable on paper.
- **Two aspect-ratio taxonomies exist on purpose.** `classify()` in
  `gallery-bands.ts` answers "how does this pair in a band?" (0.85/1.3/2.2).
  `frameOrientation()` in `trips.ts` answers "is this too tall for full column
  width?" (1.0). **Do not unify them** — doing so shrank `RJ402666` from 1440px
  to 763px. There is a regression test naming that frame.
- **`svh` misresolves inside iframes.** Use `100vh` with a `100dvh` refinement.
- **`--ar: 4930 / 3944` works in `aspect-ratio` and nowhere else.** `calc()`
  needs the separate numeric `--arn`.
- **The ladder now includes 2560** because the Print Room renders to 1440 CSS px
  = 2880 device px at DPR 2. `RJ400204` is 2304px wide and has no 2560 rung —
  `availableWidths()` handles that; never assume the rung exists.
- **`sizes` must mirror EVERY bound in the CSS width.** The Roll sizes frames by
  height, so a vw-only `sizes` silently over-fetched all 22. If you add a layout,
  check `sizes` against the computed box on the running page, not against intent.
- **`measure.mjs` cannot see the top rung.** `scripts/photos/config.mjs` stops
  `GRID_WIDTHS` at 1800 while `lib/gallery-items.ts` ships 2560, so every figure
  the script reports is below what the site actually serves. Use it for
  before/after ratios, never as the real page weight.
- **Cached candidates mask srcset bugs.** The browser prefers an
  already-downloaded larger rung, so a second page reusing a frame will look
  correct while a cold visit over-fetches. Probe with a cache-busted `srcset`.
- **Screenshots of The Roll come back black.** `will-change: transform` on
  `.roll__track` promotes it to a compositor layer the screenshotter cannot
  read. The page is fine; clear `will-change` before capturing.
- **Supabase HEAD lies about `cache-control`.** Always verify with a ranged GET:
  `curl -s -o /dev/null -D- -r 0-1 "<url>"`.
- **CI cannot run the tests on Node 20.** `lib/*.test.ts` import `.ts` files
  directly and use import attributes, so the suite needs Node's native type
  stripping. `deploy.yml` was pinned to 20 and would have failed the moment
  tests were added to it. Both workflows now read `.nvmrc` (24), `package.json`
  declares `engines.node >= 24`, and `erasableSyntaxOnly` in `tsconfig.json`
  makes `tsc` reject any syntax Node cannot strip — enums, namespaces,
  parameter properties would all typecheck fine and then break `npm test`.
- **`deploy.yml`'s Pages actions are still on old majors** —
  `upload-pages-artifact@v3` and `deploy-pages@v4`, where v5 is current.
  Left alone on purpose: they run only on a real deploy, so no PR can prove an
  upgrade safe. Bump them in their own commit and watch that deploy run.
- **Never modify anything under `masters/`.** Supabase holds the only remote copy
  of 16 of those files.
- **`public/creative/`** has 33 local files, gitignored, zero tracked. It never
  exists in CI, so `out/creative/` cannot shadow the `/creative` redirect there.

---

## Lesson from the build

Four defects surfaced during execution. **All four were errors in the plan, not
the implementation**, and three were invisible to tests, types, and the build:

1. `/engineering` rendered near-white text on paper in light mode — roughly 1:1
   contrast. Everything passed green while the page was unreadable.
2. Every Print Room frame arrived ~24% soft on retina; the ladder was sized for
   the old 674px band layout.
3. The same `asItem()` adapter was written into two components; now one exported
   `frameAsItem()`.
4. A code review's suggested fix was accepted too readily and shrank a frame from
   1440px to 763px.

**Load the running page.** Greps, `tsc` and `npm run build` all pass on a site
that looks wrong.
