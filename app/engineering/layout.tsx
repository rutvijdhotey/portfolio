import type { Metadata } from 'next'
import { TikTok_Sans, IBM_Plex_Mono, Caveat } from 'next/font/google'

/* Scoped to this route rather than the root layout, so the photography pages
   never download them. The variables are consumed in engineering.css. */
const tiktok = TikTok_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-tiktok',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

// Handwriting for the one quote near the end of the page, as the reference
// does. One weight, so it stays small.
const hand = Caveat({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-hand',
  display: 'swap',
})

// The title must carry the root template forward: a plain title string here
// would reset it for every nested route, and /engineering/notebound would
// lose its " — Rutvij Dhotey" suffix.
export const metadata: Metadata = {
  title: {
    default: 'Engineering',
    template: '%s — Rutvij Dhotey',
  },
  description: 'Agentic AI and backend engineering by Rutvij Dhotey, engineer at YouTube.',
}

export default function EngineeringLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${tiktok.variable} ${mono.variable} ${hand.variable}`}>{children}</div>
}
