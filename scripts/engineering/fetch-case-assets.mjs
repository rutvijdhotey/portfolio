// scripts/engineering/fetch-case-assets.mjs
// Self-hosts the case-study images and video.
//
//   npm run case-assets            fetch what is missing, build, write the manifest
//   npm run case-assets -- --force re-download and rebuild everything
//
// Originals are cached in .cache/case-assets (gitignored). Outputs go to
// public/img/engineering/<key>-<width>.{avif,webp}, <key>.mp4 and
// <key>-poster.webp, and lib/case-assets.json records what exists, which is
// what switches the pages from the Supabase URL to the local copy.
// Needs network access to knlwzjvuqipjrjpgnovc.supabase.co, and ffmpeg for video.

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { ASSET_ROOT, CASE_ASSETS, imagePaths, posterPath, videoPath } from '../../lib/case-assets.ts'

const FORCE = process.argv.includes('--force')
const CACHE = '.cache/case-assets'
const PUBLIC = 'public'
const MANIFEST = 'lib/case-assets.json'
const FORMATS = [
  { ext: 'avif', opts: { quality: 55, effort: 6 } },
  { ext: 'webp', opts: { quality: 78 } },
]
const VIDEO_WIDTH = 1280
const VIDEO_WARN_MB = 50

const out = (p) => path.join(PUBLIC, p)

async function download(url, file) {
  if (!FORCE && existsSync(file)) return
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, Buffer.from(await res.arrayBuffer()))
}

/** The requested widths that do not upscale; the source width alone if all would. */
function usableWidths(requested, sourceWidth) {
  const ok = requested.filter((w) => w <= sourceWidth)
  return ok.length ? ok : [sourceWidth]
}

async function buildImage(asset, master) {
  const meta = await sharp(master).metadata()
  const widths = usableWidths(asset.widths, meta.width)
  for (const { ext, opts } of FORMATS) {
    const files = imagePaths(asset.key, widths, ext)
    for (let i = 0; i < widths.length; i++) {
      await mkdir(path.dirname(out(files[i])), { recursive: true })
      await sharp(master).rotate().resize({ width: widths[i] })[ext](opts).toFile(out(files[i]))
    }
  }
  return { kind: 'image', w: meta.width, h: meta.height, widths }
}

function buildVideo(asset, master) {
  const mp4 = out(videoPath(asset.key))
  const posterPng = path.join(CACHE, `${asset.key}-poster.png`)
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', master,
    '-vf', `scale='min(${VIDEO_WIDTH},iw)':-2`,
    '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', mp4,
  ])
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1', '-i', mp4, '-frames:v', '1', posterPng])
  const [w, h] = execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', mp4,
  ]).toString().trim().split(',').map(Number)
  return sharp(posterPng).webp({ quality: 78 }).toFile(out(posterPath(asset.key))).then(() => ({ kind: 'video', w, h }))
}

async function main() {
  await mkdir(out(ASSET_ROOT), { recursive: true })
  const manifest = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, 'utf8')) : {}

  for (const asset of CASE_ASSETS) {
    const ext = path.extname(new URL(asset.source).pathname).toLowerCase() || '.bin'
    const master = path.join(CACHE, `${asset.key}${ext}`)
    process.stdout.write(`${asset.key} … `)
    await download(asset.source, master)
    await mkdir(path.dirname(path.join(CACHE, asset.key)), { recursive: true })
    manifest[asset.key] = asset.kind === 'image' ? await buildImage(asset, master) : await buildVideo(asset, master)
    if (asset.kind === 'video') {
      const mb = (await stat(out(videoPath(asset.key)))).size / 1e6
      console.log(`done (${mb.toFixed(1)} MB${mb > VIDEO_WARN_MB ? ' — larger than expected, check before committing' : ''})`)
    } else {
      console.log(`done (${manifest[asset.key].widths.join(', ')}px)`)
    }
  }

  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`wrote ${MANIFEST}`)
}

main().catch((e) => {
  console.error(`\n${e.message}`)
  process.exit(1)
})
