'use client'

import { useEffect, useRef } from 'react'
import { dropY, flakeAt, makeDrops, makeFlakes, starCountFor } from '@/lib/stars'

/* Decorative canvas behind the hero: falling rain or drifting snow.
   HeroScene renders one of each and fades the layer of the current season in
   with CSS. A canvas animates only while it is on screen and its season is
   showing, and for the length of the fade after; otherwise it sits still.
   It draws one still frame under reduced motion, sizes itself to its box,
   and takes its colour from CSS `color`, so it needs no theme reader. */
const FADE_MS = 1400

export default function Sky({ kind, active, className }: { kind: 'rain' | 'snow'; active: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  const kick = useRef<() => void>(() => {})

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let drops = makeDrops(120)
    let flakes = makeFlakes(120)
    let w = 0, h = 0, dpr = 1, raf = 0, visible = false, stopAt = 0

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = rect.width
      h = rect.height
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      const n = starCountFor(w, h)
      drops = makeDrops(n)
      flakes = makeFlakes(n)
    }

    function draw(t: number) {
      // Read per frame: the theme can flip mid-season.
      const colour = getComputedStyle(canvas!).color
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, w, h)
      if (kind === 'rain') {
        ctx!.strokeStyle = colour
        ctx!.lineWidth = 1
        ctx!.lineCap = 'round'
        ctx!.globalAlpha = 0.45
        ctx!.beginPath()
        for (const d of drops) {
          const x = d.x * w
          const y = dropY(d, t) * (h + 20) - 10
          ctx!.moveTo(x, y)
          ctx!.lineTo(x - d.len * 0.08, y + d.len)
        }
        ctx!.stroke()
      } else {
        ctx!.fillStyle = colour
        ctx!.globalAlpha = 0.8
        for (const f of flakes) {
          const p = flakeAt(f, t)
          ctx!.beginPath()
          ctx!.arc(f.x * w + p.sway, p.y * (h + 10) - 5, f.r, 0, Math.PI * 2)
          ctx!.fill()
        }
      }
      ctx!.globalAlpha = 1
    }

    function frame(ms: number) {
      raf = 0
      if (!visible || (!activeRef.current && ms > stopAt)) return
      draw(ms / 1000)
      raf = requestAnimationFrame(frame)
    }

    kick.current = () => {
      if (!activeRef.current) stopAt = performance.now() + FADE_MS
      if (visible && !raf && !reduce) raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(() => { if (visible) { resize(); draw(performance.now() / 1000) } })
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) return
      resize()
      draw(performance.now() / 1000)
      kick.current()
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      kick.current = () => {}
    }
  }, [kind])

  useEffect(() => {
    activeRef.current = active
    kick.current()
  }, [active])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
