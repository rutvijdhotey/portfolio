import type { Metadata } from 'next'
import { Instrument_Serif, Geist_Mono } from 'next/font/google'

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Engineering v3',
  description: 'Two modes of agentic AI — autonomous orchestration and embedded intelligence. Engineering work by Rutvij Dhotey.',
}

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${instrument.variable} ${geistMono.variable}`}>{children}</div>
}
