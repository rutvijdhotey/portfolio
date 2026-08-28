'use client'

import { GalleryItem, srcSet, photoUrl, availableWidths } from '@/lib/gallery-items'
import './photo.css'

interface Props {
  item: GalleryItem
  /** Rendered width as a CSS `sizes` value, e.g. "(max-width: 768px) 90vw, 55vw". */
  sizes: string
  priority?: boolean
  onClick?: () => void
}

export default function Photo({ item, sizes, priority = false, onClick }: Props) {
  const widths = availableWidths(item)
  // The <img> src is only reached by browsers that match no <source> at all.
  // Give them a sane middle rung rather than the largest file we have.
  const fallbackWidth = widths.find(w => w >= 1200) ?? widths.at(-1) ?? item.width

  return (
    <figure
      className="photo"
      data-clickable={onClick ? 'true' : undefined}
      style={{ aspectRatio: `${item.width} / ${item.height}`, backgroundColor: item.tint }}
      onClick={onClick}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet(item, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(item, 'webp')} sizes={sizes} />
        <img
          src={photoUrl(item, fallbackWidth, 'webp')}
          alt={item.alt}
          width={item.width}
          height={item.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </picture>
    </figure>
  )
}
