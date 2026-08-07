# Photo Pipeline & Floating Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut the site from ~240 MB of media to under 8 MB, and rebuild the creative gallery so photographs float at their true aspect ratio against page background instead of being cropped into a tight grid.

**Architecture:** A repeatable local pipeline (`scripts/photos/`) pulls masters from Supabase into a gitignored `masters/`, generates an AVIF/WebP width ladder with `sharp`, and emits `lib/photo-manifest.json` carrying intrinsic dimensions. Derivatives upload to a **new** Supabase prefix with a long `cache-control` — originals are never overwritten. The gallery is rebuilt on that manifest: a `Photo` component renders `<picture>` with `srcset`/`sizes` inside an `aspect-ratio` box (zero layout shift), and `GalleryFlow` replaces the fixed-`vh` grid with per-photo art-directed placement.

**Tech Stack:** Next.js 16 (`output: 'export'`), React 19, sharp 0.34.5 (already present), `node --test` (built in — no new test deps), GSAP 3 (existing).

**Out of scope — gets its own plan:** light/dark theming. It must land *after* this, on top of settled gallery CSS.

---

## Decisions this plan implements

Settled during the design interview:

1. Offline `sharp` pipeline, re-upload to Supabase. No hosting migration.
2. Repeatable, not one-shot. `masters/` is source of truth; gallery data generated from a manifest.
3. Dedicated ~2560px overlay rung + neighbour prefetch. AVIF with WebP fallback.
4. Editorial stagger layout — varied widths, alternating alignment. `object-fit: cover` is removed; photos display uncropped.
5. Hero video re-encoded, with a poster that becomes the LCP element.

## Known blockers

| Blocker | Blocks | Resolution |
|---|---|---|
| No Supabase credentials | Task 5 (upload) only | User writes `SUPABASE_URL` + service key into `.env.local` themselves. **Never** paste a key into chat; the script reads `process.env`. |
| `ffmpeg` not installed | Task 9 (hero video) only | User's call: install, or user supplies the encoded MP4/WebM + poster. |
| `sharp` undeclared | Nothing (works transitively) | Task 1 declares it explicitly. |

Tasks 1–4 and 6–8 are fully unblocked and can proceed now.

## Progress — last updated 2026-08-02

**Branches:**
- `feature/paris-chapter` — commit `ec007e1`. The Paris chapter, previously uncommitted on `main`. Not yet pushed or PR'd.
- `feature/photo-pipeline-floating-gallery` — this work. **Stacked on `feature/paris-chapter`, not on `main`**, because Task 2's `sources.mjs` and Task 6's manifest both need the Paris photos. Rebase onto `main` once the Paris PR merges.

**Task status:**

| Task | Status |
|---|---|
| 1. Pipeline config and URL helpers | ✅ Done — commit `e32c401`, 4/4 tests pass. `masterUrl` verified against live Supabase (HTTP 200, 735564 bytes). |
| 2. Fetch masters | ✅ Done — `351db83`. 29 masters, 191.4 MB, local backup now exists. Idempotent re-run skips all 29. |
| 3. Derivatives and manifest | ✅ Done — `fdb684e`. 274 files, 37.3 MB on disk; 1800 AVIF rung 5.64 MB for all 29. Manifest has 29 well-formed entries. |
| 4. Measurement harness | ✅ Done — `d453f5c`. Baseline captured against the live site before any upload. |
| 5. Upload | ✅ Done — `09bbace`. 372 files, 47.4 MB, remote count matches local. **Step 4's verification was wrong**: a HEAD against Supabase always reports `no-cache`, so it would have triggered a false stop. Verify with a ranged GET instead. |
| 6. `Photo` component | Not started — depends on 3 |
| 7. Floating layout | Not started — depends on 6 |
| 8. Overlay fixes | Not started — depends on 6 |
| 9. Hero video and covers | Partially blocked — poster/cover work is unblocked, re-encode needs ffmpeg |
| 10. Verify and finish | Not started |

**One open decision for the user:**

1. **ffmpeg.** Not installed. Needed to re-encode the 32 MB hero `.mov` and the 10.8 MB case-study MP4. Either install it, or supply the encoded MP4/WebM + poster stills directly. Blocks only Task 9 Step 5.
2. ~~**Supabase service key.**~~ Resolved 2026-08-05 — `.env.local` created by the user and verified (role `service_role`, `portfolio` bucket reachable, covered by `.gitignore:34`). Task 5 is unblocked.

**Baseline to beat** (measured 2026-07-31 against the live site): 29 gallery images, **191.4 MB** total, 6.60 MB average, 16.95 MB largest, **29 of 29 uncached**. Hero video 32.4 MB. Home cover PNG 2.46 MB. Engineering cover PNG 1.90 MB. Case-study MP4 10.76 MB.

**Known gap in this plan:** the 10.8 MB case-study MP4 at `app/engineering/into-your-stories/page.tsx:12` has no task. It's blocked on the same ffmpeg decision as the hero and should join Task 9 once that's resolved.

## File structure

