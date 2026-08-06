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
  copenhagen: 'Copenhagen',
}
