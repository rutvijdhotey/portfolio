# Photography-First Rebuild — Implementation Plan (1 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn rutvijdhotey.com from a two-identity split site into a photography-first site: 22 curated frames, a Print Room index at `/photography`, a horizontal-filmstrip trip page at `/photography/[slug]`, and a light/dark theme built on a three-tier token layer.

**Architecture:** Next.js static export to GitHub Pages, unchanged. Photos continue to come from Supabase Storage via the existing derivative ladder — this plan does not touch upload or hosting. Trip slugs are decoupled from storage prefixes so no derivative ever has to move. Theme is a root-class swap over CSS custom properties, dark-first, with the bare `:root` holding the dark set so "no OS signal" resolves to dark.

**Tech Stack:** Next.js 16 (`output: 'export'`), React 19, TypeScript, `sharp` (build-time only), `node:test` + `node:assert/strict`. **No new dependencies.** GSAP is already present and stays only where it already is.

---

## Context an engineer needs before starting

Read `PROGRESS.md` first. Then these facts, all verified on 2026-08-27:

- `masters/` (191 MB) and `derivatives/` (37 MB) are gitignored and exist only on Rutvij's Mac. **Supabase holds the only remote copy of 16 masters** (all 8 Paris, all 8 Bend Oregon). `npm run photos:fetch` is a backup as much as a build step.
- `lib/photo-manifest.json` **is committed** and is the build-time source of truth for dimensions and average colour. Regenerate it with `npm run photos:build`, never by hand.
- Derivatives live at `optimized/<storageCategory>/<id>-<width>.<ext>` on Supabase. `storageCategory` is the *old* category name (`city`, `nature`, `random`, `paris`, `copenhagen`). **Trip slugs in this plan are display-only and must not change storage paths.**
- `npm test` runs `node --test "scripts/**/*.test.mjs" "lib/**/*.test.ts"`. Node 25 strips TS types natively; `.ts` imports need explicit extensions (see `lib/gallery-bands.test.ts`).
- Never run a dev server via `npm run dev` in a background shell — use the Browser pane preview tooling.

### Files created

| File | Responsibility |
|---|---|
| `scripts/photos/freshness.mjs` | Pure predicate: does a derivative need rebuilding? |
| `scripts/photos/freshness.test.mjs` | Tests for the above |
| `scripts/photos/sources.test.mjs` | Locks the 22-frame cut in place |
| `lib/trips.ts` | Trip model; maps display slug → storage category; Selected list |
| `lib/trips.test.ts` | Tests for the above |
| `lib/theme.ts` | Pure theme resolution (stored choice + OS preference → theme) |
| `lib/theme.test.ts` | Tests for the above |
| `lib/roll.ts` | Pure scrub maths for the filmstrip |
| `lib/roll.test.ts` | Tests for the above |
| `lib/print-room.ts` | `sizes` strings for the Print Room layout |
| `lib/print-room.test.ts` | Tests for the above |
| `app/tokens.css` | Three-tier token layer; the only file defining colour |
| `components/ThemeScript.tsx` | Inline head script; stamps the theme before first paint |
| `components/ThemeToggle.tsx` | The user-facing toggle |
| `components/PrintRoom.tsx` | Single-column large-frame layout |
| `components/Roll.tsx` | Sticky horizontal filmstrip |
| `app/photography/page.tsx` | Selected index |
| `app/photography/photography.css` | Print Room styles |
| `app/photography/[slug]/page.tsx` | Trip page |
| `app/photography/[slug]/roll.css` | Filmstrip styles |
| `app/about/page.tsx` | About + colophon |
| `app/about/about.css` | About styles |

### Files modified

| File | Change |
|---|---|
| `scripts/photos/sources.mjs` | Cut 39 → 22 frames |
| `scripts/photos/build-derivatives.mjs` | Skip derivatives already newer than their master |
| `app/globals.css` | Import `tokens.css`; drop the old inline palette |
| `app/layout.tsx` | Mount `ThemeScript`; per-page metadata support |
| `app/page.tsx` | Rewritten as the identity landing page |
| `app/creative/page.tsx` | Replaced with a redirect stub to `/photography` |
| `app/home.css` | Rewritten for the new landing page |

### Deleted at the end (Task 11, after everything else is green)

`app/creative/creative.css`, `components/GalleryFlow.tsx`, `components/gallery.css` — superseded. `OverlayViewer` and `Photo` are **kept**.

---

## Task 1: Make derivative builds incremental

Today `build-derivatives.mjs` re-encodes every width × every format on every run — 390 encodes for 39 photos. AVIF at `effort: 6` on a 7008px master is slow, and this script has to run on a GitHub runner in plan 2. It needs to skip work that is already done.

**Files:**
- Create: `scripts/photos/freshness.mjs`
- Create: `scripts/photos/freshness.test.mjs`
- Modify: `scripts/photos/build-derivatives.mjs`

- [ ] **Step 1: Write the failing test**

Create `scripts/photos/freshness.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { needsRebuild } from './freshness.mjs'

test('a missing derivative always needs rebuilding', () => {
  assert.equal(needsRebuild(null, 1000), true)
  assert.equal(needsRebuild(undefined, 1000), true)
})

test('a derivative older than its master needs rebuilding', () => {
  assert.equal(needsRebuild(500, 1000), true)
})

test('a derivative newer than its master is left alone', () => {
  assert.equal(needsRebuild(1500, 1000), false)
})

test('equal timestamps count as fresh', () => {
  assert.equal(needsRebuild(1000, 1000), false)
})

test('force overrides freshness', () => {
  assert.equal(needsRebuild(1500, 1000, true), true)
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test 2>&1 | grep -A2 freshness`
Expected: FAIL — `Cannot find module './freshness.mjs'`

- [ ] **Step 3: Write the implementation**

Create `scripts/photos/freshness.mjs`:

```js
// scripts/photos/freshness.mjs
// Pure freshness predicate. No I/O — safe to import from tests.

/**
 * Should a derivative be re-encoded?
 *
 * @param {number|null|undefined} destMtimeMs  mtime of the derivative, or null/undefined if absent
 * @param {number} srcMtimeMs                  mtime of the master
 * @param {boolean} [force]                    ignore freshness and rebuild anyway
 * @returns {boolean}
 */
export function needsRebuild(destMtimeMs, srcMtimeMs, force = false) {
  if (force) return true
  if (destMtimeMs === null || destMtimeMs === undefined) return true
  return destMtimeMs < srcMtimeMs
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test 2>&1 | tail -8`
Expected: `pass 34`, `fail 0` (29 existing + 5 new)

- [ ] **Step 5: Wire it into the build script**

Replace the whole body of `scripts/photos/build-derivatives.mjs` with:

```js
// scripts/photos/build-derivatives.mjs
// masters/ -> derivatives/ (AVIF + WebP ladder) + lib/photo-manifest.json
//
// Incremental: a derivative newer than its master is left alone. Pass --force
// to re-encode everything. The manifest is always rebuilt in full — reading
// metadata is cheap, and a partial manifest would be a broken manifest.

import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import sharp from 'sharp'
import {
  ALL_WIDTHS, FORMATS, MASTERS_DIR, DERIVATIVES_DIR, MANIFEST_PATH,
} from './config.mjs'
import { photoId, derivativeKey } from './urls.mjs'
import { SOURCE_PHOTOS } from './sources.mjs'
import { needsRebuild } from './freshness.mjs'

const FORCE = process.argv.includes('--force')

/** mtime in ms, or null when the file does not exist. */
async function mtimeMs(path) {
  try {
    return (await stat(path)).mtimeMs
  } catch {
    return null
  }
}

/** Average colour, used as a placeholder tint while a photo loads. */
async function averageColour(image) {
  const { data } = await image.clone().resize(1, 1, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true })
  const hex = n => n.toString(16).padStart(2, '0')
  return `#${hex(data[0])}${hex(data[1])}${hex(data[2])}`
}

const manifest = {}
let built = 0, skipped = 0, totalOut = 0

