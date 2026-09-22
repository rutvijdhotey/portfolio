import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moved',
  alternates: { canonical: '/engineering/notebound' },
  robots: { index: false, follow: true },
}

/**
 * The app was renamed from Into Your Stories to Notebound, and its case study
 * moved with it. GitHub Pages cannot issue a 301, so this page redirects in the
 * browser. Do not delete it — links shared before the rename land here.
 */
export default function IntoYourStoriesMoved() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/engineering/notebound" />
      <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', gap: 14, textAlign: 'center', padding: 24 }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--content-muted)' }}>
          Into Your Stories is now Notebound.
        </p>
        <Link href="/engineering/notebound" style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--accent)' }}>
          Continue →
        </Link>
      </main>
    </>
  )
}
