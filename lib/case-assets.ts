// lib/case-assets.ts
// The images and video on the two case studies. Each has a self-hosted copy
// under public/img/engineering (built by scripts/engineering/fetch-case-assets.mjs,
// which records it in lib/case-assets.json) and the Supabase URL it came from.
// The pages use the self-hosted copy when the manifest lists it, and fall back
// to the source URL otherwise, so a page never shows a broken image.

export const ASSET_ROOT = '/img/engineering'

const SUPA = 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio'
const SHOTS = `${SUPA}/Engineering/Into%20Your%20Stories`

export type AssetSource = { key: string; kind: 'image' | 'video'; source: string; widths?: readonly number[] }

/** Display widths: the phone shots show at ~260px (so 400 and 800 cover 1x-3x);
 *  the pipeline diagram spans the content column. */
const PHONE = [400, 800] as const
const WIDE = [800, 1400, 2000] as const

export const CASE_ASSETS: readonly AssetSource[] = [
  { key: 'notebound/capture', kind: 'image', source: `${SHOTS}/IMG_1353.PNG`, widths: PHONE },
  { key: 'notebound/feed', kind: 'image', source: `${SHOTS}/IMG_1352.PNG`, widths: PHONE },
  { key: 'notebound/story', kind: 'image', source: `${SHOTS}/IMG_1354.PNG`, widths: PHONE },
  { key: 'notebound/itinerary', kind: 'image', source: `${SHOTS}/IMG_1355.PNG`, widths: PHONE },
  { key: 'notebound/demo', kind: 'video', source: `${SUPA}/Videos/movie.mp4` },
  {
    key: 'lacuriosity/pipeline',
    kind: 'image',
    source: `${SUPA}/Engineering/ChatGPT%20Image%20May%204,%202026,%2009_39_45%20PM.png`,
    widths: WIDE,
  },
]

export type ImageEntry = { kind: 'image'; w: number; h: number; widths: number[] }
export type VideoEntry = { kind: 'video'; w: number; h: number }
export type Manifest = Record<string, ImageEntry | VideoEntry>

export function imagePaths(key: string, widths: readonly number[], ext: string): string[] {
  return widths.map((w) => `${ASSET_ROOT}/${key}-${w}.${ext}`)
}

export function srcSet(key: string, widths: readonly number[], ext: string): string {
  const paths = imagePaths(key, widths, ext)
  return paths.map((p, i) => `${p} ${widths[i]}w`).join(', ')
}

export const videoPath = (key: string) => `${ASSET_ROOT}/${key}.mp4`
export const posterPath = (key: string) => `${ASSET_ROOT}/${key}-poster.webp`

export function findImage(m: Manifest, key: string): ImageEntry | null {
  const e = m[key]
  return e && e.kind === 'image' ? e : null
}

export function findVideo(m: Manifest, key: string): VideoEntry | null {
  const e = m[key]
  return e && e.kind === 'video' ? e : null
}

export function sourceOf(key: string): string {
  const a = CASE_ASSETS.find((x) => x.key === key)
  if (!a) throw new Error(`Unknown case asset: ${key}`)
  return a.source
}
