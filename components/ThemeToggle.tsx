'use client'

import { useEffect, useState } from 'react'
import { resolveTheme, nextTheme, THEME_STORAGE_KEY, type Theme } from '@/lib/theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
    setTheme(resolveTheme(stored, prefersLight))
  }, [])

  function flip() {
    if (!theme) return
    const next = nextTheme(theme)
    document.documentElement.dataset.theme = next
    localStorage.setItem(THEME_STORAGE_KEY, next)
    setTheme(next)
  }

  // Render a placeholder until the client knows the theme, so the label is
  // never wrong and the layout does not shift when it resolves.
  if (!theme) return <span className="theme-toggle" aria-hidden="true" />

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={flip}
      aria-label={`Switch to ${nextTheme(theme)} theme`}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
