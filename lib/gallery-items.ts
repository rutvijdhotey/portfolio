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

export const galleryRows: GalleryRow[] = [
  {
    layout: 'full',
    items: [
      { src: nature('RJ400615.jpg'), alt: 'Bend Oregon', type: 'photo', category: 'nature' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: city('RJ405649.jpg'),  alt: 'Japan',       type: 'photo', category: 'city' },
      { src: city('RJ405760.jpg'),  alt: 'Japan',       type: 'photo', category: 'city' },
    ],
  },
  {
    layout: 'large-small',
    items: [
      { src: nature('RJ400631.jpg'), alt: 'Bend Oregon', type: 'photo', category: 'nature' },
      { src: rnd('DSC07277.jpg'),    alt: 'Photo',        type: 'photo', category: 'random' },
    ],
  },
  {
    layout: 'thirds',
    items: [
      { src: city('RJ405690.jpg'),   alt: 'Japan',       type: 'photo', category: 'city' },
      { src: nature('RJ400656.jpg'), alt: 'Bend Oregon', type: 'photo', category: 'nature' },
      { src: city('RJ405702.jpg'),   alt: 'Japan',       type: 'photo', category: 'city' },
    ],
  },
  {
    layout: 'small-large',
    items: [
      { src: rnd('IMG_8880.jpg'),   alt: 'Photo', type: 'photo', category: 'random' },
      { src: city('RJ405757.jpg'),  alt: 'Japan', type: 'photo', category: 'city' },
    ],
  },
  {
    layout: 'full',
    items: [
      { src: nature('RJ400680.jpg'), alt: 'Bend Oregon', type: 'photo', category: 'nature' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: nature('RJ400695.jpg'), alt: 'Bend Oregon', type: 'photo', category: 'nature' },
      { src: city('RJ405776.jpg'),   alt: 'Japan',       type: 'photo', category: 'city' },
    ],
  },
  {
    layout: 'large-small',
    items: [
      { src: city('RJ405808.jpg'),   alt: 'Japan',       type: 'photo', category: 'city' },
      { src: nature('RJ400721.jpg'), alt: 'Bend Oregon', type: 'photo', category: 'nature' },
    ],
  },
  {
    layout: 'thirds',
    items: [
      { src: rnd('dji_fly_20230512_173012_662_1684010304506_photo_optimized.jpg'), alt: 'Aerial', type: 'photo', category: 'random' },
      { src: nature('RJ400730.jpg'), alt: 'Bend Oregon', type: 'photo', category: 'nature' },
      { src: rnd('DSC07504.jpg'),    alt: 'Photo',        type: 'photo', category: 'random' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: city('RJ405650.jpg'),   alt: 'Japan',       type: 'photo', category: 'city' },
      { src: nature('RJ400731.jpg'), alt: 'Bend Oregon', type: 'photo', category: 'nature' },
    ],
  },
]

export const allItems: GalleryItem[] = galleryRows.flatMap(r => r.items)
