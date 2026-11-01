// The hero's two clocks, after poulo.site: the sky moves through the seasons
// on a timer, and the role headline swaps more slowly with a "vapor"
// transition. Pure functions, no DOM: HeroScene and HeroRoles own the timers.

import { rng } from './stars.ts'

/** None, rain, snow, sun, then back to none. */
export const SEASONS = ['none', 'rain', 'snow', 'sun'] as const
export type Season = (typeof SEASONS)[number]

export const SEASON_MS = 3500
export const ROLE_MS = 5000

/** The season after `s`; sun wraps back to none. */
export function nextSeason(s: Season): Season {
  return SEASONS[(SEASONS.indexOf(s) + 1) % SEASONS.length]
}

/** One letter of the headline and how it moves. Distances are in em: `vx`
 *  is the sideways start of the condense-in, `dx`/`dy` where it drifts as it
 *  evaporates. Delays are in ms. */
export type VaporChar = { ch: string; vx: number; dx: number; dy: number; inDelay: number; outDelay: number }

/** The headline split into words of letters, each with its own drift and
 *  stagger. Seeded from the text, so the server and the browser draw the
 *  same markup. */
export function vaporWords(text: string): VaporChar[][] {
  let seed = 0
  for (const ch of text) seed = (Math.imul(seed, 31) + ch.charCodeAt(0)) >>> 0
  const r = rng(seed)
  let n = 0
  return text.split(/\s+/).filter(Boolean).map((word) =>
    [...word].map((ch) => {
      const i = n++
      return {
        ch,
        vx: round2((r() - 0.5) * 0.5),
        dx: round2(0.15 + r() * 0.45),
        dy: round2(-0.5 - r() * 0.4),
        inDelay: i * 35 + Math.floor(r() * 90),
        outDelay: i * 25 + Math.floor(r() * 80),
      }
    }),
  )
}

const round2 = (n: number) => Math.round(n * 100) / 100