for (const { category, filename } of SOURCE_PHOTOS) {
  const id = photoId(filename)
  const srcPath = join(MASTERS_DIR, category, filename)
  const srcMtime = await mtimeMs(srcPath)
  if (srcMtime === null) throw new Error(`Master missing: ${srcPath} — run npm run photos:fetch first`)

  const input = await readFile(srcPath)
  const image = sharp(input, { failOn: 'none' })
  const meta = await image.metadata()

  // EXIF orientation 5-8 swap width and height when rendered.
  const swap = meta.orientation >= 5
  const width = swap ? meta.height : meta.width
  const height = swap ? meta.width : meta.height

  manifest[id] = {
    category,
    width,
    height,
    tint: await averageColour(image),
  }

  for (const w of ALL_WIDTHS) {
    if (w > width) continue // never upscale
    for (const { ext, options } of FORMATS) {
      const key = derivativeKey(category, id, w, ext)
      const dest = join(DERIVATIVES_DIR, key)

      if (!needsRebuild(await mtimeMs(dest), srcMtime, FORCE)) {
        skipped++
        continue
      }

      await mkdir(dirname(dest), { recursive: true })
      const buf = await sharp(input, { failOn: 'none' })
        .rotate()                       // bake in EXIF orientation
        .resize({ width: w, withoutEnlargement: true })
        [ext](options)
        .toBuffer()
      await writeFile(dest, buf)
      built++
      totalOut += buf.length
    }
  }
  console.log(`  ${id.padEnd(28)} ${width}x${height}  ${manifest[id].tint}`)
}

await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\n${Object.keys(manifest).length} photos in the manifest`)
console.log(`${built} derivatives written (${(totalOut / 1048576).toFixed(1)} MB), ${skipped} already current`)
console.log(`Manifest written to ${MANIFEST_PATH}`)
```

- [ ] **Step 6: Verify incrementality against the real masters**

Run: `npm run photos:build 2>&1 | tail -3`
Expected first run: some derivatives written (any that drifted), rest skipped.

Run it a second time: `npm run photos:build 2>&1 | tail -3`
Expected: `0 derivatives written (0.0 MB), 274 already current`

If the second run writes anything, freshness is broken — stop and fix before continuing.

- [ ] **Step 7: Confirm the manifest did not change**

Run: `git diff --stat lib/photo-manifest.json`
Expected: no output. The manifest must be byte-identical — this task changes encoding behaviour, not data.

- [ ] **Step 8: Commit**

```bash
git add scripts/photos/freshness.mjs scripts/photos/freshness.test.mjs scripts/photos/build-derivatives.mjs
git commit -m "perf(pipeline): skip derivatives that are already current

Re-encoding all 390 derivatives on every run made the pipeline unusable
in CI. A derivative newer than its master is now left alone; --force
restores the old behaviour."
```

---

## Task 2: The cut — 39 frames down to 22

Removes the Bend Oregon set, the "Random" bucket (four more outdoor frames from the same register), and five weaker frames inside the surviving trips. Nothing is deleted from Supabase — the derivatives simply stop being referenced.

**Files:**
- Modify: `scripts/photos/sources.mjs`
- Create: `scripts/photos/sources.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `scripts/photos/sources.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SOURCE_PHOTOS } from './sources.mjs'
import { photoId } from './urls.mjs'

const ids = SOURCE_PHOTOS.map(p => photoId(p.filename))
const categories = [...new Set(SOURCE_PHOTOS.map(p => p.category))]

test('the corpus is the 22 curated frames', () => {
  assert.equal(SOURCE_PHOTOS.length, 22)
})

test('only the three surviving trips remain', () => {
  assert.deepEqual(categories.sort(), ['city', 'copenhagen', 'paris'])
})

test('per-trip counts are 8 Japan, 9 Copenhagen, 5 Paris', () => {
  const count = c => SOURCE_PHOTOS.filter(p => p.category === c).length
  assert.equal(count('city'), 8)
  assert.equal(count('copenhagen'), 9)
  assert.equal(count('paris'), 5)
})

test('the five individually cut frames are gone', () => {
  for (const cut of ['RJ405649', 'RJ402306', 'RJ402597', 'RJ402656', 'RJ400161']) {
    assert.ok(!ids.includes(cut), `${cut} should have been cut`)
  }
})

