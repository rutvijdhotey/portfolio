'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './into-your-stories.css'

gsap.registerPlugin(ScrollTrigger)

const SHOTS = 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Engineering/Into%20Your%20Stories'
const VIDEO = 'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Videos/movie.mp4'

export default function IntoYourStoriesPage() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.iys-hero > *', {
        opacity: 0, y: 28, duration: 1, ease: 'power3.out', delay: 0.2, stagger: 0.1,
      })
      gsap.from('.iys-shot', {
        scrollTrigger: { trigger: '.iys-design', start: 'top 75%' },
        opacity: 0, y: 30, duration: 0.9, ease: 'power3.out', stagger: 0.12,
      })
      gsap.from('.iys-feature', {
        scrollTrigger: { trigger: '.iys-features', start: 'top 78%' },
        opacity: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.08,
      })
      gsap.from('.iys-diagram', {
        scrollTrigger: { trigger: '.iys-arch', start: 'top 70%' },
        opacity: 0, y: 30, duration: 1, ease: 'power3.out',
      })
      gsap.from('.iys-tradeoff', {
        scrollTrigger: { trigger: '.iys-tradeoffs', start: 'top 82%' },
        opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', stagger: 0.1,
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <main className="iys-main">
      {/* NAV */}
      <nav className="engineering-nav">
        <Link href="/engineering" className="nav-back">← Engineering</Link>
        <Link href="/" className="nav-name">Rutvij Dhotey</Link>
        <div className="nav-right">
          <a href="https://linkedin.com/in/rutvij-dhotey" className="nav-social" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://github.com/rutvijdhotey" className="nav-social" target="_blank" rel="noopener">GitHub</a>
          <span className="nav-section">Case Study</span>
        </div>
      </nav>

      {/* HERO */}
      <section className="iys-hero">
        <p className="iys-eyebrow">Case Study · Mobile + AI</p>
        <h1 className="iys-title">Into Your Stories</h1>
        <p className="iys-lede">
          An iOS app that turns a trip&apos;s photos, notes, and voice into a written story
          and a mapped, day-by-day itinerary — powered by a multi-model Claude pipeline,
          built offline-first.
        </p>
        <div className="iys-ctas">
          <a href="#demo" className="iys-cta iys-cta--primary">Watch demo →</a>
          <a href="https://github.com/rutvijdhotey/into-your-stories" className="iys-cta iys-cta--ghost" target="_blank" rel="noopener">View code →</a>
        </div>
      </section>

      {/* ACT I — DESIGN */}
      <section className="iys-section iys-design" id="design">
        <span className="iys-section-label">01 · Design</span>
        <h2 className="iys-section-title">A calm, voice-first capture experience.</h2>
        <p className="iys-section-intro">
          Travel is messy and hands-busy, so capture had to be effortless: hold to speak,
          or jot a line, tag it, and move on. The aesthetic is warm and quiet — the photos
          carry the color, the UI gets out of the way.
        </p>
        <div className="iys-shots">
          {[
            { src: `${SHOTS}/IMG_1353.PNG`, cap: 'Voice-first capture — hold to record, or type; auto-tagged by category.' },
            { src: `${SHOTS}/IMG_1352.PNG`, cap: 'Trip feed — notes with categories, locations, and a map toggle.' },
            { src: `${SHOTS}/IMG_1354.PNG`, cap: 'The generated story — narrative written from your notes and photos.' },
            { src: `${SHOTS}/IMG_1355.PNG`, cap: 'Itinerary view — a day-by-day plan with a category-pinned map.' },
          ].map((s) => (
            <figure className="iys-shot" key={s.src}>
              <div className="iys-phone">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={s.cap} className="iys-phone-img" loading="lazy" />
              </div>
              <figcaption className="iys-shot-cap">{s.cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ACT II — FEATURES */}
      <section className="iys-section iys-features" id="features">
        <span className="iys-section-label">02 · Features</span>
        <h2 className="iys-section-title">From a spoken note to a published story.</h2>
        <div className="iys-feature-grid">
          {[
            { h: 'Voice → intent capture', p: 'Hold to record. A transcript is classified by a Claude Haiku function into the right kind of note and auto-tagged — food, stay, activity — with location attached.' },
            { h: 'Multimodal photo curation', p: 'Claude Opus actually looks at the photos (downsized to base64 for vision), judges the strongest few per note, and picks a cover — never one-per-note padding.' },
            { h: 'Auto-itinerary with map', p: 'In the same generation call, the model emits a structured day-by-day itinerary with coordinates, rendered as morning/afternoon cards over a category-pinned map.' },
            { h: 'Offline-first capture & sync', p: 'Notes and photos capture with no signal and drain through upload/offline queues when connectivity returns. Generation status streams back over Supabase realtime.' },
            { h: 'EXIF & trip-aware location', p: 'Dates come from photo EXIF; a GPS fix is validated against the trip&apos;s anchors, inferring the nearest known city when a reading is implausible.' },
            { h: 'Readiness gates', p: 'A free local gate blocks thin trips instantly; a server-side LLM gate returns an honest “not enough notes” state rather than fabricating a story.' },
          ].map((f) => (
            <div className="iys-feature" key={f.h}>
              <h3 className="iys-feature-h">{f.h}</h3>
              <p className="iys-feature-p">{f.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ACT III — ARCHITECTURE */}
      <section className="iys-section iys-arch" id="architecture">
        <span className="iys-section-label">03 · System Architecture</span>
        <h2 className="iys-section-title">One generation call, the right model for each job.</h2>
        <p className="iys-section-intro">
          A React Native client talks to Supabase. Three Deno edge functions front Claude:
          cheap, fast Haiku for classification and tagging; Opus for the multimodal heavy
          lift. Reliability is defended server-side with a pg_cron sweep.
        </p>

        <div className="iys-diagram">
          <svg viewBox="0 0 900 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Into Your Stories system architecture">
            <defs>
              <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                <path d="M0,0 L7,3 L0,6 Z" fill="rgba(240,237,232,0.45)" />
              </marker>
            </defs>
            <g stroke="rgba(240,237,232,0.30)" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)">
              <line x1="190" y1="130" x2="330" y2="130" />
              <line x1="190" y1="230" x2="330" y2="230" />
              <line x1="190" y1="330" x2="330" y2="330" />
              <line x1="560" y1="130" x2="690" y2="130" />
              <line x1="560" y1="230" x2="690" y2="230" />
              <line x1="560" y1="330" x2="690" y2="330" />
            </g>
            <g>
              <rect x="30" y="90" width="160" height="280" rx="10" fill="rgba(240,237,232,0.04)" stroke="rgba(240,237,232,0.12)" />
              <text x="110" y="80" textAnchor="middle" className="d-cap">React Native · Expo</text>
              <text x="110" y="130" textAnchor="middle" className="d-node">Voice / Text capture</text>
              <text x="110" y="230" textAnchor="middle" className="d-node">Offline + upload queues</text>
              <text x="110" y="330" textAnchor="middle" className="d-node">Realtime status</text>
            </g>
            <g>
              <rect x="330" y="90" width="230" height="280" rx="10" fill="rgba(194,112,61,0.07)" stroke="rgba(194,112,61,0.35)" />
              <text x="445" y="80" textAnchor="middle" className="d-cap">Supabase · Edge Functions (Deno)</text>
              <text x="445" y="130" textAnchor="middle" className="d-node">detect-intent</text>
              <text x="445" y="230" textAnchor="middle" className="d-node">tag-note</text>
              <text x="445" y="330" textAnchor="middle" className="d-node">generate-blog</text>
            </g>
            <g>
              <rect x="690" y="90" width="180" height="280" rx="10" fill="rgba(240,237,232,0.04)" stroke="rgba(240,237,232,0.12)" />
              <text x="780" y="80" textAnchor="middle" className="d-cap">Claude</text>
              <text x="780" y="130" textAnchor="middle" className="d-node">Haiku 4.5 · intent</text>
              <text x="780" y="230" textAnchor="middle" className="d-node">Haiku 4.5 · tags</text>
              <text x="780" y="330" textAnchor="middle" className="d-node">Opus 4.8 · multimodal</text>
            </g>
            <g>
              <rect x="330" y="400" width="540" height="42" rx="8" fill="rgba(240,237,232,0.04)" stroke="rgba(240,237,232,0.12)" />
              <text x="600" y="426" textAnchor="middle" className="d-node">Postgres (notes · trips · blog_posts·itinerary jsonb) · pg_cron stale-sweep</text>
            </g>
          </svg>
        </div>

        <div className="iys-tradeoffs">
          {[
            { h: 'Model selection', p: 'Haiku for classification/tagging keeps per-note cost near zero; Opus is reserved for the one creative, multimodal call that actually warrants it.' },
            { h: 'Vision without blowing the budget', p: 'Photos are downsized to ~1536px and base64-encoded just for the model&apos;s eyes; the blog always embeds the original full-res URLs.' },
            { h: 'Supplementary, never fatal', p: 'A malformed itinerary stores null but the narrative still saves — one feature failing never blocks the core output.' },
            { h: 'Reliability backstop', p: 'A pg_cron job marks any run stuck “generating” past 5 minutes as errored, so the client never spins forever.' },
          ].map((t) => (
            <div className="iys-tradeoff" key={t.h}>
              <h3 className="iys-tradeoff-h">{t.h}</h3>
              <p className="iys-tradeoff-p">{t.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO */}
      <section className="iys-section iys-demo" id="demo">
        <span className="iys-section-label">Demo</span>
        <h2 className="iys-section-title">See it run.</h2>
        <div className="iys-video-wrap">
          <video className="iys-video" controls playsInline preload="metadata">
            <source src={VIDEO} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* PRACTICE */}
      <section className="iys-section iys-practice">
        <span className="iys-section-label">Engineering Practice</span>
        <h2 className="iys-section-title">Shipped with discipline.</h2>
        <p className="iys-section-intro">
          Built spec → plan → task-by-task with review at each step. 289 tests, TypeScript
          clean, migrations verified live against Supabase before merge. Edge functions
          versioned and redeployed per change.
        </p>
        <p className="iys-footnote">
          Built with the help of Claude Code — the same AI-augmented workflow I use to move
          fast without giving up rigor.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="iys-footer">
        <a href={VIDEO} className="iys-cta iys-cta--primary" target="_blank" rel="noopener">Watch demo →</a>
        <a href="https://github.com/rutvijdhotey/into-your-stories" className="iys-cta iys-cta--ghost" target="_blank" rel="noopener">View code →</a>
        <Link href="/engineering" className="iys-back-link">← Back to Engineering</Link>
      </footer>
    </main>
  )
}
