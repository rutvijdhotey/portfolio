// components/engineering/IntroSeen.tsx
'use client'

import { useEffect } from 'react'

/* Marks the intro as seen once it has had time to play, so client-side
   navigations back to /engineering in the same session skip it. The inline
   script in Intro.tsx covers full page loads before first paint. */
export default function IntroSeen() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      document.documentElement.dataset.intro = 'seen'
      try { sessionStorage.setItem('eng-intro-seen', '1') } catch {}
    }, 2000)
    return () => window.clearTimeout(t)
  }, [])
  return null
}
