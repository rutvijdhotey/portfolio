'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GalleryRow } from '@/lib/gallery-items'
import './gallery.css'

gsap.registerPlugin(ScrollTrigger)

const layoutClass: Record<GalleryRow['layout'], string> = {
  'full':         'r-full',
  'halves':       'r-halves',
  'large-small':  'r-large-small',
  'small-large':  'r-small-large',
  'thirds':       'r-thirds',
}

interface Props {
  rows: GalleryRow[]
  onItemClick: (globalIndex: number) => void
}

export default function GalleryGrid({ rows, onItemClick }: Props) {
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rowEls = galleryRef.current?.querySelectorAll<HTMLElement>('.gallery-row')
      rowEls?.forEach(row => {
        gsap.from(row.querySelectorAll('.gallery-cell'), {
          scrollTrigger: { trigger: row, start: 'top 88%' },
          opacity: 0,
          y: 28,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.1,
        })
      })
    }, galleryRef)
    return () => ctx.revert()
  }, [])

  // Compute per-row start offsets so globalIndex is stable across renders
  const rowOffsets = rows.reduce<number[]>((acc, row, idx) => {
    acc.push((acc[idx - 1] ?? 0) + (idx > 0 ? rows[idx - 1].items.length : 0))
    return acc
  }, [])

  return (
    <main className="gallery" ref={galleryRef}>
      {rows.map((row, ri) => (
        <div key={ri} className={`gallery-row ${layoutClass[row.layout]}`}>
          {row.items.map((item, ii) => (
            <div key={ii} className="gallery-cell" onClick={() => onItemClick(rowOffsets[ri] + ii)}>
              {item.type === 'video' ? (
                <>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    src={item.src}
                    poster={item.poster}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                  <div className="gallery-cell__play">▶</div>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
              )}
            </div>
          ))}
        </div>
      ))}
    </main>
  )
}
