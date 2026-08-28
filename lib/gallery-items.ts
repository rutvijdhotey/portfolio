// lib/gallery-items.ts
// URL and srcset helpers over the derivative ladder. This module no longer
// sources gallery data itself — PrintRoom and Roll read directly from the
// photo manifest and pass GalleryItem values in; placement and art direction
// for the retained band-pairing algorithm live in lib/gallery-layout.ts.

export type GalleryCategory = 'city' | 'copenhagen' | 'paris'

export interface GalleryItem {
  id: string
  category: GalleryCategory
  width: number
  height: number
  tint: string
  alt: string
}

const DERIVATIVE_PREFIX =
  'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/optimized'

/**
 * Widths offered in the page srcset. 2560 is included because the Print Room
 * renders frames up to 1440 CSS px, which needs 2880 device px at DPR 2 —
 * the 1800 rung is visibly short there. Frames narrower than a rung skip it;
 * see availableWidths().
 */
export const GRID_WIDTHS = [480, 768, 1200, 1800, 2560] as const
export const OVERLAY_WIDTH = 2560

export function photoUrl(item: GalleryItem, width: number, ext: 'avif' | 'webp'): string {
  return `${DERIVATIVE_PREFIX}/${item.category}/${item.id}-${width}.${ext}`
}

/** Only widths that were actually generated — the pipeline never upscales. */
export function availableWidths(item: GalleryItem): number[] {
  return GRID_WIDTHS.filter(w => w <= item.width)
}

export function srcSet(item: GalleryItem, ext: 'avif' | 'webp'): string {
  return availableWidths(item).map(w => `${photoUrl(item, w, ext)} ${w}w`).join(', ')
}

/**
 * Widest rung available for the fullscreen overlay. The pipeline never
 * upscales, so a master narrower than 2560 has no 2560 rung — RJ400204 is
 * 2304px wide and is the only such frame in the current corpus. Callers must
 * not assume the dedicated rung exists.
 */
export function overlayWidth(item: GalleryItem): number {
  if (item.width >= OVERLAY_WIDTH) return OVERLAY_WIDTH
  return availableWidths(item).at(-1) ?? item.width
}
