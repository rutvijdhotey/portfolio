import type { Metadata } from 'next'

// page.tsx is a client component (GSAP), which cannot export metadata, so the
// route's title lives here instead. It must carry the template forward: a plain
// title string here would reset the root template for every nested route, and
// /engineering/notebound would lose its " — Rutvij Dhotey" suffix.
export const metadata: Metadata = {
  title: {
    default: 'Engineering',
    template: '%s — Rutvij Dhotey',
  },
  description: 'Software engineering work by Rutvij Dhotey, engineer at YouTube.',
}

export default function EngineeringLayout({ children }: { children: React.ReactNode }) {
  return children
}