**Create:**
- `scripts/photos/config.mjs` — ladder widths, quality, bucket paths. Single source of truth.
- `scripts/photos/fetch-masters.mjs` — idempotent download of originals → `masters/`.
- `scripts/photos/build-derivatives.mjs` — sharp: `masters/` → `derivatives/` + manifest.
- `scripts/photos/upload.mjs` — `derivatives/` → Supabase, long cache-control.
- `scripts/photos/measure.mjs` — before/after page-weight report.
- `scripts/photos/urls.mjs` — pure URL/id helpers, shared by scripts and app.
- `scripts/photos/urls.test.mjs`, `scripts/photos/config.test.mjs`
- `lib/photo-manifest.json` — generated. Committed (it's small JSON, and the build needs it).
- `lib/gallery-layout.ts` — per-photo art direction (width + alignment).
- `components/Photo.tsx` — `<picture>` + `srcset`/`sizes` in an aspect-ratio box.
- `components/GalleryFlow.tsx` — replaces `GalleryGrid`.

**Modify:**
- `package.json` — declare sharp, add `photos:*` scripts.
- `.gitignore` — add `/masters/`, `/derivatives/`.
- `lib/gallery-items.ts` — consume manifest; drop the `layout` row concept.
- `components/gallery.css` — rewritten for floating layout.
- `components/OverlayViewer.tsx` — overlay rung, prefetch, no eager load.
- `app/creative/page.tsx` — `GalleryFlow`, hero poster.
- `app/home.css:28`, `app/engineering/engineering.css:81` — converted cover images.

**Delete:** `components/GalleryGrid.tsx` (replaced by `GalleryFlow`).

---

### Task 1: Pipeline config and URL helpers

**Files:**
- Create: `scripts/photos/config.mjs`, `scripts/photos/urls.mjs`
- Test: `scripts/photos/urls.test.mjs`
- Modify: `package.json`, `.gitignore`

- [ ] **Step 1: Declare sharp and add scripts**

In `package.json`, add to `dependencies`: `"sharp": "^0.34.5"`. Add to `scripts`:

```json
"photos:fetch": "node scripts/photos/fetch-masters.mjs",
"photos:build": "node scripts/photos/build-derivatives.mjs",
"photos:upload": "node scripts/photos/upload.mjs",
"photos:measure": "node scripts/photos/measure.mjs",
"test": "node --test scripts/**/*.test.mjs"
```

Run `npm install` to write the lockfile. sharp is already in `node_modules`, so this only promotes it to a declared dependency.

- [ ] **Step 2: Ignore the large local directories**

Append to `.gitignore`:

```
# Photo pipeline working directories — large binaries, never committed
/masters/
/derivatives/
```

- [ ] **Step 3: Write config**

Create `scripts/photos/config.mjs`:

```js
// scripts/photos/config.mjs
// Single source of truth for the photo pipeline.

export const SUPABASE_HOST = 'https://knlwzjvuqipjrjpgnovc.supabase.co'
export const BUCKET = 'portfolio'

/** Where untouched originals live today. Read-only — never written to. */
export const MASTER_PREFIX = `${SUPABASE_HOST}/storage/v1/object/public/${BUCKET}/Images`

/** New prefix for generated derivatives. Originals are never overwritten. */
export const DERIVATIVE_PREFIX = `${SUPABASE_HOST}/storage/v1/object/public/${BUCKET}/optimized`
export const DERIVATIVE_PATH = 'optimized'

/** Widths rendered in the gallery flow. */
export const GRID_WIDTHS = [480, 768, 1200, 1800]

/** Dedicated rung for the fullscreen overlay. */
export const OVERLAY_WIDTH = 2560

export const ALL_WIDTHS = [...GRID_WIDTHS, OVERLAY_WIDTH]

export const FORMATS = [
  { ext: 'avif', mime: 'image/avif', options: { quality: 55, effort: 6 } },
  { ext: 'webp', mime: 'image/webp', options: { quality: 78 } },
]

/** One year, immutable — derivative filenames encode their width, so they never change meaning. */
export const CACHE_CONTROL = 'public, max-age=31536000, immutable'

export const MASTERS_DIR = 'masters'
export const DERIVATIVES_DIR = 'derivatives'
export const MANIFEST_PATH = 'lib/photo-manifest.json'

/** Source folders on Supabase, keyed by the category used in the app. */
export const CATEGORY_FOLDERS = {
  city: 'City/Japan',
  nature: 'Nature/Bend Oregon LR Edits',
  random: 'Random',
  paris: 'Paris',
}
```

- [ ] **Step 4: Write the failing test for URL helpers**

Create `scripts/photos/urls.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { photoId, masterUrl, derivativeKey, derivativeUrl } from './urls.mjs'

test('photoId strips extension and spaces', () => {
  assert.equal(photoId('RJ405649.jpg'), 'RJ405649')
  assert.equal(photoId('RJ405710 copy.jpg'), 'RJ405710-copy')
})

test('masterUrl encodes spaces in the folder', () => {
  assert.equal(
    masterUrl('nature', 'RJ400615.jpg'),
    'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Images/Nature/Bend%20Oregon%20LR%20Edits/RJ400615.jpg'
  )
})

test('derivativeKey encodes width and format', () => {
  assert.equal(derivativeKey('city', 'RJ405649', 1200, 'avif'), 'optimized/city/RJ405649-1200.avif')
})

test('derivativeUrl is a fully qualified public URL', () => {
  assert.equal(
    derivativeUrl('city', 'RJ405649', 1200, 'avif'),
    'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/optimized/city/RJ405649-1200.avif'
  )
})
```

- [ ] **Step 5: Run it to confirm it fails**

Run: `node --test scripts/photos/urls.test.mjs`
Expected: FAIL — `Cannot find module './urls.mjs'`

- [ ] **Step 6: Implement the helpers**

Create `scripts/photos/urls.mjs`:

```js
// scripts/photos/urls.mjs
// Pure helpers. No I/O — safe to import from tests and from build scripts.

import { MASTER_PREFIX, DERIVATIVE_PREFIX, DERIVATIVE_PATH, CATEGORY_FOLDERS } from './config.mjs'

/** Filename -> stable id. Spaces become hyphens so ids are URL-safe. */
export function photoId(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/\s+/g, '-')
}

/** Public URL of an untouched original. */
export function masterUrl(category, filename) {
  const folder = CATEGORY_FOLDERS[category]
  if (!folder) throw new Error(`Unknown category: ${category}`)
  const encodedFolder = folder.split('/').map(encodeURIComponent).join('/')
  return `${MASTER_PREFIX}/${encodedFolder}/${encodeURIComponent(filename)}`
}

/** Storage key (path within the bucket) for a derivative. */
export function derivativeKey(category, id, width, ext) {
  return `${DERIVATIVE_PATH}/${category}/${id}-${width}.${ext}`
}

/** Public URL for a derivative. */
export function derivativeUrl(category, id, width, ext) {
  return `${DERIVATIVE_PREFIX}/${category}/${id}-${width}.${ext}`
}
```

- [ ] **Step 7: Run tests to confirm they pass**

Run: `node --test scripts/photos/urls.test.mjs`
Expected: PASS, 4 tests.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json .gitignore scripts/photos/config.mjs scripts/photos/urls.mjs scripts/photos/urls.test.mjs
git commit -m "feat(photos): add pipeline config and URL helpers"
```

---

### Task 2: Fetch masters from Supabase

The 16 Paris and Bend Oregon originals exist **only** in Supabase. This task is also the backup that currently doesn't exist. It must be idempotent — safe to re-run without re-downloading.

**Files:**
- Create: `scripts/photos/fetch-masters.mjs`

- [ ] **Step 1: Write the fetch script**

Create `scripts/photos/fetch-masters.mjs`:

```js
// scripts/photos/fetch-masters.mjs
// Downloads every referenced original into masters/<category>/.
// Idempotent: skips files already present with a matching byte length.

import { mkdir, writeFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { MASTERS_DIR } from './config.mjs'
import { masterUrl } from './urls.mjs'
import { SOURCE_PHOTOS } from './sources.mjs'

async function alreadyHave(path, expectedBytes) {
  try {
    const s = await stat(path)
    return s.size === expectedBytes
  } catch {
    return false
  }
}

async function fetchOne({ category, filename }) {
  const url = masterUrl(category, filename)
  const dir = join(MASTERS_DIR, category)
  const dest = join(dir, filename)

  const head = await fetch(url, { method: 'HEAD' })
  if (!head.ok) throw new Error(`HEAD ${head.status} for ${url}`)
  const expected = Number(head.headers.get('content-length'))

  if (await alreadyHave(dest, expected)) {
    console.log(`  skip  ${category}/${filename}`)
    return { skipped: true, bytes: expected }
  }

  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${res.status} for ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())

  await mkdir(dir, { recursive: true })
  await writeFile(dest, buf)
  console.log(`  saved ${category}/${filename} (${(buf.length / 1048576).toFixed(2)} MB)`)
  return { skipped: false, bytes: buf.length }
}

const results = []
for (const photo of SOURCE_PHOTOS) {
  results.push(await fetchOne(photo))
}

const total = results.reduce((s, r) => s + r.bytes, 0)
const saved = results.filter(r => !r.skipped).length
console.log(`\n${SOURCE_PHOTOS.length} masters, ${saved} newly downloaded, ${(total / 1048576).toFixed(1)} MB total`)
```

- [ ] **Step 2: Write the source list**

Create `scripts/photos/sources.mjs`. These are the 29 photos currently referenced by `lib/gallery-items.ts`:

```js
// scripts/photos/sources.mjs
// The canonical list of photos in the portfolio, in display order.

const list = (category, filenames) => filenames.map(filename => ({ category, filename }))

export const SOURCE_PHOTOS = [
  ...list('city', [
    'RJ405649.jpg', 'RJ405760.jpg', 'RJ405690.jpg', 'RJ405702.jpg',
    'RJ405650.jpg', 'RJ405757.jpg', 'RJ405776.jpg', 'RJ405808.jpg',
    'RJ405710 copy.jpg',
  ]),
  ...list('nature', [
    'RJ400615.jpg', 'RJ400631.jpg', 'RJ400656.jpg', 'RJ400680.jpg',
    'RJ400695.jpg', 'RJ400721.jpg', 'RJ400730.jpg', 'RJ400731.jpg',
  ]),
  ...list('random', [
    'dji_fly_20230512_173012_662_1684010304506_photo_optimized.jpg',
    'DSC07277.jpg', 'IMG_8880.jpg', 'DSC07504.jpg',
  ]),
  ...list('paris', [
    'RJ402306.jpg', 'RJ402344.jpg', 'RJ402371.jpg', 'RJ402536.jpg',
    'RJ402597.jpg', 'RJ402605.jpg', 'RJ402656.jpg', 'RJ402666.jpg',
  ]),
]
```

- [ ] **Step 3: Run it**

Run: `npm run photos:fetch`
Expected: 29 files downloaded into `masters/`, roughly 191 MB total. Takes a few minutes.

- [ ] **Step 4: Verify the backup is complete**

Run: `find masters -type f | wc -l`
Expected: `29`

- [ ] **Step 5: Commit**

`masters/` is gitignored — only the scripts are committed.

```bash
git add scripts/photos/fetch-masters.mjs scripts/photos/sources.mjs
git commit -m "feat(photos): fetch masters from Supabase into local backup"
```

---

### Task 3: Generate derivatives and manifest

**Files:**
- Create: `scripts/photos/build-derivatives.mjs`
- Generates: `derivatives/`, `lib/photo-manifest.json`

- [ ] **Step 1: Write the build script**

Create `scripts/photos/build-derivatives.mjs`:

```js
// scripts/photos/build-derivatives.mjs
// masters/ -> derivatives/ (AVIF + WebP ladder) + lib/photo-manifest.json

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import sharp from 'sharp'
import {
  ALL_WIDTHS, FORMATS, MASTERS_DIR, DERIVATIVES_DIR, MANIFEST_PATH,
} from './config.mjs'
import { photoId, derivativeKey } from './urls.mjs'
import { SOURCE_PHOTOS } from './sources.mjs'

/** Average colour, used as a placeholder tint while a photo loads. */
async function averageColour(image) {
  const { data } = await image.clone().resize(1, 1, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true })
  const hex = n => n.toString(16).padStart(2, '0')
  return `#${hex(data[0])}${hex(data[1])}${hex(data[2])}`
}

