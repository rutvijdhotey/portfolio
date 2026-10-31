import type { Metadata } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'

/* Only the mono face is added here. The serif and sans this version uses are
   already loaded by the root layout, which is the point: v2 argues for
   restraint, so it should not cost extra bytes to make that argument. */
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Engineering v2',
  description: 'Rutvij Dhotey — software engineer at YouTube. Nine years of backend and ML work, written for the person doing the hiring.',
}

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <div className={mono.variable}>{children}</div>
}
