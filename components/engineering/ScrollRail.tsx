// components/engineering/ScrollRail.tsx
'use client'

import type { CSSProperties } from 'react'
import { SECTIONS } from '@/lib/sections'
import { useActiveSection } from './useActiveSection'

/* Resting lengths, so the rail reads as a little ruler rather than a list. */
const WIDTHS = [12, 20, 28, 22, 16]

/* Left-edge scroll rail: one dash per section, the active one long and
   bright. The name only appears on hover or focus, because a label that is
   always on collides with the content beside it. Plain anchors, so it works
   with JS off; CSS hides it below desktop widths. */
export default function ScrollRail() {
  const active = useActiveSection()

  return (
    <nav className="eng-rail" aria-label="Page sections">
      {SECTIONS.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="eng-rail-dash"
          aria-current={active === i ? 'true' : undefined}
          style={{ '--w': `${WIDTHS[i]}px` } as CSSProperties}
        >
          <b aria-hidden="true" />
          <span>{s.label}</span>
        </a>
      ))}
    </nav>
  )
}
