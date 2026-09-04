import Link from 'next/link'
import type { Metadata } from 'next'
import ThemeToggle from '@/components/ThemeToggle'
import { allFrames, TRIPS } from '@/lib/trips'
import '../photography/photography.css'
import './about.css'

export const metadata: Metadata = {
  title: 'About',
  description: 'Software engineer at YouTube. Photographs from my travels, and how this site is built.',
}

export default function AboutPage() {
  const frameCount = allFrames().length

  return (
    <>
      <nav className="ph-nav">
        <Link href="/" className="ph-nav__name">Rutvij Dhotey</Link>
        <div className="ph-nav__right">
          <Link href="/photography" className="ph-nav__link">Photography</Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="about">
        <h1>About</h1>

        <div className="about__body">
          <p>
            I&rsquo;m Rutvij. I build software at <strong>YouTube</strong>, and I photograph
            the places I travel to. Not to build a portfolio — so that in fifty years I can
            look back at all of it and laugh and cry.
          </p>
          <p>
            Everything here was shot on a Sony A7 IV across{' '}
            {TRIPS.map(t => t.title).join(', ')}. {frameCount} frames survive the edit.
          </p>
        </div>

        <section className="about__section">
          <div className="about__label">Engineering</div>
          <h2 className="about__h2">Into Your Stories</h2>
          <div className="about__body">
            <p>
              A journaling app built around the idea that the hard part isn&rsquo;t the
              writing, it&rsquo;s the starting.
            </p>
          </div>
          <div className="about__links">
            <Link href="/engineering/into-your-stories">Read the case study →</Link>
            <Link href="/engineering">More engineering →</Link>
          </div>
        </section>

        <section className="about__section">
          <div className="about__label">Colophon</div>
          <h2 className="about__h2">How this site is built</h2>
          <div className="colophon">
            <div>
              <b>The pictures</b>
              <p>
                Masters are processed offline with sharp into an AVIF and WebP ladder at
                five widths, then served from object storage with immutable cache headers.
                The gallery went from 211 MB to under 7.
              </p>
            </div>
            <div>
              <b>No layout shift</b>
              <p>
                Every photograph&rsquo;s dimensions and average colour are baked into a
                build-time manifest, so space is reserved exactly and the placeholder is
                the picture&rsquo;s own colour rather than grey.
              </p>
            </div>
            <div>
              <b>The site</b>
              <p>
                Next.js exported as static HTML, no server. Themed through a three-tier
                token layer, so switching light and dark swaps one tier and nothing else.
              </p>
            </div>
            <div>
              <b>The filmstrip</b>
              <p>
                Trip pages scroll vertically and travel horizontally. The mouse wheel is
                never intercepted — momentum, the scrollbar and find-in-page all keep working.
              </p>
            </div>
          </div>
        </section>

        <section className="about__section">
          <div className="about__label">Elsewhere</div>
          <div className="about__links">
            <a href="https://github.com/rutvijdhotey" target="_blank" rel="noopener">GitHub</a>
            <a href="https://www.linkedin.com/in/rutvijdhotey" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://instagram.com/intoyourstories" target="_blank" rel="noopener">Instagram</a>
            <a href="mailto:rutvij.dhotey@gmail.com">Email</a>
          </div>
        </section>
      </main>
    </>
  )
}
