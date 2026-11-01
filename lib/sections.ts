// lib/sections.ts
// The page's sections, which one is active, and the edge-mask fade. Pure, so
// the nav, the scroll rail and the masks agree and are tested in one place.

export const SECTIONS = [
  { id: 'top', label: 'Home' },
  { id: 'experience', label: 'Experience' },
  { id: 'works', label: 'Works' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact', label: 'Ask me anything' },
] as const

/** The active section: the last one whose top has crossed 40% of the way
 *  down the viewport. At the very bottom of the page the last section wins,
 *  because a short final section may never reach that line. `tops` are
 *  document offsets; a NaN (missing element) is skipped. */
export function activeIndex(tops: readonly number[], scrollY: number, viewport: number, docHeight: number): number {
  if (tops.length === 0) return 0
  if (scrollY + viewport >= docHeight - 4) return tops.length - 1
  const line = scrollY + viewport * 0.4
  let active = 0
  tops.forEach((top, i) => { if (Number.isFinite(top) && top <= line) active = i })
  return active
}

/** Top and bottom fades are hidden over the hero (they would not match the
 *  sky behind it) and fade in over 120px once its end is in view. */
export function maskOpacity(scrollY: number, heroEnd: number, viewport: number): number {
  const v = (scrollY - (heroEnd - viewport) + 40) / 120
  return Math.min(1, Math.max(0, v))
}
