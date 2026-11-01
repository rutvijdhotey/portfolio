// components/engineering/useActiveSection.ts
'use client'

import { useSyncExternalStore } from 'react'
import { SECTIONS, activeIndex } from '@/lib/sections'

/* The index of the section in view, shared by the pill nav and the scroll
   rail. A store over scroll and resize rather than state set in an effect:
   the snapshot is a plain number, so React only re-renders when it changes.
   The server (and the first client render) say the hero, index 0. */
function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true })
  window.addEventListener('resize', onChange)
  return () => {
    window.removeEventListener('scroll', onChange)
    window.removeEventListener('resize', onChange)
  }
}

function snapshot(): number {
  const tops = SECTIONS.map((s) => {
    const el = document.getElementById(s.id)
    return el ? el.getBoundingClientRect().top + window.scrollY : NaN
  })
  return activeIndex(tops, window.scrollY, window.innerHeight, document.documentElement.scrollHeight)
}

export function useActiveSection(): number {
  return useSyncExternalStore(subscribe, snapshot, () => 0)
}
