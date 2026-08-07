// lib/gallery-layout.ts
// The art-direction layer. Grouping logic lives in lib/gallery-bands.ts —
// this file holds only the knobs and the authored exceptions.

import type { BandOverrides, Tuning } from './gallery-bands.ts'

/**
 * Layout tuning. Shares are percentages of the content column; a two-photo band
 * plus its gap should land between 75% and 85%, so the band never fills the
 * column and still reads as floating.
 */
export const TUNING: Tuning = {
  panoSolo: 92,
  soloBreath: 70,
  tallSolo: 42,
  soloEvery: 4,
  pairShares: [50, 30],
  pairSharesWideWide: [52, 28],
  dropRange: [8, 20],
  gap: 4,
}

/**
 * Authored groupings. Everything unnamed is derived from aspect ratio.
 * Key is the lead photo's id; `with` names the photo joining it. An override
 * may pull a non-adjacent photo into the band — that is the point of it.
 */
export const BAND_OVERRIDES: BandOverrides = {
  // The two Dotonbori street frames belong together.
  'RJ405690': { with: 'RJ405760', shares: [50, 30] },
}
