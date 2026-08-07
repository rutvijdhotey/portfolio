'use client'

import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GalleryItem } from '@/lib/gallery-items'
import { buildBands, dropOffset, photoSizes } from '@/lib/gallery-bands'
import { BAND_OVERRIDES, TUNING } from '@/lib/gallery-layout'
import Photo from './Photo'
import './gallery.css'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  items: GalleryItem[]
  onItemClick: (globalIndex: number) => void
  indexOffset?: number
}

export default function GalleryFlow({ items, onItemClick, indexOffset = 0 }: Props) {
  const flowRef = useRef<HTMLDivElement>(null)
  const bands = useMemo(() => buildBands(items, BAND_OVERRIDES, TUNING), [items])

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Reveal a whole band at once, so a pair rises together. */
      gsap.utils.toArray<HTMLElement>('.photo-band').forEach(band => {
        gsap.from(band, {
          scrollTrigger: { trigger: band, start: 'top 90%' },
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'power3.out',
        })
      })
    }, flowRef)
    return () => ctx.revert()
  }, [bands])

  return (
    <div
      className="gallery-flow"
      ref={flowRef}
      style={{ ['--band-gap' as string]: `${TUNING.gap}%` }}
    >
      {bands.map((band, b) => (
        <div
          key={band.photos[0].item.id}
          className={`photo-band photo-band--${band.align}`}
        >
          {band.photos.map(photo => (
            <div
              key={photo.item.id}
              className="photo-band__slot"
              style={{
                ['--share' as string]: `${photo.share}%`,
                ['--drop' as string]: dropOffset(photo),
              }}
            >
              <Photo
                item={photo.item}
                sizes={photoSizes(photo.share)}
                /* Only the very first photo on the page is eager — one per
                   chapter would mean five eager loads. */
                priority={indexOffset === 0 && b === 0 && photo.index === 0}
                onClick={() => onItemClick(indexOffset + photo.index)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