const manifest = {}
let totalOut = 0

for (const { category, filename } of SOURCE_PHOTOS) {
  const id = photoId(filename)
  const srcPath = join(MASTERS_DIR, category, filename)
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
      await mkdir(dirname(dest), { recursive: true })
      const buf = await sharp(input, { failOn: 'none' })
        .rotate()                       // bake in EXIF orientation
        .resize({ width: w, withoutEnlargement: true })
        [ext](options)
        .toBuffer()
      await writeFile(dest, buf)
      totalOut += buf.length
    }
  }
  console.log(`  ${id.padEnd(28)} ${width}x${height}  ${manifest[id].tint}`)
}

await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\n${Object.keys(manifest).length} photos -> ${(totalOut / 1048576).toFixed(1)} MB of derivatives`)
console.log(`Manifest written to ${MANIFEST_PATH}`)
```

- [ ] **Step 2: Run it**

Run: `npm run photos:build`
Expected: per-photo lines with real dimensions, then a total. Derivative total should be well under 30 MB across all rungs.

- [ ] **Step 3: Sanity-check the manifest**

Run: `node -e "const m=require('./lib/photo-manifest.json'); const k=Object.keys(m); console.log(k.length,'photos'); console.log(m[k[0]])"`
Expected: `29 photos` and an object with `category`, `width`, `height`, `tint`. Confirm width/height are plausible (thousands, not zero).