test('no frame appears twice', () => {
  assert.equal(new Set(ids).size, ids.length)
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test 2>&1 | grep -c "not ok"`
Expected: a non-zero count — the corpus is still 39.

- [ ] **Step 3: Apply the cut**

Replace `scripts/photos/sources.mjs` in full:

```js
// scripts/photos/sources.mjs
// The canonical list of photos in the portfolio, in display order.
//
// Cut from 39 to 22 on 2026-08-27. Removed entirely: the 8 Bend Oregon
// frames and the 4 "Random" frames, which were the same register — bright,
// outdoors, people at leisure — and pulled against the night-street work
// that the rest of the site is. Five more went individually:
//   RJ405649  Japan, flat daytime street, the one frame with no light in it
//   RJ402306  Paris, posed portrait by the Seine
//   RJ402597  Paris, generic blue-sky street
//   RJ402656  Paris, posed portrait at the Moulin Rouge
//   RJ400161  Copenhagen, couple in a library
// Nothing was deleted from Supabase. These derivatives simply go unreferenced.

const list = (category, filenames) => filenames.map(filename => ({ category, filename }))

export const SOURCE_PHOTOS = [
  // Japan — storage category is `city` and must stay that way, or every
  // derivative URL changes and 200+ files need re-uploading for no gain.
  ...list('city', [
    'RJ405760.jpg', 'RJ405690.jpg', 'RJ405702.jpg', 'RJ405650.jpg',
    'RJ405757.jpg', 'RJ405776.jpg', 'RJ405808.jpg', 'RJ405710 copy.jpg',
  ]),
  ...list('copenhagen', [
    'RJ400008.jpg', 'RJ400034.jpg', 'RJ400074.jpg', 'RJ400173.jpg',
    'RJ400190.jpg', 'RJ400204.jpg', 'RJ400207.jpg', 'RJ409387.jpg',
    'RJ409814.jpg',
  ]),
  ...list('paris', [
    'RJ402344.jpg', 'RJ402371.jpg', 'RJ402536.jpg', 'RJ402605.jpg',
    'RJ402666.jpg',
  ]),
]
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test 2>&1 | tail -8`
Expected: `pass 39`, `fail 0`

- [ ] **Step 5: Regenerate the manifest**

Run: `npm run photos:build 2>&1 | tail -3`
Expected: `22 photos in the manifest`, `0 derivatives written`, `~154 already current`

- [ ] **Step 6: Verify the manifest shrank correctly**

Run: `node -e "const m=require('./lib/photo-manifest.json');console.log(Object.keys(m).length, [...new Set(Object.values(m).map(v=>v.category))].sort().join(','))"`
Expected: `22 city,copenhagen,paris`

- [ ] **Step 7: Commit**

```bash
git add scripts/photos/sources.mjs scripts/photos/sources.test.mjs lib/photo-manifest.json
git commit -m "feat(gallery): cut the corpus from 39 frames to 22

Oregon and Random went entirely — same register, and they pulled against
the night-street work. Five weaker frames went from the surviving trips.
Nothing removed from Supabase; the derivatives are simply unreferenced."
```

---

## Task 3: The trip model

Replaces flat categories with trips. The trip slug is what appears in URLs; the storage category is what appears in Supabase paths. They are deliberately different.

**Files:**
- Create: `lib/trips.ts`
- Create: `lib/trips.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/trips.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TRIPS, tripBySlug, tripFrames, selectedFrames, SELECTED_IDS } from './trips.ts'

test('there are three trips, newest first', () => {
  assert.deepEqual(TRIPS.map(t => t.slug), ['paris', 'copenhagen', 'japan'])
})

test('trip slugs are decoupled from storage categories', () => {
  assert.equal(tripBySlug('japan')?.storageCategory, 'city')
  assert.equal(tripBySlug('paris')?.storageCategory, 'paris')
})

test('tripBySlug returns undefined for an unknown slug', () => {
  assert.equal(tripBySlug('oregon'), undefined)
})

test('every trip resolves to the right number of frames', () => {
  assert.equal(tripFrames('japan').length, 8)
  assert.equal(tripFrames('copenhagen').length, 9)
  assert.equal(tripFrames('paris').length, 5)
})

test('frames carry the trip slug, not the storage category', () => {
  for (const f of tripFrames('japan')) assert.equal(f.tripSlug, 'japan')
})

test('every trip has at least one frame', () => {
  for (const t of TRIPS) assert.ok(tripFrames(t.slug).length > 0, `${t.slug} is empty`)
})

test('Selected is exactly twelve frames', () => {
  assert.equal(SELECTED_IDS.length, 12)
  assert.equal(selectedFrames().length, 12)
})

test('every Selected id exists in the manifest', () => {
  const resolved = selectedFrames().map(f => f.id)
  assert.deepEqual(resolved, SELECTED_IDS)
})

test('Selected preserves its authored order', () => {
  assert.equal(selectedFrames()[0].id, 'RJ405710-copy')
})

test('no id appears twice in Selected', () => {
  assert.equal(new Set(SELECTED_IDS).size, SELECTED_IDS.length)
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test 2>&1 | grep -m1 "trips"`
Expected: FAIL — `Cannot find module './trips.ts'`

- [ ] **Step 3: Write the implementation**

Create `lib/trips.ts`:

```ts
// lib/trips.ts
// The trip model. A trip is the unit of work on this site.
//
// `slug` is what appears in a URL. `storageCategory` is what appears in a
// Supabase path. They are deliberately different: renaming the storage
// prefix would mean re-uploading every derivative for no gain.

import manifest from './photo-manifest.json'

export interface Trip {
  /** URL segment: /photography/<slug> */
  slug: string
  title: string
  /** Shown under the title. Place, not category. */
  place: string
  year: number
  /** Prefix under optimized/ on Supabase. Never change this. */
  storageCategory: string
  blurb: string
}

export interface Frame {
  id: string
  tripSlug: string
  width: number
  height: number
  tint: string
  alt: string
  /** 'tall' below 0.95, otherwise 'wide'. Drives layout, nothing else. */
  orientation: 'tall' | 'wide'
}

/** Newest first — the index reads as a body of work in reverse chronology. */
export const TRIPS: Trip[] = [
  {
    slug: 'paris',
    title: 'Paris',
    place: 'France',
    year: 2026,
    storageCategory: 'paris',
    blurb: 'Facades, and the people who walk past them without looking up.',
  },
  {
    slug: 'copenhagen',
    title: 'Copenhagen',
    place: 'Denmark',
    year: 2025,
    storageCategory: 'copenhagen',
    blurb: 'Bicycles, stairwells, and the particular grey the harbour turns just before it rains.',
  },
  {
    slug: 'japan',
    title: 'Japan',
    place: 'Tokyo & Osaka',
    year: 2023,
    storageCategory: 'city',
    blurb: 'Neon after rain. Most of these were taken standing still for a long time.',
  },
]

export function tripBySlug(slug: string): Trip | undefined {
  return TRIPS.find(t => t.slug === slug)
}

type ManifestEntry = { category: string; width: number; height: number; tint: string }
const entries = Object.entries(manifest) as [string, ManifestEntry][]

function toFrame(id: string, m: ManifestEntry, trip: Trip): Frame {
  return {
    id,
    tripSlug: trip.slug,
    width: m.width,
    height: m.height,
    tint: m.tint,
    alt: `${trip.title} — ${trip.place}`,
    orientation: m.width / m.height < 0.95 ? 'tall' : 'wide',
  }
}

/** Frames for one trip, in manifest order. Empty array for an unknown slug. */
export function tripFrames(slug: string): Frame[] {
  const trip = tripBySlug(slug)
  if (!trip) return []
  return entries
    .filter(([, m]) => m.category === trip.storageCategory)
    .map(([id, m]) => toFrame(id, m, trip))
}

/** Every frame on the site, trip order then manifest order. */
export function allFrames(): Frame[] {
  return TRIPS.flatMap(t => tripFrames(t.slug))
}

/**
 * The Selected cut — the front door. Fixed length by design: nothing enters
 * without displacing something. Sequenced by feel, not by trip or date.
 */
export const SELECTED_IDS: string[] = [
  'RJ405710-copy',  // Japan   — B&W, umbrella on the steps
  'RJ400008',       // Copenhagen — warm stairwell
  'RJ402605',       // Paris   — figure passing an ornate facade
  'RJ405690',       // Japan   — Dotonbori crowd
  'RJ400173',       // Copenhagen — B&W bicycles
  'RJ405702',       // Japan   — izakaya lanterns
  'RJ402666',       // Paris   — green coat, man in a suit
  'RJ400204',       // Copenhagen — B&W, doorway
  'RJ405757',       // Japan   — neon alley
  'RJ409814',       // Copenhagen — B&W, figures in the park
  'RJ402371',       // Paris   — lamp against an orange sky
  'RJ405650',       // Japan   — Shinjuku walkway
]

/** Selected frames in authored order. Throws if an id has gone stale. */
export function selectedFrames(): Frame[] {
  const byId = new Map(allFrames().map(f => [f.id, f]))
  return SELECTED_IDS.map(id => {
    const frame = byId.get(id)
    if (!frame) throw new Error(`SELECTED_IDS references a frame not in the manifest: ${id}`)
    return frame
  })
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test 2>&1 | tail -8`
Expected: `pass 49`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add lib/trips.ts lib/trips.test.ts
git commit -m "feat(gallery): add the trip model

Trips replace flat categories as the unit of work. Slug is decoupled from
storage category so derivative URLs never move. Selected is a fixed
twelve-frame list, sequenced by feel."
```

---

## Task 4: The token layer and theme resolution

Three tiers: primitives → semantic → components. Only the semantic tier changes between themes. Dark-first: the bare `:root` holds the dark set, so a viewer with no OS signal gets dark.

**Files:**
- Create: `lib/theme.ts`
- Create: `lib/theme.test.ts`
- Create: `app/tokens.css`
- Create: `components/ThemeScript.tsx`
- Create: `components/ThemeToggle.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write the failing test**

Create `lib/theme.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveTheme, nextTheme, THEME_STORAGE_KEY } from './theme.ts'

test('an explicit stored choice always wins', () => {
  assert.equal(resolveTheme('light', false), 'light')
  assert.equal(resolveTheme('dark', true), 'dark')
})

test('with no stored choice, a light OS gives light', () => {
  assert.equal(resolveTheme(null, true), 'light')
})

test('with no stored choice and no signal, the default is dark', () => {
  assert.equal(resolveTheme(null, false), 'dark')
})

test('a junk stored value is ignored', () => {
  assert.equal(resolveTheme('sepia', true), 'light')
  assert.equal(resolveTheme('', false), 'dark')
})

test('nextTheme flips', () => {
  assert.equal(nextTheme('dark'), 'light')
  assert.equal(nextTheme('light'), 'dark')
})

test('the storage key is stable', () => {
  assert.equal(THEME_STORAGE_KEY, 'theme')
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test 2>&1 | grep -m1 theme`
Expected: FAIL — `Cannot find module './theme.ts'`

- [ ] **Step 3: Write the theme module**

Create `lib/theme.ts`:

```ts
// lib/theme.ts
// Pure theme resolution. No DOM access — safe to unit test.

export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'theme'

/**
 * Resolve the theme to apply.
 *
 * Precedence: the visitor's explicit choice, then the OS preference, then
 * dark. Dark is the default because the photographs were made at night and
 * that is their better presentation — but a stated OS preference is a real
 * signal and is respected.
 */
export function resolveTheme(stored: string | null, prefersLight: boolean): Theme {
  if (stored === 'dark' || stored === 'light') return stored
  return prefersLight ? 'light' : 'dark'
}

export function nextTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark'
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test 2>&1 | tail -8`
Expected: `pass 55`, `fail 0`

- [ ] **Step 5: Write the token layer**

Create `app/tokens.css`:

```css
/* app/tokens.css
   The only file in this repo that defines a colour.
   Components read tier 2. Tier 1 never changes. Theming swaps tier 2 only.

   The amber accent is hue 33 degrees — the measured mean tint of the 22
   frames in the manifest. The ground stays near-neutral on purpose: nine of
   the twenty-two frames are near-monochrome, and warmth in the surrounding
   surface makes true black-and-white read as sepia. */

/* ── Tier 1 · primitives ─────────────────────────────────────── */
:root {
  --ink-950:#0a0a0a;
  --ink-900:#141210;
  --ink-300:#8a8378;
  --ink-100:#f0ede8;

  --paper-050:#f1efec;
  --paper-100:#e7e4df;
  --paper-600:#6b6358;
  --paper-900:#302a21;

  --amber-400:#e8a24d;
  --amber-700:#b8701a;

  --ease-out:cubic-bezier(0.23,1,0.32,1);
}

/* ── Tier 2 · semantic · DARK is the bare :root ──────────────────
   A viewer with no OS signal gets this set. That is the decision. */
:root {
  --surface:var(--ink-950);
  --surface-raised:var(--ink-900);
  --content:var(--ink-100);
  --content-muted:var(--ink-300);
  --content-rgb:240 237 232;
  --accent:var(--amber-400);
  --hairline:rgb(240 237 232 / 0.12);
  /* A photograph on paper floats without an edge; on black it must not have one. */
  --frame-edge:none;
}

/* A light OS preference, unless the visitor explicitly chose dark. */
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --surface:var(--paper-050);
    --surface-raised:#ffffff;
    --content:var(--paper-900);
    --content-muted:var(--paper-600);
    --content-rgb:48 42 33;
    --accent:var(--amber-700);
    --hairline:rgb(48 42 33 / 0.14);
    --frame-edge:0 0 0 1px rgb(48 42 33 / 0.10);
  }
}

/* The toggle wins in both directions. */
:root[data-theme="light"] {
  --surface:var(--paper-050);
  --surface-raised:#ffffff;
  --content:var(--paper-900);
  --content-muted:var(--paper-600);
  --content-rgb:48 42 33;
  --accent:var(--amber-700);
  --hairline:rgb(48 42 33 / 0.14);
  --frame-edge:0 0 0 1px rgb(48 42 33 / 0.10);
}
:root[data-theme="dark"] {
  --surface:var(--ink-950);
  --surface-raised:var(--ink-900);
  --content:var(--ink-100);
  --content-muted:var(--ink-300);
  --content-rgb:240 237 232;
  --accent:var(--amber-400);
  --hairline:rgb(240 237 232 / 0.12);
  --frame-edge:none;
}
```

- [ ] **Step 6: Rewrite globals.css against the tokens**

Replace `app/globals.css` in full:

```css
@import "tailwindcss";
@import "./tokens.css";

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --serif: var(--font-serif), 'Georgia', serif;
  --sans: var(--font-sans), 'Helvetica Neue', Arial, sans-serif;
  --col: min(1440px, 92vw);
}

html { scroll-behavior: smooth; }

body {
  background: var(--surface);
  color: var(--content);
  font-family: var(--serif);
  overflow-x: hidden;
}

a { color: inherit; text-decoration: none; }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 7: Write the no-flash theme script**

Create `components/ThemeScript.tsx`:

```tsx
// components/ThemeScript.tsx
// Stamps data-theme on <html> before first paint, so a light-mode visitor
// never sees a black flash. Must stay inline and synchronous. The logic is
// a hand-inlined copy of lib/theme.ts resolveTheme — keep them in step.

const SCRIPT = `(function(){try{
var s=localStorage.getItem('theme');
var l=window.matchMedia('(prefers-color-scheme: light)').matches;
document.documentElement.dataset.theme=(s==='dark'||s==='light')?s:(l?'light':'dark');
}catch(e){}})();`

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}
```

- [ ] **Step 8: Write the toggle**

Create `components/ThemeToggle.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { resolveTheme, nextTheme, THEME_STORAGE_KEY, type Theme } from '@/lib/theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
    setTheme(resolveTheme(stored, prefersLight))
  }, [])

  function flip() {
    if (!theme) return
    const next = nextTheme(theme)
    document.documentElement.dataset.theme = next
    localStorage.setItem(THEME_STORAGE_KEY, next)
    setTheme(next)
  }

  // Render nothing until the client knows the theme, so the label is never wrong.
  if (!theme) return <span className="theme-toggle" aria-hidden="true" />

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={flip}
      aria-label={`Switch to ${nextTheme(theme)} theme`}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
```

- [ ] **Step 9: Mount the script in the layout**

Replace `app/layout.tsx` in full:

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import ThemeScript from '@/components/ThemeScript'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://rutvijdhotey.com'),
  title: {
    default: 'Rutvij Dhotey — Street Photography',
    template: '%s — Rutvij Dhotey',
  },
  description: 'Street photography from Japan, Copenhagen and Paris. Cities, mostly after dark.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body className={`${fraunces.variable} ${dmSans.variable}`}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 10: Confirm the build still succeeds**

Run: `npm run build 2>&1 | tail -12`
Expected: build completes, routes listed, no errors.

- [ ] **Step 11: Commit**

```bash
git add app/tokens.css app/globals.css app/layout.tsx lib/theme.ts lib/theme.test.ts components/ThemeScript.tsx components/ThemeToggle.tsx
git commit -m "feat(theme): three-tier token layer with OS-aware dark default

Primitives, semantic, components. Only the semantic tier changes between
themes. Dark is the bare :root so no-signal resolves to dark; a light OS
preference is respected; the toggle overrides both and persists."
```

---

## Task 5: Print Room sizing helpers

The `sizes` attribute decides which rung of the ladder a browser downloads. Getting it wrong means either a soft photograph or a wasted megabyte. Pure functions, tested.

**Files:**
- Create: `lib/print-room.ts`
- Create: `lib/print-room.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/print-room.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { printSizes, PRINT_MAX, TALL_MAX } from './print-room.ts'

test('a wide frame fills the column', () => {
  assert.equal(printSizes('wide'), '(max-width: 768px) 92vw, min(1440px, 92vw)')
})

test('a tall frame is held back so it fits the viewport height', () => {
  assert.equal(printSizes('tall'), '(max-width: 768px) 92vw, min(720px, 53vw)')
})

test('the documented maxima match the sizes strings', () => {
  assert.equal(PRINT_MAX, 1440)
  assert.equal(TALL_MAX, 720)
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test 2>&1 | grep -m1 "print-room"`
Expected: FAIL — `Cannot find module './print-room.ts'`

- [ ] **Step 3: Write the implementation**

Create `lib/print-room.ts`:

```ts
// lib/print-room.ts
// Rendered widths for the Print Room layout.
//
// A wide frame takes the full content column. A tall frame is deliberately
// held back — a 2:3 frame at full column width runs far past the viewport
// and the visitor scrolls through one photograph.

export const PRINT_MAX = 1440
export const TALL_MAX = 720

export function printSizes(orientation: 'wide' | 'tall'): string {
  return orientation === 'tall'
    ? `(max-width: 768px) 92vw, min(${TALL_MAX}px, 53vw)`
    : `(max-width: 768px) 92vw, min(${PRINT_MAX}px, 92vw)`
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test 2>&1 | tail -8`
Expected: `pass 58`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add lib/print-room.ts lib/print-room.test.ts
git commit -m "feat(gallery): Print Room sizing helpers"
```

---

## Task 6: The Print Room component and /photography

**Files:**
- Create: `components/PrintRoom.tsx`
- Create: `app/photography/page.tsx`
- Create: `app/photography/photography.css`

- [ ] **Step 1: Write the component**

Create `components/PrintRoom.tsx`:

```tsx
'use client'

import Photo from './Photo'
import { printSizes, type Frame } from '@/lib/print-room-types'
import type { GalleryItem } from '@/lib/gallery-items'

interface Props {
  frames: Frame[]
  onFrameClick?: (index: number) => void
}

/** Frame -> the shape Photo already expects. */
function asItem(f: Frame): GalleryItem {
  return {
    id: f.id,
    category: f.storageCategory as GalleryItem['category'],
    width: f.width,
    height: f.height,
    tint: f.tint,
    alt: f.alt,
  }
}

export default function PrintRoom({ frames, onFrameClick }: Props) {
  return (
    <div className="print-room">
      {frames.map((f, i) => (
        <figure key={f.id} className="print-frame" data-orient={f.orientation}>
          <Photo
            item={asItem(f)}
            sizes={printSizes(f.orientation)}
            priority={i === 0}
            onClick={onFrameClick ? () => onFrameClick(i) : undefined}
          />
          <figcaption className="print-cap">
            <span>{f.tripTitle}</span>
            <span className="print-cap__n">{String(i + 1).padStart(2, '0')}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add the fields the component needs to the Frame type**

`Photo` needs `storageCategory` to build derivative URLs, and the caption needs `tripTitle`. Modify `lib/trips.ts`: add two fields to the `Frame` interface and populate them in `toFrame`.

In `lib/trips.ts`, replace the `Frame` interface with:

```ts
export interface Frame {
  id: string
  tripSlug: string
  /** Trip title, for captions. */
  tripTitle: string
  /** Supabase prefix under optimized/. Needed to build derivative URLs. */
  storageCategory: string
  width: number
  height: number
  tint: string
  alt: string
  /** 'tall' below 0.95, otherwise 'wide'. Drives layout, nothing else. */
  orientation: 'tall' | 'wide'
}
```

and replace `toFrame` with:

```ts
function toFrame(id: string, m: ManifestEntry, trip: Trip): Frame {
  return {
    id,
    tripSlug: trip.slug,
    tripTitle: trip.title,
    storageCategory: trip.storageCategory,
    width: m.width,
    height: m.height,
    tint: m.tint,
    alt: `${trip.title} — ${trip.place}`,
    orientation: m.width / m.height < 0.95 ? 'tall' : 'wide',
  }
}
```

Create `lib/print-room-types.ts` so the component imports one place:

```ts
// lib/print-room-types.ts
export { printSizes, PRINT_MAX, TALL_MAX } from './print-room.ts'
export type { Frame } from './trips.ts'
```

- [ ] **Step 3: Add a test for the new fields**

Append to `lib/trips.test.ts`:

```ts
test('frames carry the storage category so derivative URLs resolve', () => {
  for (const f of tripFrames('japan')) assert.equal(f.storageCategory, 'city')
})

test('frames carry the trip title for captions', () => {
  for (const f of tripFrames('copenhagen')) assert.equal(f.tripTitle, 'Copenhagen')
})

test('Copenhagen contributes the only tall frames', () => {
  const tall = allFrames().filter(f => f.orientation === 'tall')
  assert.equal(tall.length, 3)
  for (const f of tall) assert.equal(f.tripSlug, 'copenhagen')
})
```

Add `allFrames` to the import at the top of `lib/trips.test.ts`.

- [ ] **Step 4: Run tests**

Run: `npm test 2>&1 | tail -8`
Expected: `pass 61`, `fail 0`

- [ ] **Step 5: Write the styles**

Create `app/photography/photography.css`:

```css
/* app/photography/photography.css */

.ph-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px clamp(18px, 4vw, 44px);
  background: linear-gradient(to bottom, var(--surface), transparent);
}
.ph-nav__name { font-family: var(--serif); font-size: 15px; }
.ph-nav__right { display: flex; gap: 20px; align-items: center; }
.ph-nav__link { font-family: var(--sans); font-size: 12px; color: var(--content-muted); }
.ph-nav__link:hover { color: var(--content); }

.theme-toggle {
  font-family: var(--sans); font-size: 11px; letter-spacing: .08em;
  padding: 6px 12px; border: 1px solid var(--hairline); border-radius: 999px;
  background: transparent; color: var(--content-muted); cursor: pointer;
  transition: color 160ms var(--ease-out), border-color 160ms var(--ease-out);
}
.theme-toggle:hover { color: var(--content); border-color: var(--content-muted); }

.ph-head {
  width: var(--col); margin: 0 auto;
  padding: clamp(150px, 22vh, 260px) 0 clamp(70px, 10vh, 120px);
}
.ph-head__title {
  font-family: var(--serif); font-weight: 300;
  font-size: clamp(44px, 7.2vw, 104px); line-height: .94;
  letter-spacing: -0.02em; text-wrap: balance;
}
.ph-head__sub {
  margin-top: 22px; max-width: 52ch;
  font-family: var(--sans); font-size: 15px; line-height: 1.65;
  color: var(--content-muted);
}

.print-room {
  width: var(--col); max-width: 1440px; margin: 0 auto;
  display: flex; flex-direction: column; gap: clamp(80px, 11vw, 170px);
}
.print-frame { width: 100%; }
.print-frame[data-orient="tall"] { width: min(53%, 720px); margin-inline: auto; }

.print-frame .photo { box-shadow: var(--frame-edge); }

.print-cap {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-top: 12px;
  font-family: var(--sans); font-size: 11px; letter-spacing: .1em;
  text-transform: uppercase; color: var(--content-muted);
}
.print-cap__n { color: var(--accent); font-variant-numeric: tabular-nums; }

.ph-trips {
  width: var(--col); margin: clamp(120px, 16vh, 200px) auto 0;
  border-top: 1px solid var(--hairline); padding-top: 40px;
}
.ph-trips__label {
  font-family: var(--sans); font-size: 11px; letter-spacing: .16em;
  text-transform: uppercase; color: var(--content-muted);
}
.ph-trip {
  display: flex; justify-content: space-between; align-items: baseline; gap: 24px;
  padding: 26px 0; border-bottom: 1px solid var(--hairline);
}
.ph-trip__title { font-family: var(--serif); font-weight: 300; font-size: clamp(26px, 3.4vw, 44px); }
.ph-trip__meta { font-family: var(--sans); font-size: 11px; letter-spacing: .13em;
  text-transform: uppercase; color: var(--content-muted); }
.ph-trip:hover .ph-trip__title { color: var(--accent); }

.ph-foot {
  width: var(--col); margin: clamp(100px, 14vh, 160px) auto 0;
  border-top: 1px solid var(--hairline);
  padding: 40px 0 120px;
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 18px;
  font-family: var(--sans); font-size: 12px; color: var(--content-muted);
}

@media (max-width: 768px) {
  .print-frame[data-orient="tall"] { width: 100%; }
}
```

- [ ] **Step 6: Write the page**

Create `app/photography/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import PrintRoom from '@/components/PrintRoom'
import OverlayViewer from '@/components/OverlayViewer'
import ThemeToggle from '@/components/ThemeToggle'
import { selectedFrames, TRIPS, tripFrames } from '@/lib/trips'
import type { GalleryItem } from '@/lib/gallery-items'
import './photography.css'

const frames = selectedFrames()

const overlayItems: GalleryItem[] = frames.map(f => ({
  id: f.id,
  category: f.storageCategory as GalleryItem['category'],
  width: f.width,
  height: f.height,
  tint: f.tint,
  alt: f.alt,
}))

export default function PhotographyPage() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <>
      <nav className="ph-nav">
        <Link href="/" className="ph-nav__name">Rutvij Dhotey</Link>
        <div className="ph-nav__right">
          <Link href="/about" className="ph-nav__link">About</Link>
          <ThemeToggle />
        </div>
      </nav>

      <header className="ph-head">
        <h1 className="ph-head__title">Cities, mostly<br />after dark.</h1>
        <p className="ph-head__sub">
          Twelve frames from three cities. Neon, rain, and people who didn&rsquo;t know
          they were being photographed.
        </p>
      </header>

      <PrintRoom
        frames={frames}
        onFrameClick={i => { setIndex(i); setOpen(true) }}
      />

      <section className="ph-trips">
        <div className="ph-trips__label">All trips</div>
        {TRIPS.map(t => (
          <Link key={t.slug} href={`/photography/${t.slug}`} className="ph-trip">
            <span className="ph-trip__title">{t.title}</span>
            <span className="ph-trip__meta">
              {t.place} · {t.year} · {tripFrames(t.slug).length} frames
            </span>
          </Link>
        ))}
      </section>

      <OverlayViewer
        items={overlayItems}
        open={open}
        currentIndex={index}
        onClose={() => setOpen(false)}
        onNavigate={setIndex}
      />

      <footer className="ph-foot">
        <span>© 2026 Rutvij Dhotey</span>
        <span>
          <a href="https://instagram.com/intoyourstories" target="_blank" rel="noopener">Instagram</a>
        </span>
      </footer>
    </>
  )
}
```

- [ ] **Step 7: Build and verify the route exists**

Run: `npm run build 2>&1 | grep -E "photography|Error"`
Expected: `/photography` listed as a static route, no errors.

- [ ] **Step 8: Verify in the browser preview**

Start the preview via the Browser pane tooling (never `npm run dev` in a shell), navigate to `/photography`, and check:
- 12 frames render, first one eager, rest lazy
- `read_console_messages` returns no errors
- `read_network_requests` shows `optimized/` AVIF requests and no `-2560` on load

- [ ] **Step 9: Commit**

```bash
git add components/PrintRoom.tsx lib/print-room-types.ts lib/trips.ts lib/trips.test.ts app/photography/
git commit -m "feat(photography): Print Room index at /photography

Twelve Selected frames, single column, large. Replaces the 674px/363px
band pairs with frames up to 1440px."
```

---

## Task 7: The Roll — scrub maths

Pure functions first. The component in Task 8 is then a thin shell over tested logic.

**Files:**
- Create: `lib/roll.ts`
- Create: `lib/roll.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/roll.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rollProgress, trackOffset, activeIndex, rollHeightPx } from './roll.ts'

test('progress is 0 before the roll and 1 after it', () => {
  // roll spans document y 1000..3000, viewport 500 => scrollable range 1500
  assert.equal(rollProgress(500, 1000, 2000, 500), 0)
  assert.equal(rollProgress(1000, 1000, 2000, 500), 0)
  assert.equal(rollProgress(2500, 1000, 2000, 500), 1)
  assert.equal(rollProgress(9999, 1000, 2000, 500), 1)
})

test('progress is linear across the range', () => {
  assert.equal(rollProgress(1750, 1000, 2000, 500), 0.5)
})

test('a roll shorter than the viewport never scrubs', () => {
  assert.equal(rollProgress(1200, 1000, 400, 500), 0)
})

test('trackOffset centres the first frame at progress 0', () => {
  // centres at 100, 300, 500; viewport 1000 => centre is 500
  assert.equal(trackOffset(0, [100, 300, 500], 1000), 400)
})

test('trackOffset centres the last frame at progress 1', () => {
  assert.equal(trackOffset(1, [100, 300, 500], 1000), 0)
})

test('trackOffset interpolates between neighbouring centres', () => {
  // progress .25 over 3 frames => pos 0.5 => halfway between 100 and 300 = 200
  assert.equal(trackOffset(0.25, [100, 300, 500], 1000), 300)
})

test('trackOffset handles a single frame', () => {
  assert.equal(trackOffset(0.7, [250], 1000), 250)
})

test('trackOffset handles an empty strip', () => {
  assert.equal(trackOffset(0.5, [], 1000), 0)
})

test('activeIndex rounds to the nearest frame', () => {
  assert.equal(activeIndex(0, 9), 0)
  assert.equal(activeIndex(1, 9), 8)
  assert.equal(activeIndex(0.5, 9), 4)
  assert.equal(activeIndex(0.4, 9), 3)   // 0.4 * 8 = 3.2
})

test('activeIndex is safe on an empty strip', () => {
  assert.equal(activeIndex(0.5, 0), 0)
})

test('rollHeightPx allows one viewport of scroll per frame plus a sticky screen', () => {
  assert.equal(rollHeightPx(9, 1000, 0.62), 6580)
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test 2>&1 | grep -m1 roll`
Expected: FAIL — `Cannot find module './roll.ts'`

- [ ] **Step 3: Write the implementation**

Create `lib/roll.ts`:

```ts
// lib/roll.ts
// Scrub maths for The Roll.
//
// A trip is a roll of film, so a trip page is a strip of frames. The page
// scrolls VERTICALLY — native, momentum intact, the wheel is never
// intercepted — and the strip translates horizontally in response inside a
// sticky viewport. Hijacking the wheel to scroll sideways breaks momentum,
// find-in-page and the scrollbar, and is the single most complained-about
// pattern in this genre. Don't.

/** Fraction of a viewport height of scrolling per frame. */
export const SCROLL_PER_FRAME = 0.62

/** Where we are through the roll, clamped to 0..1. */
export function rollProgress(
  scrollY: number,
  rollTop: number,
  rollHeight: number,
  viewportHeight: number,
): number {
  const range = rollHeight - viewportHeight
  if (range <= 0) return 0
  return Math.min(1, Math.max(0, (scrollY - rollTop) / range))
}

/**
 * translateX for the strip, so the scrubbed point sits at the viewport centre.
 * `centres` are each frame's centre offset within the track, in track coords.
 */
export function trackOffset(progress: number, centres: number[], viewportWidth: number): number {
  const n = centres.length
  if (n === 0) return 0
  if (n === 1) return viewportWidth / 2 - centres[0]
  const pos = progress * (n - 1)
  const i = Math.min(Math.floor(pos), n - 2)
  const frac = pos - i
  const target = centres[i] + (centres[i + 1] - centres[i]) * frac
  return viewportWidth / 2 - target
}

/** Which frame reads as current. Flips at the halfway point between frames. */
export function activeIndex(progress: number, count: number): number {
  if (count <= 0) return 0
  return Math.round(progress * (count - 1))
}

/** Height of the scroll container: one screen of travel per frame, plus the sticky screen. */
export function rollHeightPx(
  count: number,
  viewportHeight: number,
  perFrame: number = SCROLL_PER_FRAME,
): number {
  return Math.round(count * perFrame * viewportHeight + viewportHeight)
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test 2>&1 | tail -8`
Expected: `pass 72`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add lib/roll.ts lib/roll.test.ts
git commit -m "feat(roll): scrub maths for the filmstrip trip page

Vertical scroll drives horizontal travel. The wheel is never intercepted."
```

---

## Task 8: The Roll component and /photography/[slug]

**Files:**
- Create: `components/Roll.tsx`
- Create: `app/photography/[slug]/page.tsx`
- Create: `app/photography/[slug]/roll.css`

- [ ] **Step 1: Write the styles**

Create `app/photography/[slug]/roll.css`:

```css
/* app/photography/[slug]/roll.css */

.roll { position: relative; }

.roll__stage {
  position: sticky; top: 0;
  height: 100vh; height: 100dvh;   /* svh misresolves inside iframes; vh does not */
  display: flex; align-items: center; overflow: hidden;
}

.roll__track {
  display: flex; align-items: center; gap: clamp(16px, 2.2vw, 40px);
  will-change: transform;
}

/* Bound on BOTH axes. A 16:9 frame at 62vh wants ~1490px, wider than most
   viewports — height alone would crop the frame the visitor is looking at. */
.roll__frame {
  flex: 0 0 auto;
  width: min(72vw, calc(62vh * var(--arn)));
  opacity: .28; filter: saturate(.72);
  transition: opacity 420ms var(--ease-out), filter 420ms var(--ease-out);
}
.roll__frame[data-active="true"] { opacity: 1; filter: none; }
.roll__frame .photo { box-shadow: var(--frame-edge); }

.roll__cap {
  position: absolute; left: clamp(20px, 5vw, 64px); bottom: clamp(84px, 12vh, 124px);
  display: flex; flex-direction: column; gap: 5px; pointer-events: none;
}
.roll__cap b {
  font-family: var(--serif); font-weight: 300;
  font-size: clamp(22px, 3vw, 38px); letter-spacing: -0.01em; color: var(--content);
}
.roll__cap span {
  font-family: var(--sans); font-size: 10.5px; letter-spacing: .15em;
  text-transform: uppercase; color: var(--content-muted);
  font-variant-numeric: tabular-nums;
}

/* Sprocket rail — the frame counter, in the vernacular of the medium. */
.sprockets {
  position: absolute; left: clamp(20px, 5vw, 64px); right: clamp(20px, 5vw, 64px);
  bottom: clamp(40px, 6vh, 64px);
  display: flex; gap: 5px; align-items: center;
}
.sprk {
  flex: 1 1 0; height: 9px; border-radius: 2px;
  background: rgb(var(--content-rgb) / 0.13);
  transition: background 320ms var(--ease-out), transform 320ms var(--ease-out);
}
.sprk[data-on="true"] { background: var(--accent); transform: scaleY(1.5); }

/* Reduced motion: the strip becomes an ordinary stack. */
@media (prefers-reduced-motion: reduce) {
  .roll { height: auto !important; }
  .roll__stage { position: static; height: auto; display: block; }
  .roll__track { flex-direction: column; transform: none !important; gap: clamp(40px, 7vw, 90px); }
  .roll__frame { width: 100%; opacity: 1; filter: none; }
  .roll__cap, .sprockets { display: none; }
  .sprk { transition: none; }
}

@media (max-width: 768px) {
  .roll__frame { width: min(88vw, calc(52vh * var(--arn))); }
}
```

- [ ] **Step 2: Write the component**

Create `components/Roll.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Photo from './Photo'
import { rollProgress, trackOffset, activeIndex, rollHeightPx } from '@/lib/roll'
import type { Frame } from '@/lib/trips'
import type { GalleryItem } from '@/lib/gallery-items'

interface Props {
  frames: Frame[]
  tripTitle: string
  place: string
  year: number
}

function asItem(f: Frame): GalleryItem {
  return {
    id: f.id,
    category: f.storageCategory as GalleryItem['category'],
    width: f.width,
    height: f.height,
    tint: f.tint,
    alt: f.alt,
  }
}

export default function Roll({ frames, tripTitle, place, year }: Props) {
  const rollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const roll = rollRef.current
    const track = trackRef.current
    if (!roll || !track) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let centres: number[] = []
    let pending = false

    function measure() {
      if (!roll || !track) return
      roll.style.height = `${rollHeightPx(frames.length, window.innerHeight)}px`
      centres = Array.from(track.children).map(
        c => (c as HTMLElement).offsetLeft + (c as HTMLElement).offsetWidth / 2,
      )
      paint()
    }

    function paint() {
      if (!roll || !track) return
      const p = rollProgress(window.scrollY, roll.offsetTop, roll.offsetHeight, window.innerHeight)
      const x = trackOffset(p, centres, window.innerWidth)
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`
      setActive(activeIndex(p, frames.length))
    }

    function onScroll() {
      if (pending) return
      pending = true
      requestAnimationFrame(() => { pending = false; paint() })
    }

    measure()
    // clamp()-based gaps shift once the web fonts land
    document.fonts?.ready.then(measure).catch(() => {})

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [frames.length])

  return (
    <div className="roll" ref={rollRef}>
      <div className="roll__stage">
        <div className="roll__track" ref={trackRef}>
          {frames.map((f, i) => (
            <figure
              key={f.id}
              className="roll__frame"
              data-active={i === active}
              style={{ ['--arn' as string]: (f.width / f.height).toFixed(4) }}
            >
              <Photo
                item={asItem(f)}
                sizes="(max-width: 768px) 88vw, 72vw"
                priority={i === 0}
              />
            </figure>
          ))}
        </div>

        <div className="roll__cap">
          <b>{tripTitle}</b>
          <span>
            {place} · {year} · {String(active + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}
          </span>
        </div>

        <div className="sprockets" aria-hidden="true">
          {frames.map((f, i) => <i key={f.id} className="sprk" data-on={i <= active} />)}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write the page**

Create `app/photography/[slug]/page.tsx`:

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Roll from '@/components/Roll'
import ThemeToggle from '@/components/ThemeToggle'
import { TRIPS, tripBySlug, tripFrames } from '@/lib/trips'
import '../photography.css'
import './roll.css'

export function generateStaticParams() {
  return TRIPS.map(t => ({ slug: t.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const trip = tripBySlug(slug)
  if (!trip) return {}
  return {
    title: trip.title,
    description: `${trip.blurb} ${tripFrames(slug).length} frames from ${trip.place}, ${trip.year}.`,
  }
}

export default async function TripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const trip = tripBySlug(slug)
  if (!trip) notFound()
  const frames = tripFrames(slug)

  return (
    <>
      <nav className="ph-nav">
        <Link href="/photography" className="ph-nav__name">← Photography</Link>
        <div className="ph-nav__right">
          <Link href="/about" className="ph-nav__link">About</Link>
          <ThemeToggle />
        </div>
      </nav>

      <header className="ph-head">
        <h1 className="ph-head__title">{trip.title}</h1>
        <p className="ph-head__sub">{trip.blurb}</p>
      </header>

      <Roll frames={frames} tripTitle={trip.title} place={trip.place} year={trip.year} />

      <footer className="ph-foot">
        <Link href="/photography">← All trips</Link>
        <span>© 2026 Rutvij Dhotey</span>
      </footer>
    </>
  )
}
```

- [ ] **Step 4: Build and verify all three trip routes are generated**

Run: `npm run build 2>&1 | grep -E "photography/|Error"`
Expected: `/photography/japan`, `/photography/copenhagen`, `/photography/paris` all listed.

Run: `ls out/photography/`
Expected: `copenhagen  index.html  japan  paris`

- [ ] **Step 5: Verify the scrub in the browser preview**

Navigate to `/photography/copenhagen`. Using `javascript_tool`, confirm at exactly half progress that the active frame is centred:

```js
const roll = document.querySelector('.roll')
window.scrollTo(0, roll.offsetTop + (roll.offsetHeight - innerHeight) * 0.5)
```

Then check the active frame's bounding rect: its horizontal centre must equal `innerWidth / 2`, and `left >= 0 && right <= innerWidth`. If the frame is cropped, `--arn` is not being applied — check the inline style.

- [ ] **Step 6: Commit**

```bash
git add components/Roll.tsx app/photography/\[slug\]/
git commit -m "feat(roll): trip pages as a horizontal filmstrip

Vertical scroll, sticky stage, horizontal travel. Continuous scrub, not
snap. Reduced motion collapses it to a plain stack."
```

---

## Task 9: The landing page

Identity first, then the two doors — with one photograph behind the type so it is not a dead end.

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/home.css`

- [ ] **Step 1: Rewrite the styles**

Replace `app/home.css` in full:

```css
/* app/home.css */

.landing {
  min-height: 100vh; min-height: 100dvh;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative; overflow: hidden;
}

.landing__bg {
  position: absolute; inset: 0; z-index: 0;
  background-size: cover; background-position: center;
  opacity: .30;
}
.landing__bg::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to bottom,
    var(--surface) 0%, rgb(0 0 0 / 0) 40%, var(--surface) 100%);
}

.landing__top, .landing__mid, .landing__bottom {
  position: relative; z-index: 1;
  width: var(--col); margin: 0 auto;
}
.landing__top { padding-top: 30px; display: flex; justify-content: space-between; align-items: center; }
.landing__mid { padding: clamp(50px, 9vh, 110px) 0; }
.landing__bottom { padding-bottom: 44px; }

.landing__name { font-family: var(--serif); font-size: 15px; }

.landing__statement {
  font-family: var(--serif); font-weight: 300;
  font-size: clamp(30px, 4.6vw, 62px); line-height: 1.16;
  letter-spacing: -0.015em; max-width: 20ch; text-wrap: balance;
}
.landing__statement em { font-style: normal; color: var(--accent); }

.landing__doors { display: flex; gap: 40px; flex-wrap: wrap; margin-top: 44px; }
.landing__door {
  font-family: var(--sans); font-size: 14px; letter-spacing: .04em;
  padding-bottom: 6px; border-bottom: 1px solid var(--hairline);
  transition: border-color 200ms var(--ease-out), color 200ms var(--ease-out);
}
.landing__door:hover { color: var(--accent); border-color: var(--accent); }

.landing__meta {
  display: flex; gap: 26px; flex-wrap: wrap;
  font-family: var(--sans); font-size: 11px; letter-spacing: .13em;
  text-transform: uppercase; color: var(--content-muted);
}
```

- [ ] **Step 2: Rewrite the page**

Replace `app/page.tsx` in full:

```tsx
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import './home.css'

/* The Shinjuku walkway frame, already on Supabase as an AVIF cover. */
const HERO = 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/optimized/covers/creative-hero-poster.avif'

export default function Home() {
  return (
    <main className="landing">
      <div className="landing__bg" style={{ backgroundImage: `url(${HERO})` }} />

      <div className="landing__top">
        <span className="landing__name">Rutvij Dhotey</span>
        <ThemeToggle />
      </div>

      <div className="landing__mid">
        <h1 className="landing__statement">
          I&rsquo;m a software engineer at YouTube.
          I also photograph <em>cities after dark</em>.
        </h1>
        <div className="landing__doors">
          <Link href="/photography" className="landing__door">Photography →</Link>
          <Link href="/about" className="landing__door">About &amp; engineering →</Link>
        </div>
      </div>

      <div className="landing__bottom">
        <div className="landing__meta">
          <span>Japan</span><span>Copenhagen</span><span>Paris</span>
          <a href="https://instagram.com/intoyourstories" target="_blank" rel="noopener">@intoyourstories</a>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build 2>&1 | tail -12`
Expected: no errors; `/` listed as static.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/home.css
git commit -m "feat(landing): identity-first landing page

Replaces the 50/50 blind split with a statement, two doors, and one
photograph so it is not a dead end."
```

---

## Task 10: /about with the colophon, and the /creative redirect

**Files:**
- Create: `app/about/page.tsx`
- Create: `app/about/about.css`
- Modify: `app/creative/page.tsx`

- [ ] **Step 1: Write the about styles**

Create `app/about/about.css`:

```css
/* app/about/about.css */

.about { width: var(--col); max-width: 820px; margin: 0 auto; padding: clamp(150px, 22vh, 240px) 0 140px; }

.about h1 {
  font-family: var(--serif); font-weight: 300;
  font-size: clamp(38px, 6vw, 76px); line-height: .98; letter-spacing: -0.02em;
}

.about__body { margin-top: 40px; display: flex; flex-direction: column; gap: 22px; }
.about__body p {
  font-family: var(--sans); font-size: 16px; line-height: 1.7;
  max-width: 62ch; color: var(--content-muted);
}
.about__body strong { color: var(--content); font-weight: 500; }

.about__section {
  margin-top: 76px; padding-top: 30px; border-top: 1px solid var(--hairline);
}
.about__label {
  font-family: var(--sans); font-size: 11px; letter-spacing: .16em;
  text-transform: uppercase; color: var(--content-muted); margin-bottom: 22px;
}
.about__h2 { font-family: var(--serif); font-weight: 300; font-size: clamp(24px, 3vw, 36px); margin-bottom: 18px; }

.colophon { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 26px; }
.colophon div b {
  display: block; font-family: var(--sans); font-size: 11px; letter-spacing: .12em;
  text-transform: uppercase; color: var(--accent); margin-bottom: 7px; font-weight: 500;
}
.colophon div p { font-family: var(--sans); font-size: 13.5px; line-height: 1.6; color: var(--content-muted); }

.about__links { display: flex; gap: 28px; flex-wrap: wrap; margin-top: 26px; }
.about__links a {
  font-family: var(--sans); font-size: 13px;
  padding-bottom: 5px; border-bottom: 1px solid var(--hairline);
}
.about__links a:hover { color: var(--accent); border-color: var(--accent); }
```

- [ ] **Step 2: Write the about page**

Create `app/about/page.tsx`:

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import ThemeToggle from '@/components/ThemeToggle'
import { allFrames, TRIPS } from '@/lib/trips'
import '../photography/photography.css'
import './about.css'

export const metadata: Metadata = {
  title: 'About',
  description: 'Software engineer at YouTube, street photographer. How this site is built.',
}

export default function AboutPage() {
  const frameCount = allFrames().length

  return (
    <>
      <nav className="ph-nav">
        <Link href="/" className="ph-nav__name">Rutvij Dhotey</Link>
        <div className="ph-nav__right">
          <Link href="/photography" className="ph-nav__link">Photography</Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="about">
        <h1>About</h1>

        <div className="about__body">
          <p>
            I&rsquo;m Rutvij. I build software at <strong>YouTube</strong>, and I photograph
            cities — usually at night, usually standing still for longer than is reasonable,
            waiting for someone to walk into the frame.
          </p>
          <p>
            Most of what&rsquo;s here was shot on a Sony A7 IV across{' '}
            {TRIPS.map(t => t.title).join(', ')}. {frameCount} frames survive the edit.
          </p>
        </div>

        <section className="about__section">
          <div className="about__label">Engineering</div>
          <h2 className="about__h2">Into Your Stories</h2>
          <div className="about__body">
            <p>
              A journaling app built around the idea that the hard part isn&rsquo;t writing,
              it&rsquo;s starting. React Native, Supabase, on-device AI prompts.
            </p>
          </div>
          <div className="about__links">
            <Link href="/engineering/into-your-stories">Read the case study →</Link>
          </div>
        </section>

        <section className="about__section">
          <div className="about__label">Colophon</div>
          <h2 className="about__h2">How this site is built</h2>
          <div className="colophon">
            <div>
              <b>The pictures</b>
              <p>
                Masters are processed offline with sharp into an AVIF and WebP ladder at
                five widths, then served from object storage with immutable cache headers.
                Total page weight for the gallery went from 211 MB to 6.9 MB.
              </p>
            </div>
            <div>
              <b>No layout shift</b>
              <p>
                Every photograph&rsquo;s dimensions and average colour are baked into a build-time
                manifest, so space is reserved exactly and the placeholder is the picture&rsquo;s
                own colour rather than grey.
              </p>
            </div>
            <div>
              <b>The site</b>
              <p>
                Next.js exported as static HTML, no server. Themed through a three-tier token
                layer, so switching light and dark swaps one tier and nothing else.
              </p>
            </div>
            <div>
              <b>The filmstrip</b>
              <p>
                Trip pages scroll vertically and travel horizontally. The mouse wheel is never
                intercepted — momentum, the scrollbar and find-in-page all keep working.
              </p>
            </div>
          </div>
        </section>

        <section className="about__section">
          <div className="about__label">Elsewhere</div>
          <div className="about__links">
            <a href="https://github.com/rutvijdhotey" target="_blank" rel="noopener">GitHub</a>
            <a href="https://linkedin.com/in/rutvij-dhotey" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://instagram.com/intoyourstories" target="_blank" rel="noopener">Instagram</a>
            <a href="mailto:rutvij.dhotey@gmail.com">Email</a>
          </div>
        </section>
      </main>
    </>
  )
}
```

- [ ] **Step 3: Replace /creative with a redirect stub**

Every link ever shared points at `/creative`. GitHub Pages cannot issue a 301, so this is a meta-refresh plus a canonical.

Replace `app/creative/page.tsx` in full:

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moved',
  alternates: { canonical: '/photography' },
  robots: { index: false, follow: true },
}

/**
 * /creative moved to /photography on 2026-08-27. GitHub Pages serves static
 * files only and cannot issue a 301, so this page redirects in the browser
 * and points crawlers at the canonical URL. Do not delete it — every link
 * shared before that date lands here.
 */
export default function CreativeMoved() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/photography" />
      <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', gap: 14, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--content-muted)' }}>
          This page is now at /photography.
        </p>
        <Link href="/photography" style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--accent)' }}>
          Continue →
        </Link>
      </main>
    </>
  )
}
```

Delete the now-unused stylesheet:

```bash
git rm app/creative/creative.css
```

- [ ] **Step 4: Build and verify the redirect is actually in the HTML**

Run: `npm run build && grep -o 'url=/photography' out/creative/index.html`
Expected: `url=/photography`

If that grep is empty, React did not hoist the meta tag. Fall back to writing `out/creative/index.html` from a static file in `public/` — and remove the `/public/creative/` line from `.gitignore` first, or the file will be silently untracked.

- [ ] **Step 5: Commit**

```bash
git add app/about/ app/creative/page.tsx
git commit -m "feat(about): /about with colophon, and /creative redirect stub

Engineering arrives through the door a photography site is supposed to
have. /creative meta-refreshes to /photography so shared links survive."
```

---

## Task 11: Remove the superseded code, verify, deploy

**Files:**
- Delete: `components/GalleryFlow.tsx`, `components/gallery.css`
- Keep: `components/Photo.tsx`, `components/OverlayViewer.tsx`, `components/overlay.css`, `lib/gallery-bands.ts`, `lib/gallery-layout.ts`

`gallery-bands.ts` and its 20 tests are kept: Plan 2 reintroduces multi-column layouts for larger trips, and deleting a tested module to re-derive it later is waste.

- [ ] **Step 1: Confirm nothing still imports the deleted files**

Run: `grep -rn "GalleryFlow\|gallery.css" app components lib --include="*.tsx" --include="*.ts" --include="*.css"`
Expected: no output.

If anything appears, fix the import before deleting.

- [ ] **Step 2: Delete**

```bash
git rm components/GalleryFlow.tsx components/gallery.css
```

- [ ] **Step 3: Full test run**

Run: `npm test 2>&1 | tail -8`
Expected: `fail 0`

- [ ] **Step 4: Full build**

Run: `npm run build 2>&1 | tail -20`
Expected: routes `/`, `/about`, `/creative`, `/engineering`, `/engineering/into-your-stories`, `/photography`, `/photography/[slug]` × 3. No errors.

- [ ] **Step 5: Verify every route in the browser preview**

For each of `/`, `/photography`, `/photography/japan`, `/photography/copenhagen`, `/photography/paris`, `/about`, `/creative`:
- `read_console_messages` returns no errors
- `read_page` shows the expected content
- Toggle the theme; confirm `document.documentElement.dataset.theme` flips and `localStorage.theme` persists across a reload
- `resize_window` to mobile; confirm no horizontal body scroll

- [ ] **Step 6: Confirm the weight budget still holds**

Run: `npm run photos:measure 2>&1 | tail -12`
Expected: 22 photos, well under the previous 6.9 MB for 39. Cache-control still `public, max-age=31536000, immutable`.

- [ ] **Step 7: Commit and open the PR**

```bash
git add -A
git commit -m "chore: remove the superseded band gallery

GalleryFlow and gallery.css are replaced by PrintRoom and Roll.
gallery-bands.ts is kept — Plan 2 reintroduces multi-column trip layouts."
git push -u origin feature/photography-first-rebuild
gh pr create --title "Photography-first rebuild" --body "$(cat <<'EOF'
## Summary
- Cuts the corpus from 39 frames to 22
- Replaces the split landing page with an identity-first one
- New `/photography` Print Room index and `/photography/[slug]` filmstrip trip pages
- Three-tier theme tokens; dark default, OS-aware, persisted toggle
- `/creative` redirects to `/photography` so shared links survive
- Derivative builds are now incremental

## Test plan
- `npm test` — all green
- `npm run build` — all routes generated
- Verified every route in the browser preview: no console errors, theme persists, no horizontal scroll on mobile

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-review

**Spec coverage.** Landing page → Task 9. `/photography` Print Room → Tasks 5–6. `/photography/[slug]` The Roll, continuous scrub → Tasks 7–8. The 39→22 cut → Task 2. Trips as the unit, slug decoupled from storage → Task 3. Theme, OS-aware, dark default, toggle persisted → Task 4. `/about` with colophon → Task 10. `/creative` redirect → Task 10. Incremental derivatives → Task 1. `medium` column and `collections` table are **deliberately deferred to Plan 2** — they are database concerns and this plan has no database.

**Type consistency.** `Frame` gains `tripTitle` and `storageCategory` in Task 6 Step 2; every later consumer (`PrintRoom`, `Roll`, `/photography`, `/about`) uses those names. `printSizes` takes `'wide' | 'tall'`, matching `Frame.orientation`. `rollProgress`/`trackOffset`/`activeIndex`/`rollHeightPx` signatures in Task 7 match the calls in Task 8.

**Known gap carried forward.** With film parked, 19 of 22 frames sit at ratio ~1.78. `gallery-bands.ts` would degenerate to identical `[52, 28]` pairs — which is why trip pages use The Roll (a sequence) rather than bands (a grouping). If bands return in Plan 2, `TUNING` must be re-derived against a near-uniform corpus first.
