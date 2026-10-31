'use client'

import { useEffect, useRef } from 'react'

/* The one piece of motion on /engineering_v1. It animates nothing that carries
   meaning — the portrait is fully drawn in the markup and stays drawn with JS
   off. All this does is nudge two pupils, so there is no reveal to get stuck
   in, which is the failure mode the old /engineering page has. */
export default function CursorPortrait({ className }: { className?: string }) {
  const left = useRef<SVGCircleElement>(null)
  const right = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const onMove = (e: MouseEvent) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const dx = Math.max(-5, Math.min(5, ((e.clientX - innerWidth / 2) / (innerWidth / 2)) * 5))
        const dy = Math.max(-4, Math.min(4, ((e.clientY - innerHeight / 2) / (innerHeight / 2)) * 4))
        const t = `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`
        left.current?.setAttribute('transform', t)
        right.current?.setAttribute('transform', t)
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <svg
      className={className}
      width="320"
      height="362"
      viewBox="0 0 320 362"
      role="img"
      aria-label="Line drawing of a face that looks toward your cursor"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 362c0-54 44-88 100-88s100 34 100 88" />
        <path d="M138 240v34M182 240v34" />
        <path d="M84 150c0-46 34-80 76-80s76 34 76 80c0 50-34 92-76 92s-76-42-76-92Z" />
        <path d="M84 146c-10 0-16 8-16 18s6 18 16 18M236 146c10 0 16 8 16 18s-6 18-16 18" />
        <path d="M88 132c4-42 34-62 72-62s68 20 72 62c-14-22-40-30-72-30s-58 8-72 30Z" />
        <path d="M112 136c8-5 20-5 28 0M180 136c8-5 20-5 28 0" />
        <path d="M160 158v24c0 4-3 7-7 7h-4" />
        <path d="M140 206c12 7 28 7 40 0" />
        <circle cx="130" cy="152" r="11" />
        <circle cx="190" cy="152" r="11" />
      </g>
      <circle ref={left} cx="130" cy="152" r="4.6" fill="currentColor" />
      <circle ref={right} cx="190" cy="152" r="4.6" fill="currentColor" />
    </svg>
  )
}
