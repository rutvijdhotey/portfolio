'use client'

import { useEffect, useRef, useState } from 'react'
import Photo from './Photo'
import { rollProgress, trackOffset, activeIndex, rollHeightPx } from '@/lib/roll'
import { frameAsItem, type Frame } from '@/lib/trips'

interface Props {
  frames: Frame[]
  tripTitle: string
  place: string
  year: number
}

export default function Roll({ frames, tripTitle, place, year }: Props) {
  const rollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const roll = rollRef.current
    const track = trackRef.current
    if (!roll || !track) return

    // Reduced motion turns the strip into a plain stack; no scrubbing at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let centres: number[] = []
    let pending = false

    function paint() {
      if (!roll || !track) return
      const p = rollProgress(window.scrollY, roll.offsetTop, roll.offsetHeight, window.innerHeight)
      track.style.transform = `translate3d(${trackOffset(p, centres, window.innerWidth).toFixed(1)}px,0,0)`
      setActive(activeIndex(p, frames.length))
    }

    function measure() {
      if (!roll || !track) return
      roll.style.height = `${rollHeightPx(frames.length, window.innerHeight)}px`
      centres = Array.from(track.children).map(c => {
        const el = c as HTMLElement
        return el.offsetLeft + el.offsetWidth / 2
      })
      paint()
    }

    function onScroll() {
      if (pending) return
      pending = true
      requestAnimationFrame(() => { pending = false; paint() })
    }

    measure()
    // clamp()-based gaps and the display face shift once web fonts land.
    document.fonts?.ready.then(measure).catch(() => {})

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [frames.length])

  return (
    <div className="roll" ref={rollRef}>
      <div className="roll__stage">
        <div className="roll__track" ref={trackRef}>
          {frames.map((f, i) => (
            <figure
              key={f.id}
              className="roll__frame"
              data-active={i === active}
              style={{ ['--arn' as string]: (f.width / f.height).toFixed(4) }}
            >
              <Photo
                item={frameAsItem(f)}
                sizes="(max-width: 768px) 88vw, 72vw"
                priority={i === 0}
              />
            </figure>
          ))}
        </div>

        <div className="roll__cap">
          <b>{tripTitle}</b>
          <span>
            {place} · {year} · {String(active + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}
          </span>
        </div>

        <div className="sprockets" aria-hidden="true">
          {frames.map((f, i) => <i key={f.id} className="sprk" data-on={i <= active} />)}
        </div>
      </div>
    </div>
  )
}
