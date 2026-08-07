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
