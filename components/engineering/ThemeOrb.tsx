// components/engineering/ThemeOrb.tsx
'use client'

import type { MouseEvent } from 'react'
import { nextTheme, resolveTheme, THEME_STORAGE_KEY, type Theme } from '@/lib/theme'
import { Icon } from './marks'

type WithViewTransition = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> }
}

/* Round theme button. Where the View Transitions API exists the new theme is
   revealed as a circle growing from the button; everywhere else, and under
   reduced motion, the theme simply swaps.

   It keeps no React state. Both icons are rendered and CSS shows the one for
   the current <html data-theme>, so the server markup is already right and
   there is nothing to sync after hydration. The click reads the theme from
   the DOM, which ThemeScript stamped before first paint. */
function current(): Theme {
  const t = document.documentElement.dataset.theme
  if (t === 'dark' || t === 'light') return t
  return resolveTheme(null, window.matchMedia('(prefers-color-scheme: light)').matches)
}

function apply(next: Theme) {
  document.documentElement.dataset.theme = next
  try { localStorage.setItem(THEME_STORAGE_KEY, next) } catch {}
}

export default function ThemeOrb() {
  function flip(e: MouseEvent<HTMLButtonElement>) {
    const next = nextTheme(current())
    const doc = document as WithViewTransition
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !doc.startViewTransition) {
      apply(next)
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    // The browser can skip a transition (hidden tab, another one in flight).
    // The theme is applied either way, so a skipped reveal is not an error.
    doc.startViewTransition(() => apply(next)).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    }).catch(() => {})
  }

  return (
    <button type="button" className="eng-orb" onClick={flip} aria-label="Switch between light and dark theme">
      <Icon name="sun" className="eng-orb-sun" />
      <Icon name="moon" className="eng-orb-moon" />
    </button>
  )
}
