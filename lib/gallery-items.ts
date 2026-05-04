// lib/gallery-items.ts

export type GalleryLayout = 'full' | 'halves' | 'large-small' | 'small-large' | 'thirds'
export type MediaType = 'photo' | 'video'
export type GalleryCategory = 'city' | 'nature' | 'random'

export interface GalleryItem {
  src: string
  alt: string
  type: MediaType
  category: GalleryCategory
  poster?: string
}

export interface GalleryRow {
  layout: GalleryLayout
  items: GalleryItem[]
}

const BASE = 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Images'

const city   = (f: string) => `${BASE}/City/Japan/${f}`
const nature = (f: string) => `${BASE}/Nature/Bend%20Oregon%20LR%20Edits/${f}`
const rnd    = (f: string) => `${BASE}/Random/${f}`

const c = (f: string): GalleryItem => ({ src: city(f),   alt: 'Japan',       type: 'photo', category: 'city' })
const n = (f: string): GalleryItem => ({ src: nature(f), alt: 'Bend Oregon', type: 'photo', category: 'nature' })
const r = (f: string): GalleryItem => ({ src: rnd(f),    alt: 'Photo',       type: 'photo', category: 'random' })

// ── City ─────────────────────────────────────────────────────────────────────

export const cityRows: GalleryRow[] = [
  { layout: 'halves',      items: [c('RJ405649.jpg'), c('RJ405760.jpg')] },
  { layout: 'thirds',      items: [c('RJ405690.jpg'), c('RJ405702.jpg'), c('RJ405650.jpg')] },
  { layout: 'large-small', items: [c('RJ405757.jpg'), c('RJ405776.jpg')] },
  { layout: 'halves',      items: [c('RJ405808.jpg'), c('RJ405710%20copy.jpg')] },
]

// ── Nature ───────────────────────────────────────────────────────────────────

export const natureRows: GalleryRow[] = [
  { layout: 'full',        items: [n('RJ400615.jpg')] },
  { layout: 'halves',      items: [n('RJ400631.jpg'), n('RJ400656.jpg')] },
  { layout: 'thirds',      items: [n('RJ400680.jpg'), n('RJ400695.jpg'), n('RJ400721.jpg')] },
  { layout: 'halves',      items: [n('RJ400730.jpg'), n('RJ400731.jpg')] },
]

// ── Random ───────────────────────────────────────────────────────────────────

export const randomRows: GalleryRow[] = [
  { layout: 'large-small', items: [r('dji_fly_20230512_173012_662_1684010304506_photo_optimized.jpg'), r('DSC07277.jpg')] },
  { layout: 'halves',      items: [r('IMG_8880.jpg'), r('DSC07504.jpg')] },
]

// ── Flat list for overlay navigation (city → nature → random) ────────────────

export const cityItems   = cityRows.flatMap(r => r.items)
export const natureItems = natureRows.flatMap(r => r.items)
export const randomItems = randomRows.flatMap(r => r.items)
export const allItems    = [...cityItems, ...natureItems, ...randomItems]
