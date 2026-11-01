'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { SEASON_MS, nextSeason, type Season } from '@/lib/seasons'
import Sky from './Sky'

/* The hero, after poulo.site: the sky moves through the seasons on a timer,
   none, rain, snow, sun and round again. The season is a data attribute on
   the section; engineering.css fades the matching layer in and tints the
   "About me" lake to match.

   The server renders the first season, none, which is just the page colour.
   The timer runs only while the hero is on screen and motion is allowed, so
   with reduced motion or JS off the sky simply stays clear. */
export default function HeroScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const [season, setSeason] = useState<Season>('none')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)')
    let timer = 0
    let onScreen = false

    const sync = () => {
      window.clearInterval(timer)
      timer = 0
      if (onScreen && motion.matches) timer = window.setInterval(() => setSeason(nextSeason), SEASON_MS)
    }
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync() })
    io.observe(el)
    motion.addEventListener('change', sync)
    return () => {
      io.disconnect()
      motion.removeEventListener('change', sync)
      window.clearInterval(timer)
    }
  }, [])

  return (
    <section ref={ref} id="top" className="eng-scene" data-season={season} aria-label="Introduction">
      <div className="eng-stage">
        <div className="eng-layer eng-layer--rain" aria-hidden="true">
          <Sky kind="rain" active={season === 'rain'} className="eng-sky eng-sky--rain" />
          <span className="eng-mist" />
        </div>
        <div className="eng-layer eng-layer--snow" aria-hidden="true">
          <Sky kind="snow" active={season === 'snow'} className="eng-sky eng-sky--snow" />
          <span className="eng-mist" />
        </div>
        <div className="eng-layer eng-layer--sun" aria-hidden="true">
          <span className="eng-rays" />
          <span className="eng-sun" />
        </div>
        <div className="eng-stage-content">{children}</div>
      </div>
    </section>
  )
}
