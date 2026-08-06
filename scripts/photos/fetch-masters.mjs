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
