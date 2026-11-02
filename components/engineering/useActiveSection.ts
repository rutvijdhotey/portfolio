// components/engineering/useActiveSection.ts
'use client'

import { useSyncExternalStore } from 'react'
import { SECTIONS, activeIndex } from '@/lib/sections'

/* The index of the section in view, shared by the pill nav and the scroll
   rail (and, with their own ids, the case-study navs). A store over scroll
   and resize rather than state set in an effect: the snapshot is a plain
   number, so React only re-renders when it changes. The server (and the
   first client render) say the first section, index 0. */
const HOME_IDS: readonly string[] = SECTIONS.map((s) => s.id)

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true })
  window.addEventListener('resize', onChange)
  return () => {
    window.removeEventListener('scroll', onChange)
    window.removeEventListener('resize', onChange)
  }
}

function snapshot(ids: readonly string[]): number {
  const tops = ids.map((id) => {
    const el = document.getElementById(id)
    return el ? el.getBoundingClientRect().top + window.scrollY : NaN
  })
  return activeIndex(tops, window.scrollY, window.innerHeight, document.documentElement.scrollHeight)
}

export function useActiveSection(ids: readonly string[] = HOME_IDS): number {
  return useSyncExternalStore(subscribe, () => snapshot(ids), () => 0)
}