- [ ] **Step 4: Commit**

```bash
git add scripts/photos/build-derivatives.mjs lib/photo-manifest.json
git commit -m "feat(photos): generate AVIF/WebP ladder and dimension manifest"
```

---

### Task 4: Measurement harness

Written before the upload so the "before" number is captured against the live site.

**Files:**
- Create: `scripts/photos/measure.mjs`

- [ ] **Step 1: Write the script**

Create `scripts/photos/measure.mjs`:

```js
// scripts/photos/measure.mjs
// Reports total transfer weight of gallery imagery. Run before and after.

import { SOURCE_PHOTOS } from './sources.mjs'
import { masterUrl, photoId, derivativeUrl } from './urls.mjs'
import { GRID_WIDTHS } from './config.mjs'

const mode = process.argv[2] === 'after' ? 'after' : 'before'
const REPRESENTATIVE_WIDTH = GRID_WIDTHS.at(-1)

async function weigh(url) {
  const res = await fetch(url, { method: 'HEAD' })
  if (!res.ok) return { bytes: 0, cache: `HTTP ${res.status}` }
  return {
    bytes: Number(res.headers.get('content-length') ?? 0),
    cache: res.headers.get('cache-control') ?? 'none',
  }
}

const urls = SOURCE_PHOTOS.map(({ category, filename }) =>
  mode === 'before'
    ? masterUrl(category, filename)
    : derivativeUrl(category, photoId(filename), REPRESENTATIVE_WIDTH, 'avif')
)

const results = await Promise.all(urls.map(weigh))
const total = results.reduce((s, r) => s + r.bytes, 0)
const uncached = results.filter(r => /no-cache|no-store|max-age=0/.test(r.cache)).length

console.log(`mode:      ${mode}`)
console.log(`photos:    ${results.length}`)
console.log(`total:     ${(total / 1048576).toFixed(1)} MB`)
console.log(`average:   ${(total / results.length / 1048576).toFixed(2)} MB`)
console.log(`largest:   ${(Math.max(...results.map(r => r.bytes)) / 1048576).toFixed(2)} MB`)
console.log(`uncached:  ${uncached} of ${results.length}`)
```

