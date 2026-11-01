// components/engineering/EdgeMasks.tsx
'use client'

import { useEffect, useRef } from 'react'
import { maskOpacity } from '@/lib/sections'

/* Fixed top and bottom fades, so content dissolves under the floating nav
   instead of being cut by it. They stay hidden over the hero, whose sky
   would not match the page colour they fade to, and fade in once the hero's
   end is on screen. Opacity is written straight to the DOM: no state. */
export default function EdgeMasks() {
  const top = useRef<HTMLDivElement>(null)
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const hero = document.getElementById('top')
      const end = hero ? hero.getBoundingClientRect().bottom + window.scrollY : 0
      const o = maskOpacity(window.scrollY, end, window.innerHeight).toFixed(2)
      if (top.current) top.current.style.opacity = o
      if (bottom.current) bottom.current.style.opacity = o
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={top} className="eng-mask eng-mask--top" aria-hidden="true" />
      <div ref={bottom} className="eng-mask eng-mask--bottom" aria-hidden="true" />
    </>
  )
}
