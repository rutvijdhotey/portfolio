# Floating Collage Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the creative gallery's single-column stagger with floating bands — two or three photos sharing a horizontal band at unequal widths and unequal vertical offsets.

**Architecture:** A pure module, `lib/gallery-bands.ts`, partitions a chapter's photos into bands from their aspect ratios, honouring author overrides. `lib/gallery-layout.ts` keeps the art-direction knobs. `GalleryFlow` renders bands instead of single slots. All grouping logic is testable without a DOM.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, GSAP ScrollTrigger, `node --test` (no new dependencies).

**Spec:** [`docs/superpowers/specs/2026-08-07-floating-collage-gallery-design.md`](../specs/2026-08-07-floating-collage-gallery-design.md)

**Branch:** `feature/photo-pipeline-floating-gallery` (already checked out; nothing pushed)

---

## File structure

| File | Responsibility |
|---|---|
| `lib/gallery-bands.ts` | **Create.** Shape classification, band partitioning, share/drop maths, `sizes` derivation. Pure — no React, no JSON, no network. |
| `lib/gallery-bands.test.ts` | **Create.** `node --test` coverage for the above. |
| `lib/gallery-layout.ts` | **Rewrite.** `BAND_OVERRIDES` and `TUNING` replace `PLACEMENTS` and `SIZE_WIDTH`. |
| `components/GalleryFlow.tsx` | **Modify.** Render bands; derive `sizes` per photo; keep the dev review badge. |
| `components/gallery.css` | **Modify.** `.photo-band` styles replace `.photo-slot`; tighter vertical rhythm. |
| `tsconfig.json` | **Modify.** `allowImportingTsExtensions` so `.ts` specifiers type-check. |
| `package.json` | **Modify.** `npm test` discovers `lib/` tests as well as `scripts/`. |
| `PROGRESS.md` | **Modify.** Reopen Task 7, record the new layout. |

**Direction of dependency:** `gallery-layout` imports types from `gallery-bands`. `gallery-bands` imports nothing from `gallery-layout` — overrides and tuning are passed in as arguments. No cycle.

`gallery-bands.ts` may only ever `import type` from `gallery-items.ts`. A value import would pull in `photo-manifest.json`, which plain Node cannot load without an import attribute, and the test would fail at import time.

---

### Task 1: Test plumbing

Node 25 runs TypeScript test files directly by stripping types, but `tsc` rejects a `.ts` import specifier unless told otherwise, and `npm test` currently only globs `scripts/`.

**Files:**
- Modify: `tsconfig.json`
- Modify: `package.json`

- [ ] **Step 1: Confirm the current failure**

Create a throwaway pair of files:

```bash
cd "/Users/rutvijdhotey/Documents/Personal Projects/Photo Video Website"
printf 'export const a = 1\n' > lib/__tmp-a.ts
printf "import { a } from './__tmp-a.ts'\nexport const b = a\n" > lib/__tmp-b.ts
npx tsc --noEmit
```

Expected: `error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.`

- [ ] **Step 2: Enable the flag**

In `tsconfig.json`, add the option immediately after `"noEmit": true`:

```json
    "noEmit": true,
    "allowImportingTsExtensions": true,
```

The flag requires `noEmit`, which is already set. It changes nothing about the build output.

- [ ] **Step 3: Verify it now type-checks, then clean up**

```bash
npx tsc --noEmit && rm -f lib/__tmp-a.ts lib/__tmp-b.ts
```

Expected: no output from `tsc`, then the temp files are gone.

- [ ] **Step 4: Widen the test glob**

In `package.json`, replace the `test` script:

```json
    "test": "node --test scripts/ lib/",
```

Node's runner recurses into the given directories and picks up `*.test.mjs` and `*.test.ts`. It skips `node_modules` by default.

- [ ] **Step 5: Verify the existing suite still runs**

```bash
npm test
```

Expected: the 4 tests in `scripts/photos/urls.test.mjs` pass. `lib/` has no tests yet, which is not an error.

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json package.json
git commit -m "chore: run TypeScript tests under node --test"
```

---

### Task 2: Shape classification

**Files:**
- Create: `lib/gallery-bands.ts`
- Create: `lib/gallery-bands.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/gallery-bands.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classify } from './gallery-bands.ts'
import type { GalleryItem } from './gallery-items.ts'

/** Minimal item — only width and height matter to the layout engine. */
const item = (id: string, width: number, height: number): GalleryItem =>
  ({ id, category: 'city', width, height, tint: '#000', alt: 'test' })

test('classify buckets by aspect ratio', () => {
  assert.equal(classify(item('pano', 3000, 1000)), 'pano')   // 3.00
  assert.equal(classify(item('wide', 3000, 2000)), 'wide')   // 1.50
  assert.equal(classify(item('sq', 1000, 1000)), 'square')   // 1.00
  assert.equal(classify(item('tall', 2000, 3000)), 'tall')   // 0.67
})

