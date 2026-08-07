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

const MAX_ATTEMPTS = 5
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function upload(path) {
  const key = relative(DERIVATIVES_DIR, path).split(sep).join('/')
  if (!key.startsWith(`${DERIVATIVE_PATH}/`)) {
    throw new Error(`Refusing to upload outside ${DERIVATIVE_PATH}/: ${key}`)
  }
  const ext = key.split('.').pop()
  const body = await readFile(path)

  // Supabase drops the keep-alive socket partway through a long run
  // (UND_ERR_SOCKET, "other side closed"). Retry with backoff rather than
  // losing the whole upload — x-upsert makes every attempt idempotent.
  for (let attempt = 1; ; attempt++) {
    try {
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
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw new Error(`${key} failed after ${MAX_ATTEMPTS} attempts: ${err.message}`)
      const wait = 500 * 2 ** (attempt - 1)
      console.log(`  retry ${attempt}/${MAX_ATTEMPTS - 1} for ${key} in ${wait}ms — ${err.message}`)
      await sleep(wait)
    }
  }
}

// An optional argument narrows the run to paths containing that substring, so a
// small change (say the covers) doesn't re-upload all 372 gallery derivatives.
// The optimized/ guard in upload() still applies either way.
const filter = process.argv[2]

let count = 0, bytes = 0, skipped = 0
for await (const path of walk(DERIVATIVES_DIR)) {
  if (filter && !path.includes(filter)) { skipped++; continue }
  bytes += await upload(path)
  count++
  if (count % 25 === 0) console.log(`  ${count} uploaded...`)
}
const scope = filter ? ` matching "${filter}" (${skipped} skipped)` : ''
console.log(`\n${count} files${scope}, ${(bytes / 1048576).toFixed(1)} MB uploaded to ${DERIVATIVE_PATH}/`)
