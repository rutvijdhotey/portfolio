import type { Metadata } from 'next'
import { TikTok_Sans, IBM_Plex_Mono } from 'next/font/google'

/* Scoped to this route rather than the root layout, so none of the three
   design studies can alter what /engineering or the photography pages load. */
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

export const metadata: Metadata = {
  title: 'Engineering v1',
  description: 'Agentic AI engineering by Rutvij Dhotey — version 1 of three design studies.',
}

export default function V1Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${tiktok.variable} ${mono.variable}`}>{children}</div>
}
