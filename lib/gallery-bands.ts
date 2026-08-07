// lib/gallery-bands.ts
// Partitions a chapter's photos into floating bands. Pure — no React, no DOM,
// no runtime import of the manifest (a value import of gallery-items would pull
// in photo-manifest.json, which plain Node cannot load).

import type { GalleryItem } from './gallery-items.ts'

export type Shape = 'pano' | 'wide' | 'square' | 'tall'

/** Aspect-ratio thresholds, lower edge inclusive. */
export function classify(item: GalleryItem): Shape {
  const ratio = item.width / item.height
  if (ratio >= 2.2) return 'pano'
  if (ratio >= 1.3) return 'wide'
  if (ratio >= 0.85) return 'square'
  return 'tall'
}

export interface BandPhoto {
  item: GalleryItem
  /** Position in the chapter's item array. The overlay's flat index depends on it. */
  index: number
  /** Width as a percentage of the content column. */
  share: number
  /** Downward offset as a percentage of this photo's own rendered height. */
  drop: number
}

export interface Band {
  photos: BandPhoto[]
  /** Which side of the column the band sits toward. */
  align: 'left' | 'right'
}

/** An authored grouping. Named on the lead photo's id. */
export interface BandOverride {
  /** Photo id, or ids, to place in the lead photo's band. */
  with: string | string[]
  /** Explicit shares, lead first. Falls back to the tuned pair shares. */
  shares?: number[]
  /** Explicit drops, lead first. Falls back to the derived drop. */
  drops?: number[]
}

export type BandOverrides = Record<string, BandOverride>

export interface Tuning {
  /** Share for a solo panorama. */
  panoSolo: number
  /** Share for a periodic solo, used as a breath between paired bands. */
  soloBreath: number
  /** Share for a portrait that could not pair. Kept small — a tall frame at 70% runs past the viewport. */
  tallSolo: number
  /** Insert a solo breath once this many paired bands have gone by. */
  soloEvery: number
  /** Default two-photo split, lead first. */
  pairShares: [number, number]
  /** Split for wide + wide, which needs a stronger size difference to avoid reading as a grid. */
  pairSharesWideWide: [number, number]
  /** Drop range, as a percentage of the dropped photo's own height. */
  dropRange: [number, number]
  /** Gap between photos in a band, as a percentage of the column. */
  gap: number
}