test('classify boundaries are inclusive at the lower edge', () => {
  assert.equal(classify(item('a', 2200, 1000)), 'pano')      // exactly 2.2
  assert.equal(classify(item('b', 2199, 1000)), 'wide')
  assert.equal(classify(item('c', 1300, 1000)), 'wide')      // exactly 1.3
  assert.equal(classify(item('d', 1299, 1000)), 'square')
  assert.equal(classify(item('e', 850, 1000)), 'square')     // exactly 0.85
  assert.equal(classify(item('f', 849, 1000)), 'tall')
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '.../lib/gallery-bands.ts'`.

- [ ] **Step 3: Write the module**

Create `lib/gallery-bands.ts`:

```ts
// lib/gallery-bands.ts
// Partitions a chapter's photos into floating bands. Pure — no React, no DOM,
// no runtime import of the manifest (a value import of gallery-items would pull
// in photo-manifest.json, which plain Node cannot load).

import type { GalleryItem } from './gallery-items.ts'

export type Shape = 'pano' | 'wide' | 'square' | 'tall'

/** Aspect-ratio thresholds, lower edge inclusive. */
export function classify(item: GalleryItem): Shape {
  const ratio = item.width / item.height
  if (ratio >= 2.2) return 'pano'
  if (ratio >= 1.3) return 'wide'
  if (ratio >= 0.85) return 'square'
  return 'tall'
}
```

- [ ] **Step 4: Run the tests**

```bash
npm test
```

Expected: 6 tests pass (4 existing + 2 new).

- [ ] **Step 5: Commit**

```bash
git add lib/gallery-bands.ts lib/gallery-bands.test.ts
git commit -m "feat(gallery): classify photos by aspect ratio"
```

---

### Task 3: Types and tuning

Defines the vocabulary every later task uses. No behaviour yet, so no test of its own — Task 4 exercises it.

**Files:**
- Modify: `lib/gallery-bands.ts`

- [ ] **Step 1: Add the types and the default tuning**

Append to `lib/gallery-bands.ts`:

```ts
export interface BandPhoto {
  item: GalleryItem
  /** Position in the chapter's item array. The overlay's flat index depends on it. */
  index: number
  /** Width as a percentage of the content column. */
  share: number
  /** Downward offset as a percentage of this photo's own rendered height. */
  drop: number
}

export interface Band {
  photos: BandPhoto[]
  /** Which side of the column the band sits toward. */
  align: 'left' | 'right'
}

/** An authored grouping. Named on the lead photo's id. */
export interface BandOverride {
  /** Photo id, or ids, to place in the lead photo's band. */
  with: string | string[]
  /** Explicit shares, lead first. Falls back to the tuned pair shares. */
  shares?: number[]
  /** Explicit drops, lead first. Falls back to the derived drop. */
  drops?: number[]
}

export type BandOverrides = Record<string, BandOverride>

export interface Tuning {
  /** Share for a solo panorama. */
  panoSolo: number
  /** Share for a periodic solo, used as a breath between paired bands. */
  soloBreath: number
  /** Share for a portrait that could not pair. Kept small — a tall frame at 70% runs past the viewport. */
  tallSolo: number
  /** Insert a solo breath once this many paired bands have gone by. */
  soloEvery: number
  /** Default two-photo split, lead first. */
  pairShares: [number, number]
  /** Split for wide + wide, which needs a stronger size difference to avoid reading as a grid. */
  pairSharesWideWide: [number, number]
  /** Drop range, as a percentage of the dropped photo's own height. */
  dropRange: [number, number]
  /** Gap between photos in a band, as a percentage of the column. */
  gap: number
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit && npm test
```

Expected: no `tsc` output; 6 tests still pass.

- [ ] **Step 3: Commit**

```bash
git add lib/gallery-bands.ts
git commit -m "feat(gallery): band types and tuning shape"
```

---

### Task 4: Partition photos into bands

The core of the feature. Grouping only — shares and drops are stubbed to 0 here and filled in by Task 5, so this task's tests stay about *which photos land together*.

**Files:**
- Modify: `lib/gallery-bands.ts`
- Modify: `lib/gallery-bands.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `lib/gallery-bands.test.ts`:

```ts
import { buildBands, TEST_TUNING } from './gallery-bands.ts'

/** Flattens bands back to ids, in render order. */
const idsOf = (bands: ReturnType<typeof buildBands>) =>
  bands.flatMap(b => b.photos.map(p => p.item.id))

/** wide, tall, square and pano helpers at realistic pixel dimensions. */
const wide   = (id: string) => item(id, 3000, 2000)
const tall   = (id: string) => item(id, 2000, 3000)
const square = (id: string) => item(id, 2000, 2000)
const pano   = (id: string) => item(id, 3000, 1000)

test('every photo appears exactly once, in input order', () => {
  const items = [wide('a'), tall('b'), square('c'), tall('d'), wide('e')]
  const bands = buildBands(items, {}, TEST_TUNING)
  assert.deepEqual(idsOf(bands), ['a', 'b', 'c', 'd', 'e'])
})

test('index is the position in the input array, not the band', () => {
  const items = [wide('a'), tall('b'), square('c')]
  const bands = buildBands(items, {}, TEST_TUNING)
  const flat = bands.flatMap(b => b.photos)
  assert.deepEqual(flat.map(p => p.index), [0, 1, 2])
})

test('panoramas are always solo', () => {
  const items = [pano('a'), wide('b'), tall('c')]
  const bands = buildBands(items, {}, TEST_TUNING)
  assert.equal(bands[0].photos.length, 1)
  assert.equal(bands[0].photos[0].item.id, 'a')
})

test('two tall photos never share a band', () => {
  const items = [tall('a'), tall('b'), tall('c'), tall('d')]
  const bands = buildBands(items, {}, TEST_TUNING)
  for (const band of bands) {
    const talls = band.photos.filter(p => classify(p.item) === 'tall')
    assert.ok(talls.length <= 1, 'a band paired two portraits')
  }
})

test('wide pairs with tall', () => {
  const items = [wide('a'), tall('b')]
  const bands = buildBands(items, {}, TEST_TUNING)
  assert.equal(bands.length, 1)
  assert.deepEqual(bands[0].photos.map(p => p.item.id), ['a', 'b'])
})

test('a solo breath appears after soloEvery paired bands', () => {
  // 12 alternating wide/tall photos would otherwise make 6 paired bands.
  const items = Array.from({ length: 12 }, (_, i) =>
    i % 2 === 0 ? wide(`w${i}`) : tall(`t${i}`))
  const bands = buildBands(items, {}, { ...TEST_TUNING, soloEvery: 2 })
  const solos = bands.filter(b => b.photos.length === 1)
  assert.ok(solos.length >= 2, `expected periodic solos, got ${solos.length}`)
})

test('an odd photo count still places every photo', () => {
  const items = [wide('a'), tall('b'), wide('c')]
  const bands = buildBands(items, {}, TEST_TUNING)
  assert.deepEqual(idsOf(bands).sort(), ['a', 'b', 'c'])
})

test('bands alternate which side of the column they sit toward', () => {
  const items = [wide('a'), tall('b'), wide('c'), tall('d')]
  const bands = buildBands(items, {}, TEST_TUNING)
  assert.notEqual(bands[0].align, bands[1].align)
})

test('an override groups its photos and consumes them both', () => {
  const items = [wide('a'), wide('b'), tall('c')]
  const bands = buildBands(items, { a: { with: 'c' } }, TEST_TUNING)
  assert.deepEqual(bands[0].photos.map(p => p.item.id), ['a', 'c'])
  assert.deepEqual(idsOf(bands).sort(), ['a', 'b', 'c'])
})

test('an override wins over the derived pairing even when it pulls a distant photo', () => {
  const items = [wide('a'), tall('b'), wide('c'), tall('d')]
  const bands = buildBands(items, { a: { with: 'd' } }, TEST_TUNING)
  assert.deepEqual(bands[0].photos.map(p => p.item.id), ['a', 'd'])
  // 'd' is not also left at the end.
  assert.equal(idsOf(bands).filter(id => id === 'd').length, 1)
})

test('an override naming a missing id is ignored rather than throwing', () => {
  const items = [wide('a'), tall('b')]
  const bands = buildBands(items, { a: { with: 'nope' } }, TEST_TUNING)
  assert.deepEqual(idsOf(bands).sort(), ['a', 'b'])
})

test('a pair never splits the band evenly', () => {
  const items = [wide('a'), tall('b'), wide('c'), wide('d')]
  const bands = buildBands(items, {}, TEST_TUNING)
  for (const band of bands.filter(b => b.photos.length > 1)) {
    const [first, second] = band.photos
    assert.notEqual(first.share, second.share)
    assert.ok(Math.abs(first.share - second.share) >= 10,
      `shares ${first.share}/${second.share} are too close to read as unequal`)
  }
})

test('a band leaves margin in the column rather than filling it', () => {
  const items = [wide('a'), tall('b'), pano('c'), wide('d'), wide('e')]
  const bands = buildBands(items, {}, TEST_TUNING)
  for (const band of bands) {
    const gaps = (band.photos.length - 1) * TEST_TUNING.gap
    const total = band.photos.reduce((sum, p) => sum + p.share, 0) + gaps
    assert.ok(total <= 96, `band occupies ${total}% of the column`)
  }
})
```

- [ ] **Step 2: Run them and watch them fail**

```bash
npm test
```

Expected: FAIL — `buildBands` and `TEST_TUNING` are not exported.

- [ ] **Step 3: Implement the partition**

Append to `lib/gallery-bands.ts`:

```ts
/** Tuning used by the test suite. Kept here so tests never depend on art direction. */
export const TEST_TUNING: Tuning = {
  panoSolo: 92,
  soloBreath: 70,
  tallSolo: 42,
  soloEvery: 4,
  pairShares: [50, 30],
  pairSharesWideWide: [52, 28],
  dropRange: [8, 20],
  gap: 4,
}

/** A pair is legal unless it puts two portraits side by side, or involves a panorama. */
function canPair(a: GalleryItem, b: GalleryItem): boolean {
  const sa = classify(a)
  const sb = classify(b)
  if (sa === 'pano' || sb === 'pano') return false
  if (sa === 'tall' && sb === 'tall') return false
  return true
}

/** Share for a photo that ends up alone in its band. */
function soloShare(item: GalleryItem, tuning: Tuning): number {
  const shape = classify(item)
  if (shape === 'pano') return tuning.panoSolo
  if (shape === 'tall') return tuning.tallSolo
  return tuning.soloBreath
}

export function buildBands(
  items: GalleryItem[],
  overrides: BandOverrides,
  tuning: Tuning,
): Band[] {
  const indexOf = new Map(items.map((it, i) => [it.id, i]))
  const consumed = new Set<number>()
  const bands: Band[] = []
  let sinceSolo = 0

  /** Pushes a band and assigns its alternating side. */
  const push = (photos: BandPhoto[]) => {
    bands.push({ photos, align: bands.length % 2 === 0 ? 'left' : 'right' })
  }

  const asPhoto = (i: number, share: number): BandPhoto => ({
    item: items[i], index: i, share, drop: 0,
  })

  for (let i = 0; i < items.length; i++) {
    if (consumed.has(i)) continue
    const lead = items[i]
    consumed.add(i)

    // 1. An authored grouping wins outright, and may pull a non-adjacent photo.
    const override = overrides[lead.id]
    if (override) {
      const partnerIds = Array.isArray(override.with) ? override.with : [override.with]
      const partners = partnerIds
        .map(id => indexOf.get(id))
        .filter((j): j is number => j !== undefined && !consumed.has(j))
      if (partners.length > 0) {
        const shares = override.shares ?? [tuning.pairShares[0], ...partners.map(() => tuning.pairShares[1])]
        const photos = [asPhoto(i, shares[0] ?? tuning.pairShares[0])]
        partners.forEach((j, n) => {
          consumed.add(j)
          photos.push(asPhoto(j, shares[n + 1] ?? tuning.pairShares[1]))
        })
        push(photos)
        sinceSolo = 0
        continue
      }
      // Every named partner was missing or already placed — fall through to derived.
    }

    // 2. Panoramas stand alone.
    if (classify(lead) === 'pano') {
      push([asPhoto(i, soloShare(lead, tuning))])
      sinceSolo = 0
      continue
    }

    // 3. A periodic solo, so the page is not relentless pairs.
    if (sinceSolo >= tuning.soloEvery) {
      push([asPhoto(i, soloShare(lead, tuning))])
      sinceSolo = 0
      continue
    }

    // 4. Otherwise pair with the next unconsumed photo, if that pairing is legal.
    let partner = -1
    for (let j = i + 1; j < items.length; j++) {
      if (consumed.has(j)) continue
      if (canPair(lead, items[j])) partner = j
      break   // only the immediate next photo, so order is never rearranged
    }

    if (partner === -1) {
      push([asPhoto(i, soloShare(lead, tuning))])
      sinceSolo = 0
      continue
    }

    consumed.add(partner)
    const wideWide = classify(lead) === 'wide' && classify(items[partner]) === 'wide'
    const [a, b] = wideWide ? tuning.pairSharesWideWide : tuning.pairShares
    push([asPhoto(i, a), asPhoto(partner, b)])
    sinceSolo++
  }

  return bands
}
```

- [ ] **Step 4: Run the tests**

```bash
npm test
```

Expected: all pass — 19 in total (4 existing, 2 from Task 2, 13 new).

- [ ] **Step 5: Commit**

```bash
git add lib/gallery-bands.ts lib/gallery-bands.test.ts
git commit -m "feat(gallery): partition photos into bands"
```

---

### Task 5: Shares and drops

Drops must be deterministic. The site is a static export, so the HTML is generated at build time and hydrated in the browser — a random offset would differ between the two and produce a hydration mismatch.

**Files:**
- Modify: `lib/gallery-bands.ts`
- Modify: `lib/gallery-bands.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `lib/gallery-bands.test.ts`:

```ts
import { applyDrops, dropOffset } from './gallery-bands.ts'

test('drops are deterministic for the same photo id', () => {
  const items = [wide('a'), tall('b')]
  const first  = buildBands(items, {}, TEST_TUNING)
  const second = buildBands(items, {}, TEST_TUNING)
  assert.deepEqual(
    first.flatMap(band => band.photos.map(p => p.drop)),
    second.flatMap(band => band.photos.map(p => p.drop)),
  )
})

test('exactly one photo in a pair is dropped', () => {
  const bands = buildBands([wide('a'), tall('b')], {}, TEST_TUNING)
  const dropped = bands[0].photos.filter(p => p.drop > 0)
  assert.equal(dropped.length, 1)
})

test('the shorter photo is the one that drops', () => {
  // wide at 50% share renders 0.333 column-widths tall; tall at 30% renders 0.45.
  const bands = buildBands([wide('a'), tall('b')], {}, TEST_TUNING)
  const dropped = bands[0].photos.find(p => p.drop > 0)
  assert.equal(dropped?.item.id, 'a')
})

test('a solo photo never drops', () => {
  const bands = buildBands([pano('a')], {}, TEST_TUNING)
  assert.equal(bands[0].photos[0].drop, 0)
})

test('a drop never pushes a photo past the bottom of the tallest in its band', () => {
  const bands = buildBands([wide('a'), tall('b')], {}, TEST_TUNING)
  const heights = bands[0].photos.map(p => {
    const aspect = p.item.width / p.item.height
    const height = p.share / aspect
    return height + (p.drop / 100) * height
  })
  const tallest = Math.max(...bands[0].photos.map(p => p.share / (p.item.width / p.item.height)))
  for (const bottom of heights) {
    assert.ok(bottom <= tallest + 0.001, `band overflows: ${bottom} > ${tallest}`)
  }
})

test('an override can set drops explicitly', () => {
  const bands = buildBands(
    [wide('a'), tall('b')],
    { a: { with: 'b', shares: [50, 30], drops: [0, 12] } },
    TEST_TUNING,
  )
  assert.deepEqual(bands[0].photos.map(p => p.drop), [0, 12])
})

test('dropOffset converts a drop into a percentage of the column', () => {
  // 30% share, aspect 2/3 → rendered height 45% of the column.
  // A 20% drop of that height is 9% of the column.
  const photo = { item: tall('x'), index: 0, share: 30, drop: 20 }
  assert.equal(dropOffset(photo), '9.00%')
})

test('dropOffset is zero for an undropped photo', () => {
  const photo = { item: wide('x'), index: 0, share: 50, drop: 0 }
  assert.equal(dropOffset(photo), '0%')
})
```

- [ ] **Step 2: Run them and watch them fail**

```bash
npm test
```

Expected: FAIL — `applyDrops` and `dropOffset` are not exported, and the drop assertions fail because every drop is currently 0.

- [ ] **Step 3: Implement the drop maths**

Append to `lib/gallery-bands.ts`:

```ts
/**
 * FNV-1a over the photo id. Any stable hash would do — what matters is that the
 * build and the browser agree, since a mismatch breaks hydration.
 */
function hash(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/** Rendered height, in units of the content column's width. */
function renderedHeight(photo: BandPhoto): number {
  return photo.share / (photo.item.width / photo.item.height)
}

/**
 * Drops the shorter photo in each multi-photo band, so top edges never align.
 * Clamped so the dropped photo's bottom never passes the tallest photo's bottom —
 * the band's height stays set by its tallest frame.
 */
export function applyDrops(band: Band, tuning: Tuning): Band {
  if (band.photos.length < 2) return band

  const heights = band.photos.map(renderedHeight)
  const tallest = Math.max(...heights)
  const shortest = Math.min(...heights)
  const target = heights.indexOf(shortest)

  const [min, max] = tuning.dropRange
  const chosen = min + (hash(band.photos[target].item.id) % (max - min + 1))

  // Room available, expressed as a percentage of the dropped photo's own height.
  const room = shortest === 0 ? 0 : ((tallest - shortest) / shortest) * 100
  const drop = Math.min(chosen, room)

  const photos = band.photos.map((p, i) => (i === target ? { ...p, drop } : p))
  return { ...band, photos }
}

/** The drop as a CSS percentage of the column, which is what `margin-top: %` resolves against. */
export function dropOffset(photo: BandPhoto): string {
  if (photo.drop === 0) return '0%'
  return `${((photo.drop / 100) * renderedHeight(photo)).toFixed(2)}%`
}
```

- [ ] **Step 4: Call it from `buildBands`**

In `lib/gallery-bands.ts`, change the `push` helper so every band passes through `applyDrops`, and honour explicit override drops. Replace the `push` definition inside `buildBands`:

```ts
  /** Pushes a band, assigns its alternating side, and derives its drops. */
  const push = (photos: BandPhoto[], explicitDrops?: number[]) => {
    const band: Band = { photos, align: bands.length % 2 === 0 ? 'left' : 'right' }
    if (explicitDrops) {
      bands.push({
        ...band,
        photos: photos.map((p, i) => ({ ...p, drop: explicitDrops[i] ?? 0 })),
      })
      return
    }
    bands.push(applyDrops(band, tuning))
  }
```

Then, in the override branch, pass the explicit drops through — change `push(photos)` to:

```ts
        push(photos, override.drops)
```

- [ ] **Step 5: Run the tests**

```bash
npm test
```

Expected: all pass — 27 in total.

- [ ] **Step 6: Commit**

```bash
git add lib/gallery-bands.ts lib/gallery-bands.test.ts
git commit -m "feat(gallery): deterministic vertical drops within a band"
```

---

### Task 6: The `sizes` attribute

The old `SIZES` map assumed the four-step scale. A photo at a 30% share renders about 390px at a 1440 viewport — the 480 rung, where the old values select 1200. Getting this wrong quietly gives back part of the 211.7 MB → 6.9 MB win.

**Files:**
- Modify: `lib/gallery-bands.ts`
- Modify: `lib/gallery-bands.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `lib/gallery-bands.test.ts`:

```ts
import { photoSizes } from './gallery-bands.ts'

test('photoSizes pins a pixel width above the column max and scales below it', () => {
  // Column is 1296px at and above a 1584px viewport (1440 max-width less 2x72 padding).
  // 30% of 1296 is 389px.
  assert.equal(
    photoSizes(30),
    '(max-width: 768px) 92vw, (min-width: 1584px) 389px, 27vw',
  )
})

test('photoSizes handles a full-width panorama', () => {
  assert.equal(
    photoSizes(92),
    '(max-width: 768px) 92vw, (min-width: 1584px) 1192px, 83vw',
  )
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm test
```

Expected: FAIL — `photoSizes` is not exported.

- [ ] **Step 3: Implement it**

Append to `lib/gallery-bands.ts`:

```ts
/** Content column at its widest: the 1440px max-width less 72px of padding each side. */
const COLUMN_MAX = 1296
/** Viewport at which the column stops growing: 1440 plus both paddings. */
const COLUMN_LOCK = 1584
/** Below the lock the column is roughly 90% of the viewport, padding included. */
const COLUMN_VW_RATIO = 0.9

/**
 * A `sizes` value for a photo occupying `share` percent of the content column.
 * Below 768px every band collapses to one photo per row at 92vw.
 */
export function photoSizes(share: number): string {
  const pinned = Math.round((share / 100) * COLUMN_MAX)
  const scaled = Math.round(share * COLUMN_VW_RATIO)
  return `(max-width: 768px) 92vw, (min-width: ${COLUMN_LOCK}px) ${pinned}px, ${scaled}vw`
}
```

- [ ] **Step 4: Run the tests**

```bash
npm test
```

Expected: all 29 pass.

- [ ] **Step 5: Commit**

```bash
git add lib/gallery-bands.ts lib/gallery-bands.test.ts
git commit -m "feat(gallery): derive the sizes attribute from a photo's band share"
```

---

### Task 7: Reshape the art-direction layer

**Files:**
- Modify: `lib/gallery-layout.ts` (full rewrite — the file is 82 lines)

- [ ] **Step 1: Replace the file**

Overwrite `lib/gallery-layout.ts` with:

```ts
// lib/gallery-layout.ts
// The art-direction layer. Grouping logic lives in lib/gallery-bands.ts —
// this file holds only the knobs and the authored exceptions.

import type { BandOverrides, Tuning } from './gallery-bands.ts'

/**
 * Layout tuning. Shares are percentages of the content column; a two-photo band
 * plus its gap should land between 75% and 85%, so the band never fills the
 * column and still reads as floating.
 */
export const TUNING: Tuning = {
  panoSolo: 92,
  soloBreath: 70,
  tallSolo: 42,
  soloEvery: 4,
  pairShares: [50, 30],
  pairSharesWideWide: [52, 28],
  dropRange: [8, 20],
  gap: 4,
}

/**
 * Authored groupings. Everything unnamed is derived from aspect ratio.
 * Key is the lead photo's id; `with` names the photo joining it. An override
 * may pull a non-adjacent photo into the band — that is the point of it.
 */
export const BAND_OVERRIDES: BandOverrides = {
  // The two Dotonbori street frames belong together.
  'RJ405690': { with: 'RJ405760', shares: [50, 30] },
}
```

`PLACEMENTS`, `DEFAULT_PLACEMENT`, `SIZE_WIDTH`, `placementFor`, `PhotoSize` and `PhotoAlign` are all removed. `GalleryFlow.tsx` is their only consumer and Task 8 rewrites it.

- [ ] **Step 2: Confirm nothing else imported the removed exports**

```bash
cd "/Users/rutvijdhotey/Documents/Personal Projects/Photo Video Website"
grep -rn "gallery-layout\|placementFor\|SIZE_WIDTH\|PLACEMENTS" --include="*.ts" --include="*.tsx" app components lib
```

Expected: only `components/GalleryFlow.tsx` (which Task 8 rewrites) and the new `lib/gallery-layout.ts` itself.

- [ ] **Step 3: Commit**

```bash
git add lib/gallery-layout.ts
git commit -m "feat(gallery): replace per-photo placements with band overrides"
```

`tsc` will fail between this commit and Task 8 — `GalleryFlow` still imports what was just deleted. That is expected; Task 8 closes it in the next commit.

---

### Task 8: Render bands

**Files:**
- Modify: `components/GalleryFlow.tsx` (full rewrite)

- [ ] **Step 1: Replace the component**

Overwrite `components/GalleryFlow.tsx` with:

```tsx
'use client'

import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GalleryItem } from '@/lib/gallery-items'
import { buildBands, dropOffset, photoSizes } from '@/lib/gallery-bands'
import { BAND_OVERRIDES, TUNING } from '@/lib/gallery-layout'
import Photo from './Photo'
import './gallery.css'

gsap.registerPlugin(ScrollTrigger)

/** Shows each photo's id and current placement while art-directing. Dev only. */
const REVIEW_MODE = process.env.NODE_ENV === 'development'

interface Props {
  items: GalleryItem[]
  onItemClick: (globalIndex: number) => void
  indexOffset?: number
}

export default function GalleryFlow({ items, onItemClick, indexOffset = 0 }: Props) {
  const flowRef = useRef<HTMLDivElement>(null)
  const bands = useMemo(() => buildBands(items, BAND_OVERRIDES, TUNING), [items])

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Reveal a whole band at once, so a pair rises together. */
      gsap.utils.toArray<HTMLElement>('.photo-band').forEach(band => {
        gsap.from(band, {
          scrollTrigger: { trigger: band, start: 'top 90%' },
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'power3.out',
        })
      })
    }, flowRef)
    return () => ctx.revert()
  }, [bands])

  return (
    <div
      className="gallery-flow"
      ref={flowRef}
      style={{ ['--band-gap' as string]: `${TUNING.gap}%` }}
    >
      {bands.map((band, b) => (
        <div
          key={band.photos[0].item.id}
          className={`photo-band photo-band--${band.align}`}
        >
          {band.photos.map(photo => (
            <div
              key={photo.item.id}
              className="photo-band__slot"
              style={{
                ['--share' as string]: `${photo.share}%`,
                ['--drop' as string]: dropOffset(photo),
              }}
            >
              <Photo
                item={photo.item}
                sizes={photoSizes(photo.share)}
                /* Only the very first photo on the page is eager — one per
                   chapter would mean five eager loads. */
                priority={indexOffset === 0 && b === 0 && photo.index === 0}
                onClick={() => onItemClick(indexOffset + photo.index)}
              />
              {/* Review aid for the placement pass. Dev only — never shipped. */}
              {REVIEW_MODE && (
                <span className="photo-review-tag">
                  {`${photo.item.id} · ${photo.share}% ↓${photo.drop}`}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

Note `onItemClick(indexOffset + photo.index)` — the overlay's flat index comes from the photo's position in the chapter array, not its position in the band. Getting this wrong opens the wrong photo.

- [ ] **Step 2: Verify it type-checks**

```bash
npx tsc --noEmit
```

Expected: no output. If `tsc` complains that `buildBands` is not exported from `@/lib/gallery-bands`, the `@/*` path maps to the repo root, so the import resolves without the `.ts` extension — that is correct and intended for app code.

- [ ] **Step 3: Commit**

```bash
git add components/GalleryFlow.tsx
git commit -m "feat(gallery): render floating bands"
```

---

### Task 9: Band styles

**Files:**
- Modify: `components/gallery.css`

- [ ] **Step 1: Replace the layout rules**

In `components/gallery.css`, replace the `.photo-slot` block and its alignment modifiers — everything from `.photo-slot {` through `.photo-slot--right  { align-self: flex-end; }` — with:

```css
.photo-band {
  display: flex;
  align-items: flex-start;
  gap: var(--band-gap, 4%);
  width: 100%;
}

.photo-band--left  { justify-content: flex-start; }
.photo-band--right { justify-content: flex-end; }

.photo-band__slot {
  position: relative;
  flex: 0 0 var(--share, 50%);
  /* A percentage margin resolves against the containing block's WIDTH, so the
     drop is pre-converted to a share of the column in dropOffset(). */
  margin-top: var(--drop, 0%);
}
```

Keep the `.photo-review-tag` rules as they are — they hang off `.photo-band__slot` now, which is also `position: relative`.

- [ ] **Step 2: Tighten the vertical rhythm**

In the same file, in `.gallery-flow`, change the rhythm — air now lives inside the bands as well as between them:

```css
  --flow-rhythm: clamp(48px, 6vw, 96px);
```

- [ ] **Step 3: Collapse bands on mobile**

Replace the `.photo-slot` rule inside the `@media (max-width: 768px)` block with:

```css
  /* On narrow screens a band becomes one photo per row, full width, no drop. */
  .photo-band { flex-direction: column; gap: 0; }
  .photo-band__slot {
    flex-basis: auto !important;
    width: 100%;
    margin-top: 0 !important;
  }
```

The `!important` is needed because `--share` and `--drop` are inline styles, which otherwise win. This matches the existing precedent in the file.

The mobile `--flow-rhythm` inside that media query stays as it is:

```css
    --flow-rhythm: clamp(40px, 12vw, 72px);
```

It now separates bands rather than individual photos, and a collapsed band's photos sit flush against each other because the band's own `gap` is zeroed above. Confirm that reads well on the 375px check in Task 10; if the photos inside a collapsed band feel cramped, give `.photo-band` a small mobile `gap` rather than changing the rhythm.

- [ ] **Step 4: Commit**

```bash
git add components/gallery.css
git commit -m "feat(gallery): band layout styles and tighter vertical rhythm"
```

---

### Task 10: Verify in the browser

Nothing here changes code unless a check fails. This is the task that proves the `sizes` work actually held.

**Files:** none — verification only.

- [ ] **Step 1: Start the dev server**

Use the `portfolio` configuration in `.claude/launch.json` (`npm run dev`, port 3000). Navigate to `http://localhost:3000/creative`.

- [ ] **Step 2: Confirm the console is clean**

Read the browser console. Expected: no errors, and specifically **no hydration mismatch warning** — that would mean a drop is not deterministic.

- [ ] **Step 3: Confirm every photo rendered**

In the browser console:

```js
document.querySelectorAll('.photo-band__slot').length
```

Expected: `39`.

```js
document.querySelectorAll('.photo-band').length
```

Expected: roughly 22–26. A number close to 39 means pairing is not happening.

- [ ] **Step 4: Confirm no band overflows its column**

```js
[...document.querySelectorAll('.photo-band')].filter(b => b.scrollWidth > b.clientWidth + 1).length
```

Expected: `0`. A non-zero result means shares plus gap exceed 100%.

- [ ] **Step 5: Confirm the selected rungs are right**

At a 1440px viewport width, with the page fully scrolled so every image has loaded:

```js
[...document.querySelectorAll('.photo-band__slot img')]
  .map(i => i.currentSrc.match(/-(\d+)\.(avif|webp)/)?.[1])
  .reduce((acc, w) => ({ ...acc, [w]: (acc[w] || 0) + 1 }), {})
```

Expected: a mix of `480`, `768` and `1200` — and **no `2560`**. Seeing 1200 for every photo means `sizes` is not being applied.

- [ ] **Step 6: Confirm the page got shorter**

```js
document.documentElement.scrollHeight
```

Expected: meaningfully below the previous 26,041px — roughly 15,000–18,000px.

- [ ] **Step 7: Confirm the overlay opens the photo that was clicked**

Click the third photo in the Copenhagen chapter. The overlay must show that same photograph. This is the `photo.index` mapping from Task 8; if it is wrong, the overlay opens a neighbour.

- [ ] **Step 8: Check the mobile collapse**

Resize to 375px wide and reload. Expected: one photo per row, full width, no horizontal scrollbar.

```js
document.documentElement.scrollWidth <= window.innerWidth
```

Expected: `true`.

- [ ] **Step 9: Confirm the production build passes**

```bash
npm run build && npm run lint && npm test
```

Expected: build succeeds, lint clean, 29 tests pass.

- [ ] **Step 10: Confirm the review badge is not in the build**

```bash
grep -r "photo-review-tag" out/ | head
```

Expected: no matches. `REVIEW_MODE` is false in a production build, so the badge must not appear in the exported HTML.

---

### Task 11: Record the state

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 1: Reopen Task 7 in the task table**

In the task status table, replace the Task 7 row with:

```markdown
| 7. Floating layout | ✅ Redone as bands — see the collage spec. Placements for all 39 derived from aspect ratio; **not yet reviewed by a human**. |
```

- [ ] **Step 2: Replace the photo-review entry under "Known gaps"**

Replace the bullet beginning `**All 29 photos need a human review pass.**` with:

```markdown
- **All 39 photos need a human review pass.** The gallery is now floating bands
  (`lib/gallery-bands.ts` derives them; `lib/gallery-layout.ts` holds the tuning and
  the authored exceptions). Grouping is derived from aspect ratio, so which photos
  share a band is a considered guess, not a choice. Add `BAND_OVERRIDES` entries
  where specific photographs belong together, and adjust `TUNING` if the whole
  scale is off rather than individual bands. The dev-only `id · share ↓drop` badge
  is there to support this pass and comes out when it is done.
```

- [ ] **Step 3: Update the "To resume" section**

Replace the paragraph beginning `**The photo review is now the critical path.**` with:

```markdown
**The photo review is now the critical path.** The floating collage layout has
landed, so all 39 photos display uncropped, in bands, for the first time. Grouping
and sizing are derived — review them against the real page and record exceptions in
`BAND_OVERRIDES`.
```

- [ ] **Step 4: Update the "Last updated" date**

Change the date at the top of `PROGRESS.md` to `2026-08-07`.

- [ ] **Step 5: Commit**

```bash
git add PROGRESS.md
git commit -m "docs: record the floating collage layout"
```

---

## What this plan does not do

- **The photo review itself.** It needs Rutvij, and it needs this layout to exist first.
- **Removing the review badge.** It stays until the review is done.
- **Overlapping bands.** Rejected for this pass in the spec; a later opt-in if wanted.
- **Task 9 of the pipeline plan** (hero video, covers), still blocked on ffmpeg.
- **Theming**, which remains a separate second branch.
