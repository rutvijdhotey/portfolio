// scripts/photos/build-covers.mjs
// Converts the full-bleed background images and the creative hero poster into
// AVIF + WebP under derivatives/optimized/covers/. Separate from the gallery
// ladder: these are single-rung backgrounds, not responsive <img> sources.
//
// Run: npm run covers:build

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { DERIVATIVES_DIR, DERIVATIVE_PATH } from './config.mjs'

const OUT_DIR = join(DERIVATIVES_DIR, DERIVATIVE_PATH, 'covers')

/** One rung each — these are backgrounds, sized for a retina desktop. */
const WIDTH = 2560
const AVIF_QUALITY = 55
const WEBP_QUALITY = 78

/** The hero poster paints before the video loads, so it carries more detail. */
const POSTER_WIDTH = 1920
const POSTER_QUALITY = 62

const REMOTE = [
  {
    name: 'home-engineering',
    url: 'https://mskwqqbigtauakojpyhn.supabase.co/storage/v1/object/public/covers/Gemini_Generated_Image_hwg7nmhwg7nmhwg7.png',
  },
  {
    name: 'home-creative',
    url: 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Images/Random/HaleakalaSunrisePortrait_1.jpg',
  },
  {
    name: 'engineering-hero',
    url: 'https://mskwqqbigtauakojpyhn.supabase.co/storage/v1/object/public/covers/2026-04-17T07:02:16.297Z.png',
  },
]

/** Frame used as the creative hero's poster — the Shinjuku walkway, already in the Japan chapter. */
const POSTER_SOURCE = join('masters', 'city', 'RJ405650.jpg')

const mb = n => `${(n / 1048576).toFixed(2)} MB`
const kb = n => `${(n / 1024).toFixed(0)} KB`

async function fetchBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function emit(name, input, width, avifQuality, webpQuality) {
  const base = sharp(input).resize({ width, withoutEnlargement: true })

  const avif = await base.clone().avif({ quality: avifQuality }).toBuffer()
  await writeFile(join(OUT_DIR, `${name}.avif`), avif)

  let webp = null
  if (webpQuality !== null) {
    webp = await base.clone().webp({ quality: webpQuality }).toBuffer()
    await writeFile(join(OUT_DIR, `${name}.webp`), webp)
  }

  return { avif: avif.length, webp: webp?.length ?? 0 }
}

await mkdir(OUT_DIR, { recursive: true })

let before = 0
let after = 0

for (const { name, url } of REMOTE) {
  const source = await fetchBuffer(url)
  const { avif, webp } = await emit(name, source, WIDTH, AVIF_QUALITY, WEBP_QUALITY)
  before += source.length
  after += avif
  console.log(`${name.padEnd(20)} ${mb(source.length).padStart(9)} -> ${kb(avif).padStart(7)} avif, ${kb(webp).padStart(7)} webp`)
}

// The poster comes from a local master, so it costs nothing to fetch and needs
// no WebP sibling — the `poster` attribute takes a single URL.
const posterSource = await readFile(POSTER_SOURCE)
const { avif: posterBytes } = await emit(
  'creative-hero-poster', posterSource, POSTER_WIDTH, POSTER_QUALITY, null,
)
console.log(`${'creative-hero-poster'.padEnd(20)} ${mb(posterSource.length).padStart(9)} -> ${kb(posterBytes).padStart(7)} avif`)
after += posterBytes

console.log(`\n${REMOTE.length + 1} covers: ${mb(before)} of sources -> ${kb(after)} of AVIF`)
console.log(`Written to ${OUT_DIR}/ — upload with: npm run covers:upload`)
