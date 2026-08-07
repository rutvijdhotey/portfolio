'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GalleryItem } from '@/lib/gallery-items'
import { placementFor, SIZE_WIDTH } from '@/lib/gallery-layout'
import Photo from './Photo'
import './gallery.css'

gsap.registerPlugin(ScrollTrigger)

/** Maps a placement size to a `sizes` attribute so the browser picks a sane rung. */
const SIZES: Record<string, string> = {
  sm: '(max-width: 768px) 88vw, 34vw',
  md: '(max-width: 768px) 88vw, 50vw',
  lg: '(max-width: 768px) 92vw, 66vw',
  xl: '(max-width: 768px) 96vw, 92vw',
}

interface Props {
  items: GalleryItem[]
  onItemClick: (globalIndex: number) => void
  indexOffset?: number
}

export default function GalleryFlow({ items, onItemClick, indexOffset = 0 }: Props) {
  const flowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.photo-slot').forEach(slot => {
        gsap.from(slot, {
          scrollTrigger: { trigger: slot, start: 'top 90%' },
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'power3.out',
        })
      })
    }, flowRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className="gallery-flow" ref={flowRef}>
      {items.map((item, i) => {
        const { size, align } = placementFor(item.id)
        return (
          <div
            key={item.id}
            className={`photo-slot photo-slot--${align}`}
            style={{ ['--photo-width' as string]: SIZE_WIDTH[size] }}
          >
            <Photo
              item={item}
              sizes={SIZES[size]}
              /* Only the very first photo on the page is eager — `i === 0`
                 alone would make one per chapter, five eager loads. */
              priority={indexOffset === 0 && i === 0}
              onClick={() => onItemClick(indexOffset + i)}
            />
          </div>
        )
      })}
    </div>
  )
}
