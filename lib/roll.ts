// lib/roll.ts
// Scrub maths for The Roll.
//
// A trip is a roll of film, so a trip page is a strip of frames. The page
// scrolls VERTICALLY — native, momentum intact, the wheel is never
// intercepted — and the strip translates horizontally in response inside a
// sticky viewport. Hijacking the wheel to scroll sideways breaks momentum,
// find-in-page and the scrollbar. Don't.

/** Fraction of a viewport height of scrolling per frame. */
export const SCROLL_PER_FRAME = 0.62

/** Where we are through the roll, clamped to 0..1. */
export function rollProgress(
  scrollY: number,
  rollTop: number,
  rollHeight: number,
  viewportHeight: number,
): number {
  const range = rollHeight - viewportHeight
  if (range <= 0) return 0
  return Math.min(1, Math.max(0, (scrollY - rollTop) / range))
}

/**
 * translateX for the strip, so the scrubbed point sits at the viewport centre.
 * `centres` are each frame's centre offset within the track, in track coords.
 */
export function trackOffset(progress: number, centres: number[], viewportWidth: number): number {
  const n = centres.length
  if (n === 0) return 0
  if (n === 1) return viewportWidth / 2 - centres[0]
  const pos = progress * (n - 1)
  const i = Math.min(Math.floor(pos), n - 2)
  const frac = pos - i
  const target = centres[i] + (centres[i + 1] - centres[i]) * frac
  return viewportWidth / 2 - target
}

/** Which frame reads as current. Flips at the halfway point between frames. */
export function activeIndex(progress: number, count: number): number {
  if (count <= 0) return 0
  return Math.round(progress * (count - 1))
}

/** Height of the scroll container: one screen of travel per frame, plus the sticky screen. */
export function rollHeightPx(
  count: number,
  viewportHeight: number,
  perFrame: number = SCROLL_PER_FRAME,
): number {
  return Math.round(count * perFrame * viewportHeight + viewportHeight)
}
