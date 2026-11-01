// lib/stars.ts
// Seeded rain and snow for the hero sky. Seeded so every load draws the same
// field and tests are stable. No DOM access: Sky.tsx feeds in sizes and time.

export type Drop = { x: number; y: number; len: number; speed: number }
export type Flake = { x: number; y: number; r: number; speed: number; phase: number }

/** mulberry32: a small, well-distributed seeded generator. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Roughly one particle per 9000 css px, clamped so phones stay cheap and
 *  4K screens stay uncluttered. Rain and snow use the same density. */
export function starCountFor(width: number, height: number): number {
  return Math.min(220, Math.max(60, Math.round((width * height) / 9000)))
}

/** Rain: short streaks. `len` is in css px, `speed` in canvas heights per
 *  second, so a drop crosses the hero in roughly one to two seconds. */
export function makeDrops(count: number, seed = 11): Drop[] {
  const r = rng(seed)
  return Array.from({ length: count }, () => ({
    x: r(),
    y: r(),
    len: 6 + r() * 10,
    speed: 0.5 + r() * 0.5,
  }))
}

/** A drop's height at time `t` seconds, wrapped back to the top. */
export function dropY(drop: Drop, t: number): number {
  const y = (drop.y + t * drop.speed) % 1
  return y < 0 ? y + 1 : y
}

/** Snow: round flakes, slower than any raindrop. `r` is in css px, `speed`
 *  in canvas heights per second. x and y are fractions of the canvas. */
export function makeFlakes(count: number, seed = 13): Flake[] {
  const r = rng(seed)
  return Array.from({ length: count }, () => ({
    x: r(),
    y: r(),
    r: 1 + r() * 2,
    speed: 0.05 + r() * 0.08,
    phase: r() * Math.PI * 2,
  }))
}

/** A flake's height at time `t` seconds, wrapped, and its sideways sway in
 *  css px (at most 6 either way). */
export function flakeAt(flake: Flake, t: number): { y: number; sway: number } {
  const y = (flake.y + t * flake.speed) % 1
  return { y: y < 0 ? y + 1 : y, sway: Math.sin(flake.phase + t * 1.2) * 6 }
}