- [ ] **Step 2: Capture the baseline**

Run: `npm run photos:measure` (defaults to `before`)
Expected, matching what the design interview found: ~191 MB total, ~6.6 MB average, 29 of 29 uncached. **Record this output in the commit message.**

- [ ] **Step 3: Commit**

```bash
git add scripts/photos/measure.mjs
git commit -m "feat(photos): add before/after weight measurement harness"
```

---

### Task 5: Upload derivatives — BLOCKED on credentials

Do not start until `.env.local` exists with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`. The user creates that file themselves; the key must never appear in chat, in a commit, or in a log line.

**Files:**
- Create: `scripts/photos/upload.mjs`

- [ ] **Step 1: Confirm credentials are present and that `.env.local` is ignored**

Run: `node --env-file=.env.local -e "console.log('url set:', !!process.env.SUPABASE_URL, '| key set:', !!process.env.SUPABASE_SERVICE_KEY)"`
Expected: `url set: true | key set: true`

Run: `git check-ignore -v .env.local`
Expected: a match against the `.env*` rule already in `.gitignore`. If there's no match, **stop** and add it before going further.

- [ ] **Step 2: Write the upload script**

Uses the Storage REST API directly — no new dependency. Uploads only to the `optimized/` prefix, so originals cannot be touched.

```js
// scripts/photos/upload.mjs
// derivatives/ -> Supabase storage, with a long cache-control.
// Writes ONLY under the optimized/ prefix. Originals are never modified.

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { BUCKET, CACHE_CONTROL, DERIVATIVES_DIR, DERIVATIVE_PATH } from './config.mjs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY. Run with: node --env-file=.env.local')
  process.exit(1)
}

const MIME = { avif: 'image/avif', webp: 'image/webp' }

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

async function upload(path) {
  const key = relative(DERIVATIVES_DIR, path).split(sep).join('/')
  if (!key.startsWith(`${DERIVATIVE_PATH}/`)) {
    throw new Error(`Refusing to upload outside ${DERIVATIVE_PATH}/: ${key}`)
  }
  const ext = key.split('.').pop()
  const body = await readFile(path)

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': CACHE_CONTROL,
      'x-upsert': 'true',
    },
    body,
  })
  if (!res.ok) throw new Error(`${res.status} uploading ${key}: ${await res.text()}`)
  return body.length
}

let count = 0, bytes = 0
for await (const path of walk(DERIVATIVES_DIR)) {
  bytes += await upload(path)
  count++
  if (count % 25 === 0) console.log(`  ${count} uploaded...`)
}
console.log(`\n${count} files, ${(bytes / 1048576).toFixed(1)} MB uploaded to ${DERIVATIVE_PATH}/`)
```

- [ ] **Step 3: Upload**

Run: `node --env-file=.env.local scripts/photos/upload.mjs`

- [ ] **Step 4: Verify cache headers actually took**

Run:
```bash
curl -sI "https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/optimized/city/RJ405649-1200.avif" | grep -iE "content-length|content-type|cache-control"
```
Expected: `content-type: image/avif`, a `content-length` in the low hundreds of KB, and `cache-control: public, max-age=31536000, immutable`. **If cache-control still says `no-cache`, stop** — the header isn't being honoured and the rest of the perf win depends on it.

- [ ] **Step 5: Confirm originals are untouched**

Run:
```bash
curl -sI "https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Images/City/Japan/RJ405649.jpg" | grep -i content-length
```
Expected: still `5669767`. The master is unchanged.

- [ ] **Step 6: Measure the after state and commit**

Run: `npm run photos:measure after`
Expected: total well under 10 MB, 0 of 29 uncached.

```bash
git add scripts/photos/upload.mjs
git commit -m "feat(photos): upload derivatives with immutable cache-control"
```

---

### Task 6: The `Photo` component

**Files:**
- Create: `components/Photo.tsx`
- Modify: `lib/gallery-items.ts`

- [ ] **Step 1: Rewrite gallery-items to consume the manifest**

Replace `lib/gallery-items.ts` entirely. The `layout`/`GalleryRow` concept is gone — placement now lives in `lib/gallery-layout.ts` (Task 7).

```ts
// lib/gallery-items.ts
import manifest from './photo-manifest.json'

export type GalleryCategory = 'city' | 'nature' | 'random' | 'paris'

export interface GalleryItem {
  id: string
  category: GalleryCategory
  width: number
  height: number
  tint: string
  alt: string
}

const ALT: Record<GalleryCategory, string> = {
  city: 'Japan',
  nature: 'Bend, Oregon',
  random: 'Photo',
  paris: 'Paris',
}

const entries = Object.entries(manifest) as [string, Omit<GalleryItem, 'id' | 'alt'>][]

