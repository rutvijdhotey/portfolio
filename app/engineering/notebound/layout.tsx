import type { Metadata } from 'next'

// page.tsx is a client component (GSAP), which cannot export metadata, so the
// case study's title lives here instead.
export const metadata: Metadata = {
  title: 'Notebound',
  description: 'Case study: an iOS app that turns a trip’s photos, notes and voice into a written story and a mapped itinerary.',
}

export default function NoteboundLayout({ children }: { children: React.ReactNode }) {
  return children
}
