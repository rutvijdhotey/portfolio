// app/creative/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import GalleryGrid from '@/components/GalleryGrid'
import OverlayViewer from '@/components/OverlayViewer'
import { galleryRows, allItems } from '@/lib/gallery-items'
import './creative.css'

const VBASE = 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Videos'
const HERO_VIDEO_DESKTOP = `${VBASE}/IMG_7855.mov`
const HERO_VIDEO_MOBILE  = `${VBASE}/IMG_7946%20(1).mov`

export default function Creative() {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayIndex, setOverlayIndex] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('nav > *', { opacity: 0, y: -10, duration: 1, ease: 'power3.out', delay: 0.2, stagger: 0.08 })
      gsap.from('.hero-title', { opacity: 0, y: 30, duration: 1.2, ease: 'power3.out', delay: 0.4 })
      gsap.from('.hero-sub', { opacity: 0, y: 16, duration: 1, ease: 'power3.out', delay: 0.65 })
      gsap.from('.hero-scroll', { opacity: 0, duration: 1.2, delay: 1.2 })
    })
    return () => ctx.revert()
  }, [])

  return (
    <>
      <nav className="creative-nav">
        <Link href="/" className="nav-back">← Home</Link>
        <span className="nav-name">Rutvij Dhotey</span>
        <span className="nav-section">Creative</span>
      </nav>

      <section className="video-hero">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video className="video-hero__video" autoPlay muted loop playsInline>
          <source src={HERO_VIDEO_MOBILE}  media="(max-width: 768px)" type="video/quicktime" />
          <source src={HERO_VIDEO_DESKTOP} type="video/quicktime" />
        </video>
        <div className="video-hero__overlay" />
        <div className="video-hero__content">
          <h1 className="hero-title">Creative</h1>
          <p className="hero-sub">Travel Photography &amp; Film &nbsp;·&nbsp; Japan · Switzerland · California</p>
        </div>
        <div className="hero-scroll">scroll ↓</div>
      </section>

      <div className="photo-divider"><span>Photography</span></div>

      <GalleryGrid
        rows={galleryRows}
        onItemClick={i => { setOverlayIndex(i); setOverlayOpen(true) }}
      />

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