const byCategory = (category: GalleryCategory): GalleryItem[] =>
  entries
    .filter(([, m]) => m.category === category)
    .map(([id, m]) => ({ id, ...m, category, alt: ALT[category] }))

export const cityItems = byCategory('city')
export const natureItems = byCategory('nature')
export const randomItems = byCategory('random')
export const parisItems = byCategory('paris')

export const allItems = [...cityItems, ...natureItems, ...randomItems, ...parisItems]
```

- [ ] **Step 2: Add the URL helper for the app side**

Append to `lib/gallery-items.ts`:

```ts
const DERIVATIVE_PREFIX =
  'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/optimized'

export const GRID_WIDTHS = [480, 768, 1200, 1800] as const
export const OVERLAY_WIDTH = 2560

export function photoUrl(item: GalleryItem, width: number, ext: 'avif' | 'webp'): string {
  return `${DERIVATIVE_PREFIX}/${item.category}/${item.id}-${width}.${ext}`
}

/** Only widths that were actually generated — the pipeline never upscales. */
export function availableWidths(item: GalleryItem): number[] {
  return GRID_WIDTHS.filter(w => w <= item.width)
}

export function srcSet(item: GalleryItem, ext: 'avif' | 'webp'): string {
  return availableWidths(item).map(w => `${photoUrl(item, w, ext)} ${w}w`).join(', ')
}
```

- [ ] **Step 3: Write the Photo component**

Create `components/Photo.tsx`. The `aspect-ratio` box is what eliminates layout shift — the browser reserves the exact space before the image arrives.

```tsx
'use client'

import { GalleryItem, srcSet, photoUrl, availableWidths } from '@/lib/gallery-items'

interface Props {
  item: GalleryItem
  /** Rendered width as a CSS `sizes` value, e.g. "(max-width: 768px) 90vw, 55vw". */
  sizes: string
  priority?: boolean
  onClick?: () => void
}

