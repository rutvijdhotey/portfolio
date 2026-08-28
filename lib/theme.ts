// lib/theme.ts
// Pure theme resolution. No DOM access — safe to unit test.

export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'theme'

/**
 * Resolve the theme to apply.
 *
 * Precedence: the visitor's explicit choice, then the OS preference, then
 * dark. Dark is the default because the photographs were made at night and
 * that is their better presentation — but a stated OS preference is a real
 * signal and is respected.
 */
export function resolveTheme(stored: string | null, prefersLight: boolean): Theme {
  if (stored === 'dark' || stored === 'light') return stored
  return prefersLight ? 'light' : 'dark'
}

export function nextTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark'
}
