// lib/gallery-layout.ts
// Per-photo placement. `size` controls width, `align` controls horizontal position.
// Edit freely — this is the art direction layer.

export type PhotoSize = 'sm' | 'md' | 'lg' | 'xl'
export type PhotoAlign = 'left' | 'center' | 'right'

export interface Placement {
  size: PhotoSize
  align: PhotoAlign
}

export const DEFAULT_PLACEMENT: Placement = { size: 'md', align: 'center' }

/** Widths, as a share of the content column. Consumed by gallery.css via --photo-width. */
export const SIZE_WIDTH: Record<PhotoSize, string> = {
  sm: '38%',
  md: '55%',
  lg: '72%',
  xl: '100%',
}

/**
 * First pass at placement — alternating rhythm, wide photos given more room.
 * Keys are photo ids from lib/photo-manifest.json.
 *
 * Portrait photos are deliberately capped at `md`: at `lg` or `xl` a 4:5 frame
 * becomes taller than the viewport and stops reading as a single image.
 */
export const PLACEMENTS: Record<string, Placement> = {
  // City — Japan
  'RJ405649': { size: 'lg', align: 'left' },
  'RJ405760': { size: 'sm', align: 'right' },
  'RJ405690': { size: 'md', align: 'center' },
  'RJ405702': { size: 'sm', align: 'left' },
  'RJ405650': { size: 'lg', align: 'right' },
  'RJ405757': { size: 'xl', align: 'center' },
  'RJ405776': { size: 'sm', align: 'left' },
  'RJ405808': { size: 'md', align: 'right' },
  'RJ405710-copy': { size: 'lg', align: 'center' },

  // Nature — Bend, Oregon
  'RJ400615': { size: 'xl', align: 'center' },
  'RJ400631': { size: 'md', align: 'left' },
  'RJ400656': { size: 'sm', align: 'right' },
  'RJ400680': { size: 'lg', align: 'center' },
  'RJ400695': { size: 'sm', align: 'left' },
  'RJ400721': { size: 'md', align: 'right' },
  'RJ400730': { size: 'lg', align: 'left' },
  'RJ400731': { size: 'md', align: 'center' },

  // Random
  'dji_fly_20230512_173012_662_1684010304506_photo_optimized': { size: 'xl', align: 'center' },
  'DSC07277': { size: 'md', align: 'right' },
  'IMG_8880': { size: 'sm', align: 'left' },
  'DSC07504': { size: 'lg', align: 'center' },

  // Paris
  'RJ402306': { size: 'xl', align: 'center' },
  'RJ402344': { size: 'md', align: 'left' },
  'RJ402371': { size: 'sm', align: 'right' },
  'RJ402536': { size: 'lg', align: 'center' },
  'RJ402597': { size: 'sm', align: 'left' },
  'RJ402605': { size: 'md', align: 'right' },
  'RJ402656': { size: 'lg', align: 'left' },
  'RJ402666': { size: 'md', align: 'center' },

  // Copenhagen — RJ400008, RJ400074 and RJ400204 are portrait
  'RJ400008': { size: 'md', align: 'center' },
  'RJ400034': { size: 'lg', align: 'left' },
  'RJ400074': { size: 'sm', align: 'right' },
  'RJ400161': { size: 'md', align: 'left' },
  'RJ400173': { size: 'lg', align: 'right' },
  'RJ400190': { size: 'md', align: 'center' },
  'RJ400204': { size: 'sm', align: 'left' },
  'RJ400207': { size: 'xl', align: 'center' },
  'RJ409387': { size: 'md', align: 'right' },
  'RJ409814': { size: 'lg', align: 'center' },
}

export const placementFor = (id: string): Placement => PLACEMENTS[id] ?? DEFAULT_PLACEMENT
