import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Roll from '@/components/Roll'
import ThemeToggle from '@/components/ThemeToggle'
import { TRIPS, tripBySlug, tripFrames } from '@/lib/trips'
import '../photography.css'
import './roll.css'

export function generateStaticParams() {
  return TRIPS.map(t => ({ slug: t.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const trip = tripBySlug(slug)
  if (!trip) return {}
  return {
    title: trip.title,
    description: `${trip.blurb} ${tripFrames(slug).length} frames from ${trip.place}, ${trip.year}.`,
  }
}

export default async function TripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const trip = tripBySlug(slug)
  if (!trip) notFound()
  const frames = tripFrames(slug)

  return (
    <>
      <nav className="ph-nav">
        <Link href="/photography" className="ph-nav__name">← Photography</Link>
        <div className="ph-nav__right">
          <Link href="/about" className="ph-nav__link">About</Link>
          <ThemeToggle />
        </div>
      </nav>

      <header className="ph-head">
        <h1 className="ph-head__title">{trip.title}</h1>
        <p className="ph-head__sub">{trip.blurb}</p>
      </header>

      <Roll frames={frames} tripTitle={trip.title} place={trip.place} year={trip.year} />

      <footer className="ph-foot">
        <Link href="/photography">← All trips</Link>
        <span>© 2026 Rutvij Dhotey</span>
      </footer>
    </>
  )
}
