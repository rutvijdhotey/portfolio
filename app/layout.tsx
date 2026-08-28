// app/layout.tsx
import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import ThemeScript from '@/components/ThemeScript'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://rutvijdhotey.com'),
  title: {
    default: 'Rutvij Dhotey — Street Photography',
    template: '%s — Rutvij Dhotey',
  },
  description: 'Street photography from Japan, Copenhagen and Paris. Cities, mostly after dark.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body className={`${fraunces.variable} ${dmSans.variable}`}>{children}</body>
    </html>
  )
}
