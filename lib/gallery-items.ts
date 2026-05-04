// lib/gallery-items.ts

export type GalleryLayout = 'full' | 'halves' | 'large-small' | 'small-large' | 'thirds'
export type MediaType = 'photo' | 'video'

export interface GalleryItem {
  src: string
  alt: string
  type: MediaType
  poster?: string  // optional thumbnail shown in grid before video loads
}

export interface GalleryRow {
  layout: GalleryLayout
  items: GalleryItem[]
}

const BASE = 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Images'
const VBASE = 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Videos'

const jp = (file: string) => `${BASE}/Japan/${file}`
const ch = (file: string) => `${BASE}/Switzerland/${file}`
const rn = (file: string) => `${BASE}/Random/${file}`
const vid = (file: string) => `${VBASE}/${file}`

export const galleryRows: GalleryRow[] = [
  {
    layout: 'full',
    items: [
      { src: rn('dji_fly_20230512_173012_662_1684010304506_photo_optimized.jpg'), alt: 'Aerial', type: 'photo' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: jp('RJ405649.jpg'), alt: 'Japan', type: 'photo' },
      { src: jp('RJ405760.jpg'), alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'large-small',
    items: [
      { src: ch('RJ400991.jpg'), alt: 'Switzerland', type: 'photo' },
      { src: jp('RJ405651.jpg'), alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'thirds',
    items: [
      { src: jp('RJ405690.jpg'), alt: 'Japan', type: 'photo' },
      { src: jp('RJ405702.jpg'), alt: 'Japan', type: 'photo' },
      { src: rn('DSC04641.jpg'), alt: 'Photo', type: 'photo' },
    ],
  },
  {
    layout: 'small-large',
    items: [
      { src: rn('IMG_8880.jpg'), alt: 'Photo', type: 'photo' },
      { src: jp('RJ405720.jpg'), alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'full',
    items: [
      { src: jp('RJ405757.jpg'), alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: ch('RJ401212.jpg'), alt: 'Switzerland', type: 'photo' },
      { src: jp('RJ405808.jpg'), alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'thirds',
    items: [
      { src: jp('RJ405776.jpg'), alt: 'Japan', type: 'photo' },
      { src: jp('RJ405829.jpg'), alt: 'Japan', type: 'photo' },
      { src: ch('RJ401219.jpg'), alt: 'Switzerland', type: 'photo' },
    ],
  },
  {
    layout: 'large-small',
    items: [
      { src: jp('RJ405850.jpg'), alt: 'Japan', type: 'photo' },
      { src: rn('DSC07277.jpg'), alt: 'Photo', type: 'photo' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: jp('RJ405873.jpg'), alt: 'Japan', type: 'photo' },
      { src: jp('RJ405894.jpg'), alt: 'Japan', type: 'photo' },
    ],
  },
]

export const allItems: GalleryItem[] = galleryRows.flatMap(r => r.items)
