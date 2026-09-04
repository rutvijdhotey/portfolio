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

/**
 * Frame width in roll.css, as numbers. `.roll__frame` is bounded on BOTH axes —
 *   width: min(72vw, calc(62vh * var(--arn)))   (88vw / 52vh under 768px)
 * — and for all but the widest frames it is the height-derived term that wins.
 *
 * These are layout constants and are unrelated to SCROLL_PER_FRAME, which
 * happens to also be 0.62. Do not collapse them.
 */
const FRAME_VW = 72
const FRAME_VH = 62
const FRAME_VW_SM = 88
const FRAME_VH_SM = 52

/**
 * The `sizes` value for one frame, mirroring both bounds above.
 *
 * Declaring only the vw half is a silent bug: `sizes` is what picks the srcset
 * rung, so a 0.8:1 frame occupying 359 CSS px would claim 922 and pull the
 * 2560 rung instead of the 768. Tests, types and the build all pass while the
 * page ships several times the bytes it needs.
 */
export function rollSizes(width: number, height: number): string {
  if (!(width > 0) || !(height > 0)) {
    return `(max-width: 768px) ${FRAME_VW_SM}vw, ${FRAME_VW}vw`
  }
  const arn = width / height
  const vh = (base: number) => (base * arn).toFixed(1)
  return (
    `(max-width: 768px) min(${FRAME_VW_SM}vw, ${vh(FRAME_VH_SM)}vh), ` +
    `min(${FRAME_VW}vw, ${vh(FRAME_VH)}vh)`
  )
}
