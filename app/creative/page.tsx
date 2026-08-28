import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moved',
  alternates: { canonical: '/photography' },
  robots: { index: false, follow: true },
}

/**
 * /creative moved to /photography on 2026-08-27. GitHub Pages serves static
 * files only and cannot issue a 301, so this page redirects in the browser
 * and points crawlers at the canonical URL. Do not delete it — every link
 * shared before that date lands here.
 */
export default function CreativeMoved() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/photography" />
      <main
        style={{
          display: 'grid', placeItems: 'center', minHeight: '100vh',
          gap: 14, textAlign: 'center', padding: 24,
        }}
      >
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--content-muted)' }}>
          This page is now at /photography.
        </p>
        <Link
          href="/photography"
          style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--accent)' }}
        >
          Continue →
        </Link>
      </main>
    </>
  )
}
