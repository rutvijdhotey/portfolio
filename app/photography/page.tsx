'use client'

import { useState } from 'react'
import Link from 'next/link'
import PrintRoom from '@/components/PrintRoom'
import OverlayViewer from '@/components/OverlayViewer'
import ThemeToggle from '@/components/ThemeToggle'
import { selectedFrames, frameAsItem, TRIPS, tripFrames } from '@/lib/trips'
import './photography.css'

const frames = selectedFrames()
const overlayItems = frames.map(frameAsItem)

export default function PhotographyPage() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <>
      <nav className="ph-nav">
        <Link href="/" className="ph-nav__name">Rutvij Dhotey</Link>
        <div className="ph-nav__right">
          <Link href="/about" className="ph-nav__link">About</Link>
          <ThemeToggle />
        </div>
      </nav>

      <header className="ph-head">
        <h1 className="ph-head__title">Things I want<br />to look back on.</h1>
        <p className="ph-head__sub">
          Twelve frames from three trips. Less a portfolio than a record — the places
          I walked through, and whoever happened to be passing.
        </p>
      </header>

      <PrintRoom
        frames={frames}
        onFrameClick={i => { setIndex(i); setOpen(true) }}
      />

      <section className="ph-trips">
        <div className="ph-trips__label">All trips</div>
        {TRIPS.map(t => (
          <Link key={t.slug} href={`/photography/${t.slug}`} className="ph-trip">
            <span className="ph-trip__title">{t.title}</span>
            <span className="ph-trip__meta">
              {t.place} · {t.year} · {tripFrames(t.slug).length} frames
            </span>
          </Link>
        ))}
      </section>

      <OverlayViewer
        items={overlayItems}
        open={open}
        currentIndex={index}
        onClose={() => setOpen(false)}
        onNavigate={setIndex}
      />

      <footer className="ph-foot">
        <span>© 2026 Rutvij Dhotey</span>
        <a href="https://instagram.com/intoyourstories" target="_blank" rel="noopener">Instagram</a>
      </footer>
    </>
  )
}
