// lib/gallery-items.ts

export type GalleryLayout = 'full' | 'halves' | 'large-small' | 'small-large' | 'thirds'
export type MediaType = 'photo' | 'video'

export interface GalleryItem {
  src: string
  alt: string
  type: MediaType
}

export interface GalleryRow {
  layout: GalleryLayout
  items: GalleryItem[]
}

export const galleryRows: GalleryRow[] = [
  {
    layout: 'full',
    items: [
      { src: '/creative/dji_fly_20230512_173012_662_1684010304506_photo_optimized.jpg', alt: 'Aerial', type: 'photo' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: '/creative/Japan/RJ405649.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/Japan/RJ405760.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'large-small',
    items: [
      { src: '/creative/Switzerland/RJ400991.jpg', alt: 'Switzerland', type: 'photo' },
      { src: '/creative/Japan/RJ405651.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'thirds',
    items: [
      { src: '/creative/Japan/RJ405690.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/Japan/RJ405702.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/DSC04641.jpg', alt: 'Photo', type: 'photo' },
    ],
  },
  {
    layout: 'small-large',
    items: [
      { src: '/creative/IMG_8880.jpg', alt: 'Photo', type: 'photo' },
      { src: '/creative/Japan/RJ405720.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'full',
    items: [
      { src: '/creative/Japan/RJ405757.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: '/creative/Switzerland/RJ401212.jpg', alt: 'Switzerland', type: 'photo' },
      { src: '/creative/Japan/RJ405808.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'thirds',
    items: [
      { src: '/creative/Japan/RJ405817.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/Japan/RJ405829.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/Switzerland/RJ401219.jpg', alt: 'Switzerland', type: 'photo' },
    ],
  },
  {
    layout: 'large-small',
    items: [
      { src: '/creative/Japan/RJ405850.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/DSC07277.jpg', alt: 'Photo', type: 'photo' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: '/creative/Japan/RJ405873.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/Japan/RJ405894.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
]

export const allItems: GalleryItem[] = galleryRows.flatMap(r => r.items)
