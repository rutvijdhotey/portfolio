// scripts/photos/build-derivatives.mjs
// masters/ -> derivatives/ (AVIF + WebP ladder) + lib/photo-manifest.json
//
// Incremental: a derivative is left alone when it is newer than both its
// master and config.mjs. Pass --force to re-encode everything — still needed
// after a sharp upgrade, which no mtime can detect. The manifest is always
// rebuilt in full; a partial manifest would be a broken one, and the
// per-photo decode costs seconds against minutes of encoding.

import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import {
  ALL_WIDTHS, FORMATS, MASTERS_DIR, DERIVATIVES_DIR, MANIFEST_PATH,
} from './config.mjs'
import { photoId, derivativeKey } from './urls.mjs'
import { SOURCE_PHOTOS } from './sources.mjs'
import { needsRebuild } from './freshness.mjs'

const FORCE = process.argv.includes('--force')

/** mtime in ms, or null when the file is genuinely absent. Any other stat error propagates. */
async function mtimeMs(path) {
  try {
    return (await stat(path)).mtimeMs
  } catch (err) {
    // Genuinely absent -> null. Anything else (EACCES, EIO) must not be
    // reported as "master missing"; let it propagate with its real code.
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') return null
    throw err
  }
}

// Derivatives depend on FORMATS and ALL_WIDTHS as much as on the master, so
// editing config.mjs must invalidate them. Treated as a floor on every
// master's mtime rather than a separate check.
const CONFIG_MTIME = (await mtimeMs(fileURLToPath(new URL('./config.mjs', import.meta.url)))) ?? 0

/** Average colour, used as a placeholder tint while a photo loads. */
async function averageColour(image) {
  const { data } = await image.clone().resize(1, 1, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true })
  const hex = n => n.toString(16).padStart(2, '0')
  return `#${hex(data[0])}${hex(data[1])}${hex(data[2])}`
}

const manifest = {}
let built = 0, skipped = 0, bytesWritten = 0

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

      if (!needsRebuild(await mtimeMs(dest), Math.max(srcMtime, CONFIG_MTIME), FORCE)) {
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
      bytesWritten += buf.length
    }
  }
  console.log(`  ${id.padEnd(28)} ${width}x${height}  ${manifest[id].tint}`)
}

await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\n${Object.keys(manifest).length} photos in the manifest`)
console.log(`${built} derivatives written (${(bytesWritten / 1048576).toFixed(1)} MB), ${skipped} already current`)
console.log(`Manifest written to ${MANIFEST_PATH}`)
