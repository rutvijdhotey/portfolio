// scripts/photos/measure.mjs
// Reports total transfer weight of gallery imagery. Run before and after.

import { SOURCE_PHOTOS } from './sources.mjs'
import { masterUrl, photoId, derivativeUrl } from './urls.mjs'
import { GRID_WIDTHS } from './config.mjs'

const mode = process.argv[2] === 'after' ? 'after' : 'before'
const REPRESENTATIVE_WIDTH = GRID_WIDTHS.at(-1)

// A HEAD against Supabase's CDN always reports `cache-control: no-cache`,
// regardless of what the object actually stores — the real value only comes
// back on a GET. A one-byte ranged GET gets the true header, and
// `content-range` still reports the full size.
async function weigh(url) {
  const res = await fetch(url, { headers: { Range: 'bytes=0-0' } })
  if (!res.ok && res.status !== 206) return { bytes: 0, cache: `HTTP ${res.status}` }
  const range = res.headers.get('content-range')
  const bytes = range
    ? Number(range.split('/')[1])
    : Number(res.headers.get('content-length') ?? 0)
  return { bytes, cache: res.headers.get('cache-control') ?? 'none' }
}

const urls = SOURCE_PHOTOS.map(({ category, filename }) =>
  mode === 'before'
    ? masterUrl(category, filename)
    : derivativeUrl(category, photoId(filename), REPRESENTATIVE_WIDTH, 'avif')
)

const results = await Promise.all(urls.map(weigh))
const total = results.reduce((s, r) => s + r.bytes, 0)
const missing = results.filter(r => r.bytes === 0)

const policies = {}
for (const r of results) policies[r.cache] = (policies[r.cache] ?? 0) + 1

console.log(`mode:      ${mode}`)
console.log(`photos:    ${results.length}`)
console.log(`total:     ${(total / 1048576).toFixed(1)} MB`)
console.log(`average:   ${(total / results.length / 1048576).toFixed(2)} MB`)
console.log(`largest:   ${(Math.max(...results.map(r => r.bytes)) / 1048576).toFixed(2)} MB`)
if (missing.length) console.log(`MISSING:   ${missing.length} of ${results.length} returned no bytes`)
console.log(`cache-control (from a ranged GET, not HEAD):`)
for (const [policy, n] of Object.entries(policies).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}x  ${policy}`)
}
