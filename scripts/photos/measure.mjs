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
