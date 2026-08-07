// lib/gallery-items.ts
// Gallery data derived from the generated photo manifest. Placement and art
// direction live in lib/gallery-layout.ts, not here.

import manifest from './photo-manifest.json'

export type GalleryCategory = 'city' | 'nature' | 'random' | 'paris' | 'copenhagen'

export interface GalleryItem {
  id: string
  category: GalleryCategory
  width: number
  height: number
  tint: string
  alt: string
}

const ALT: Record<GalleryCategory, string> = {
  city: 'Japan',
  nature: 'Bend, Oregon',
  random: 'Photo',
  paris: 'Paris',
  copenhagen: 'Copenhagen',
}

type ManifestEntry = Omit<GalleryItem, 'id' | 'alt' | 'category'> & { category: string }

const entries = Object.entries(manifest) as [string, ManifestEntry][]

const byCategory = (category: GalleryCategory): GalleryItem[] =>
  entries
    .filter(([, m]) => m.category === category)
    .map(([id, m]) => ({ ...m, id, category, alt: ALT[category] }))

export const cityItems = byCategory('city')
export const natureItems = byCategory('nature')
export const randomItems = byCategory('random')
export const parisItems = byCategory('paris')
export const copenhagenItems = byCategory('copenhagen')

export const allItems = [
  ...cityItems, ...natureItems, ...randomItems, ...parisItems, ...copenhagenItems,
]

const DERIVATIVE_PREFIX =
  'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/optimized'

export const GRID_WIDTHS = [480, 768, 1200, 1800] as const
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
 * Widest rung available for the fullscreen overlay. The 8 Bend Oregon masters
 * are only 2048px wide, so the dedicated 2560 rung does not exist for them —
 * callers must not assume it does.
 */
export function overlayWidth(item: GalleryItem): number {
  if (item.width >= OVERLAY_WIDTH) return OVERLAY_WIDTH
  return availableWidths(item).at(-1) ?? item.width
}
