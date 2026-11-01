'use client'

import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
import { HERO_ROLES } from '@/lib/profile'
import { ROLE_MS, vaporWords } from '@/lib/seasons'

type Layer = { key: number; role: number; out: boolean }

/* The role headline, after poulo.site. Every few seconds the letters of the
   current role evaporate (drift up, blur, fade, each on its own stagger)
   while the next role condenses up out of a blur in the same place.

   Screen readers get the whole list once, as text. The visible stack is
   hidden from them and sized by invisible copies of every role, so the
   buttons below never jump when a shorter or longer role comes in. The
   server renders role one, still; the timer runs only while the headline is
   on screen and motion is allowed. */
export default function HeroRoles() {
  const ref = useRef<HTMLHeadingElement>(null)
  const [layers, setLayers] = useState<Layer[]>([{ key: 0, role: 0, out: false }])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)')
    let timer = 0
    let onScreen = false

    const step = () => setLayers((ls) => {
      const cur = ls[ls.length - 1]
      return [{ ...cur, out: true }, { key: cur.key + 1, role: (cur.role + 1) % HERO_ROLES.length, out: false }]
    })
    const sync = () => {
      window.clearInterval(timer)
      timer = 0
      if (onScreen && motion.matches) timer = window.setInterval(step, ROLE_MS)
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
    <h1 ref={ref} className="eng-roles">
      <span className="sr-only">{HERO_ROLES.join(', ')}</span>
      <span className="eng-roles-stack" aria-hidden="true">
        {HERO_ROLES.map((r) => <span key={r} className="eng-role eng-role--sizer">{r}</span>)}
        {layers.map((l) => (
          <span key={l.key} className="eng-role">
            <Letters text={HERO_ROLES[l.role]} mode={l.out ? 'out' : l.key === 0 ? 'still' : 'in'} />
          </span>
        ))}
      </span>
    </h1>
  )
}

function Letters({ text, mode }: { text: string; mode: 'still' | 'in' | 'out' }) {
  return vaporWords(text).map((word, wi) => (
    <Fragment key={wi}>
      {wi > 0 && ' '}
      <span className="eng-word">
        {word.map((c, i) => (
          <span
            key={i}
            className={mode === 'still' ? undefined : `eng-vapor-${mode}`}
            style={{
              '--vx': `${c.vx}em`,
              '--dx': `${c.dx}em`,
              '--dy': `${c.dy}em`,
              animationDelay: `${mode === 'out' ? c.outDelay : c.inDelay}ms`,
            } as CSSProperties}
          >
            {c.ch}
          </span>
        ))}
      </span>
    </Fragment>
  ))
}
