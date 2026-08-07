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
