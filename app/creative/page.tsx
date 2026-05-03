// app/creative/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import GalleryGrid from '@/components/GalleryGrid'
import OverlayViewer from '@/components/OverlayViewer'
import { galleryRows, allItems } from '@/lib/gallery-items'
import './creative.css'

export default function Creative() {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayIndex, setOverlayIndex] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('nav > *', { opacity: 0, y: -10, duration: 1, ease: 'power3.out', delay: 0.2, stagger: 0.08 })
      gsap.from('.creative-title', { opacity: 0, y: 30, duration: 1.2, ease: 'power3.out', delay: 0.3 })
      gsap.from('.creative-sub', { opacity: 0, y: 20, duration: 1, ease: 'power3.out', delay: 0.5 })
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

      <header className="creative-header">
        <h1 className="creative-title">Creative</h1>
        <div className="creative-sub">
          Travel Photography &amp; Film<br />
          Japan · Switzerland · California
        </div>
      </header>

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