export default function Photo({ item, sizes, priority = false, onClick }: Props) {
  const widths = availableWidths(item)
  const fallbackWidth = widths.at(-1) ?? item.width

  return (
    <figure
      className="photo"
      style={{ aspectRatio: `${item.width} / ${item.height}`, backgroundColor: item.tint }}
      onClick={onClick}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet(item, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(item, 'webp')} sizes={sizes} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl(item, fallbackWidth, 'webp')}
          alt={item.alt}
          width={item.width}
          height={item.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </picture>
    </figure>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If `photo-manifest.json` import errors, confirm `resolveJsonModule` is enabled in `tsconfig.json` and add it if not.

- [ ] **Step 5: Commit**

```bash
git add lib/gallery-items.ts components/Photo.tsx tsconfig.json
git commit -m "feat(gallery): add responsive Photo component backed by manifest"
```

---

### Task 7: Floating layout

This replaces the fixed-`vh` + `object-fit: cover` grid. Photos now display **uncropped**.

**Files:**
- Create: `lib/gallery-layout.ts`, `components/GalleryFlow.tsx`
- Modify: `components/gallery.css`
- Delete: `components/GalleryGrid.tsx`

- [ ] **Step 1: Define the art direction**

Create `lib/gallery-layout.ts`. This is the file the user edits to art-direct placements — it deliberately holds no logic.

```ts
// lib/gallery-layout.ts
// Per-photo placement. `size` controls width, `align` controls horizontal position.
// Edit freely — this is the art direction layer.

export type PhotoSize = 'sm' | 'md' | 'lg' | 'xl'
export type PhotoAlign = 'left' | 'center' | 'right'

export interface Placement {
  size: PhotoSize
  align: PhotoAlign
}

export const DEFAULT_PLACEMENT: Placement = { size: 'md', align: 'center' }

/** Widths, as a share of the content column. Consumed by gallery.css via --photo-width. */
export const SIZE_WIDTH: Record<PhotoSize, string> = {
  sm: '38%',
  md: '55%',
  lg: '72%',
  xl: '100%',
}

/**
 * First pass at placement — alternating rhythm, wide photos given more room.
 * Keys are photo ids from lib/photo-manifest.json.
 */
export const PLACEMENTS: Record<string, Placement> = {
  // City — Japan
  'RJ405649': { size: 'lg', align: 'left' },
  'RJ405760': { size: 'sm', align: 'right' },
  'RJ405690': { size: 'md', align: 'center' },
  'RJ405702': { size: 'sm', align: 'left' },
  'RJ405650': { size: 'lg', align: 'right' },
  'RJ405757': { size: 'xl', align: 'center' },
  'RJ405776': { size: 'sm', align: 'left' },
  'RJ405808': { size: 'md', align: 'right' },
  'RJ405710-copy': { size: 'lg', align: 'center' },

  // Nature — Bend, Oregon
  'RJ400615': { size: 'xl', align: 'center' },
  'RJ400631': { size: 'md', align: 'left' },
  'RJ400656': { size: 'sm', align: 'right' },
  'RJ400680': { size: 'lg', align: 'center' },
  'RJ400695': { size: 'sm', align: 'left' },
  'RJ400721': { size: 'md', align: 'right' },
  'RJ400730': { size: 'lg', align: 'left' },
  'RJ400731': { size: 'md', align: 'center' },

  // Random
  'dji_fly_20230512_173012_662_1684010304506_photo_optimized': { size: 'xl', align: 'center' },
  'DSC07277': { size: 'md', align: 'right' },
  'IMG_8880': { size: 'sm', align: 'left' },
  'DSC07504': { size: 'lg', align: 'center' },

  // Paris
  'RJ402306': { size: 'xl', align: 'center' },
  'RJ402344': { size: 'md', align: 'left' },
  'RJ402371': { size: 'sm', align: 'right' },
  'RJ402536': { size: 'lg', align: 'center' },
  'RJ402597': { size: 'sm', align: 'left' },
  'RJ402605': { size: 'md', align: 'right' },
  'RJ402656': { size: 'lg', align: 'left' },
  'RJ402666': { size: 'md', align: 'center' },
}

export const placementFor = (id: string): Placement => PLACEMENTS[id] ?? DEFAULT_PLACEMENT
```

- [ ] **Step 2: Write GalleryFlow**

Create `components/GalleryFlow.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GalleryItem } from '@/lib/gallery-items'
import { placementFor, SIZE_WIDTH } from '@/lib/gallery-layout'
import Photo from './Photo'
import './gallery.css'

gsap.registerPlugin(ScrollTrigger)

/** Maps a placement size to a `sizes` attribute so the browser picks a sane rung. */
const SIZES: Record<string, string> = {
  sm: '(max-width: 768px) 88vw, 34vw',
  md: '(max-width: 768px) 88vw, 50vw',
  lg: '(max-width: 768px) 92vw, 66vw',
  xl: '(max-width: 768px) 96vw, 92vw',
}

interface Props {
  items: GalleryItem[]
  onItemClick: (globalIndex: number) => void
  indexOffset?: number
}

export default function GalleryFlow({ items, onItemClick, indexOffset = 0 }: Props) {
  const flowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.photo-slot').forEach(slot => {
        gsap.from(slot, {
          scrollTrigger: { trigger: slot, start: 'top 90%' },
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'power3.out',
        })
      })
    }, flowRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className="gallery-flow" ref={flowRef}>
      {items.map((item, i) => {
        const { size, align } = placementFor(item.id)
        return (
          <div
            key={item.id}
            className={`photo-slot photo-slot--${align}`}
            style={{ ['--photo-width' as string]: SIZE_WIDTH[size] }}
          >
            <Photo
              item={item}
              sizes={SIZES[size]}
              priority={i === 0}
              onClick={() => onItemClick(indexOffset + i)}
            />
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Rewrite the CSS**

Replace `components/gallery.css` entirely. Note what leaves: `object-fit: cover`, the fixed `vh` heights, the `#111` cell backing, and `filter: brightness(0.9)` — all four existed to make a dark mosaic cohere, and all four fight the floating look.

```css
/* components/gallery.css */

.gallery-flow {
  --flow-max: 1440px;
  --flow-rhythm: clamp(64px, 9vw, 140px);

  max-width: var(--flow-max);
  margin: 0 auto;
  padding: 0 clamp(24px, 5vw, 72px);
  display: flex;
  flex-direction: column;
  gap: var(--flow-rhythm);
}

.photo-slot {
  width: var(--photo-width, 55%);
  display: flex;
}

.photo-slot--left   { align-self: flex-start; }
.photo-slot--center { align-self: center; }
.photo-slot--right  { align-self: flex-end; }

.photo {
  width: 100%;
  display: block;
  overflow: hidden;
  cursor: pointer;
  /* aspect-ratio and background tint are set inline from the manifest,
     which reserves exact space and prevents layout shift. */
}

.photo img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.photo:hover img { transform: scale(1.02); }

@media (prefers-reduced-motion: reduce) {
  .photo img { transition: none; }
  .photo:hover img { transform: none; }
}

@media (max-width: 768px) {
  .gallery-flow {
    --flow-rhythm: clamp(40px, 12vw, 72px);
    padding: 0 16px;
  }
  /* On narrow screens every photo goes near-full width and centres. */
  .photo-slot { width: 100% !important; align-self: center; }
}
```

- [ ] **Step 4: Wire it into the creative page**

In `app/creative/page.tsx`: replace the `GalleryGrid` import with `GalleryFlow`, change the chapter definitions from `rows:` to `items:` (`cityItems`, `natureItems`, `randomItems`, `parisItems`), and swap the JSX element. Then delete the old component:

```bash
rm components/GalleryGrid.tsx
```

- [ ] **Step 5: Verify in the browser**

Start the dev server via the preview tool (not Bash) and open `/creative`. Check: photos sit at their true aspect ratio with background visible around them; no horizontal scrollbar; no layout shift as images load; the network panel shows AVIF files in the hundreds of KB, not multi-MB JPEGs.

- [ ] **Step 6: Commit**

```bash
git add lib/gallery-layout.ts components/GalleryFlow.tsx components/gallery.css app/creative/page.tsx
git rm components/GalleryGrid.tsx
git commit -m "feat(gallery): replace cropped grid with floating editorial layout"
```

---

### Task 8: Overlay — dedicated rung, prefetch, no eager load

Fixes the bug where the always-mounted overlay downloads image #1 at full resolution on every page load.

**Files:**
- Modify: `components/OverlayViewer.tsx`

- [ ] **Step 1: Render nothing until first open**

Add near the top of the component:

```tsx
const [hasOpened, setHasOpened] = useState(false)
useEffect(() => { if (open) setHasOpened(true) }, [open])
```

Then guard the media element so no `src` exists before the overlay has ever been opened:

```tsx
if (!hasOpened) return <div ref={overlayRef} className="overlay" aria-hidden="true" />
```

- [ ] **Step 2: Serve the overlay rung**

Replace the `<img src={item?.src ?? ''}>` with the 2560px derivative:

```tsx
<img
  ref={mediaRef as React.RefObject<HTMLImageElement>}
  className="overlay-img"
  src={photoUrl(item, Math.min(OVERLAY_WIDTH, item.width), 'avif')}
  alt={item.alt}
  width={item.width}
  height={item.height}
/>
```

Import `photoUrl` and `OVERLAY_WIDTH` from `@/lib/gallery-items`.

- [ ] **Step 3: Prefetch neighbours**

Add, so arrow-key navigation feels instant:

```tsx
useEffect(() => {
  if (!open) return
  for (const offset of [1, -1]) {
    const neighbour = items[(displayIndex + offset + items.length) % items.length]
    if (!neighbour) continue
    const img = new Image()
    img.src = photoUrl(neighbour, Math.min(OVERLAY_WIDTH, neighbour.width), 'avif')
  }
}, [open, displayIndex, items])
```

- [ ] **Step 4: Verify**

In the browser on `/creative`, with the network panel filtered to images: on first load, confirm **no** 2560px overlay file is fetched. Open a photo — confirm exactly three fetches (current + two neighbours). Arrow left and right — confirm navigation paints instantly.

- [ ] **Step 5: Commit**

```bash
git add components/OverlayViewer.tsx
git commit -m "fix(overlay): serve dedicated rung, prefetch neighbours, stop eager load"
```

---

### Task 9: Hero video and cover images — PARTIALLY BLOCKED on ffmpeg

The poster is the important half and needs no ffmpeg. Do Steps 1–3 regardless; Steps 4–5 wait on the video decision.

**Files:**
- Modify: `app/creative/page.tsx`, `app/home.css:28`, `app/engineering/engineering.css:81`

- [ ] **Step 1: Convert the two oversized cover PNGs**

The home cover is 2.46 MB and the engineering cover 1.9 MB, both PNG. Download each, convert with sharp to AVIF (quality 60) and WebP, upload to `optimized/covers/`, and update the two `url(...)` references to point at the AVIF with a WebP `image-set()` fallback. Expect roughly 2.46 MB → under 200 KB.

- [ ] **Step 2: Add a hero poster**

Extract a representative frame (see Step 4 if ffmpeg is unavailable — the user can supply a still instead), convert to AVIF at 1920px, upload to `optimized/covers/creative-hero-poster.avif`.

- [ ] **Step 3: Put the poster in the markup**

In `app/creative/page.tsx`, the `<video>` currently has neither `src` nor `poster` at render — its `src` is assigned in a `useEffect`, so the hero is an empty black box until hydration. Add the poster to the JSX so it paints immediately and becomes the LCP element:

```tsx
<video
  ref={videoRef}
  className="video-hero__video"
  poster="https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/optimized/covers/creative-hero-poster.avif"
  preload="none"
  autoPlay muted loop playsInline
/>
```

- [ ] **Step 4: Verify whether the `.mov` ever played**

Open `/creative` in the browser, check the console and `videoRef.current.error`. If the QuickTime file doesn't decode in Chrome, this is a **correctness** fix, not just a perf one — record which it turned out to be.

- [ ] **Step 5: Re-encode (needs ffmpeg, or user-supplied files)**

Target ~1080p H.264 MP4 plus a VP9 WebM sibling, roughly 3–4 MB each, from the 32 MB masters. Upload to `optimized/video/`, then set both as `<source>` elements.

- [ ] **Step 6: Commit**

```bash
git add app/creative/page.tsx app/home.css app/engineering/engineering.css
git commit -m "perf(media): add hero poster, convert oversized cover PNGs to AVIF"
```

---

### Task 10: Verify and finish

- [ ] **Step 1: Full measurement**

Run: `npm run photos:measure after`
Expected: total under 10 MB, 0 of 29 uncached. Compare against the baseline recorded in Task 4.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: clean static export, no type errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: clean. The `no-img-element` disable comments in `Photo.tsx` are intentional — `next/image` is unavailable under `output: 'export'` with `unoptimized: true`.

- [ ] **Step 4: Review all 29 photos uncropped**

Walk the whole `/creative` page. Every photo now shows its full frame rather than a crop. Flag any whose composition suffers, and adjust its `size`/`align` in `lib/gallery-layout.ts`. **This is a real review pass, not a formality — it's the step where the art direction actually gets decided.**

- [ ] **Step 5: Open the PR**

```bash
git push -u origin feature/photo-pipeline-floating-gallery
```

Include the before/after measurement numbers in the PR body.
