// app/creative/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GalleryGrid from '@/components/GalleryGrid'
import OverlayViewer from '@/components/OverlayViewer'
import {
  cityRows, natureRows, randomRows,
  cityItems, natureItems, allItems,
} from '@/lib/gallery-items'
import './creative.css'

gsap.registerPlugin(ScrollTrigger)

const VBASE = 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Videos'
const HERO_VIDEO_DESKTOP = `${VBASE}/IMG_7855.mov`
const HERO_VIDEO_MOBILE  = `${VBASE}/test%20video.mov`

const chapters = [
  { key: 'city',   num: '01', title: 'City',   meta: 'Japan · Street & Architecture', rows: cityRows,   offset: 0 },
  { key: 'nature', num: '02', title: 'Nature',  meta: 'Bend, Oregon · Landscape',     rows: natureRows, offset: cityItems.length },
  { key: 'random', num: '03', title: 'Random',  meta: 'Various · Aerial & Candid',    rows: randomRows, offset: cityItems.length + natureItems.length },
]

export default function Creative() {
  const [overlayOpen, setOverlayOpen]   = useState(false)
  const [overlayIndex, setOverlayIndex] = useState(0)

  function openOverlay(index: number) {
    setOverlayIndex(index)
    setOverlayOpen(true)
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('nav > *', { opacity: 0, y: -10, duration: 1, ease: 'power3.out', delay: 0.2, stagger: 0.08 })
      gsap.from('.hero-title', { opacity: 0, y: 30, duration: 1.2, ease: 'power3.out', delay: 0.4 })
      gsap.from('.hero-sub',   { opacity: 0, y: 16, duration: 1,   ease: 'power3.out', delay: 0.65 })
      gsap.from('.hero-scroll',{ opacity: 0, duration: 1.2, delay: 1.2 })

      document.querySelectorAll<HTMLElement>('.chapter-intro').forEach(el => {
        gsap.from(el.querySelectorAll('.chapter-num, .chapter-title, .chapter-meta'), {
          scrollTrigger: { trigger: el, start: 'top 82%' },
          opacity: 0, y: 40, duration: 1.1, ease: 'power3.out', stagger: 0.08,
        })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <>
      <nav className="creative-nav">
        <Link href="/" className="nav-back">← Home</Link>
        <Link href="/" className="nav-name">Rutvij Dhotey</Link>
        <span className="nav-section">Creative</span>
      </nav>

      {/* ── Video Hero ── */}
      <section className="video-hero">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video className="video-hero__video" autoPlay muted loop playsInline>
          <source src={HERO_VIDEO_MOBILE}  media="(max-width: 768px)" />
          <source src={HERO_VIDEO_DESKTOP} />
        </video>
        <div className="video-hero__overlay" />
        <div className="video-hero__content">
          <h1 className="hero-title">Creative</h1>
          <p className="hero-sub">Travel Photography &amp; Film &nbsp;·&nbsp; Japan · Oregon · California</p>
        </div>
        <div className="hero-scroll">scroll ↓</div>
      </section>

      {/* ── Chapters ── */}
      {chapters.map(ch => (
        <section key={ch.key} className="chapter">
          <div className="chapter-intro">
            <div className="chapter-left">
              <div className="chapter-num">{ch.num}</div>
              <div className="chapter-title">{ch.title}</div>
            </div>
            <div className="chapter-meta">{ch.meta}</div>
          </div>
          <GalleryGrid
            rows={ch.rows}
            indexOffset={ch.offset}
            onItemClick={openOverlay}
          />
        </section>
      ))}

      <OverlayViewer
        items={allItems}
        open={overlayOpen}
        currentIndex={overlayIndex}
        onClose={() => setOverlayOpen(false)}
        onNavigate={i => setOverlayIndex(i)}
      />

      <footer className="creative-footer">
        <span className="creative-footer-name">© 2026 Rutvij Dhotey</span>
        <nav className="creative-footer-links">
          <a href="https://linkedin.com/in/rutvij-dhotey" className="creative-footer-link" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://github.com/rutvijdhotey" className="creative-footer-link" target="_blank" rel="noopener">GitHub</a>
          <Link href="/" className="creative-footer-link">← Home</Link>
        </nav>
      </footer>
    </>
  )
}
