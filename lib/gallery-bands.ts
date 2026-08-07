// lib/gallery-bands.ts
// Partitions a chapter's photos into floating bands. Pure — no React, no DOM,
// no runtime import of the manifest (a value import of gallery-items would pull
// in photo-manifest.json, which plain Node cannot load).

import type { GalleryItem } from './gallery-items.ts'

export type Shape = 'pano' | 'wide' | 'square' | 'tall'

/** Aspect-ratio thresholds, lower edge inclusive. */
export function classify(item: GalleryItem): Shape {
  const ratio = item.width / item.height
  if (ratio >= 2.2) return 'pano'
  if (ratio >= 1.3) return 'wide'
  if (ratio >= 0.85) return 'square'
  return 'tall'
}

export interface BandPhoto {
  item: GalleryItem
  /** Position in the chapter's item array. The overlay's flat index depends on it. */
  index: number
  /** Width as a percentage of the content column. */
  share: number
  /** Downward offset as a percentage of this photo's own rendered height. */
  drop: number
}

export interface Band {
  photos: BandPhoto[]
  /** Which side of the column the band sits toward. */
  align: 'left' | 'right'
}

/** An authored grouping. Named on the lead photo's id. */
export interface BandOverride {
  /** Photo id, or ids, to place in the lead photo's band. */
  with: string | string[]
  /** Explicit shares, lead first. Falls back to the tuned pair shares. */
  shares?: number[]
  /** Explicit drops, lead first. Falls back to the derived drop. */
  drops?: number[]
}

export type BandOverrides = Record<string, BandOverride>

export interface Tuning {
  /** Share for a solo panorama. */
  panoSolo: number
  /** Share for a periodic solo, used as a breath between paired bands. */
  soloBreath: number
  /** Share for a portrait that could not pair. Kept small — a tall frame at 70% runs past the viewport. */
  tallSolo: number
  /** Insert a solo breath once this many paired bands have gone by. */
  soloEvery: number
  /** Default two-photo split, lead first. */
  pairShares: [number, number]
  /** Split for wide + wide, which needs a stronger size difference to avoid reading as a grid. */
  pairSharesWideWide: [number, number]
  /** Drop range, as a percentage of the dropped photo's own height. */
  dropRange: [number, number]
  /** Gap between photos in a band, as a percentage of the column. */
  gap: number
}

/** Tuning used by the test suite. Kept here so tests never depend on art direction. */
export const TEST_TUNING: Tuning = {
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
 * FNV-1a over the photo id. Any stable hash would do — what matters is that the
 * build and the browser agree, since a mismatch breaks hydration.
 */
function hash(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/** Rendered height, in units of the content column's width. */
function renderedHeight(photo: BandPhoto): number {
  return photo.share / (photo.item.width / photo.item.height)
}

/**
 * Drops the shorter photo in each multi-photo band, so top edges never align.
 * Clamped so the dropped photo's bottom never passes the tallest photo's bottom —
 * the band's height stays set by its tallest frame.
 */
export function applyDrops(band: Band, tuning: Tuning): Band {
  if (band.photos.length < 2) return band

  const heights = band.photos.map(renderedHeight)
  const tallest = Math.max(...heights)
  const shortest = Math.min(...heights)
  const target = heights.indexOf(shortest)

  const [min, max] = tuning.dropRange
  const chosen = min + (hash(band.photos[target].item.id) % (max - min + 1))

  // Room available, expressed as a percentage of the dropped photo's own height.
  const room = shortest === 0 ? 0 : ((tallest - shortest) / shortest) * 100
  const drop = Math.min(chosen, room)

  const photos = band.photos.map((p, i) => (i === target ? { ...p, drop } : p))
  return { ...band, photos }
}

/** The drop as a CSS percentage of the column, which is what `margin-top: %` resolves against. */
export function dropOffset(photo: BandPhoto): string {
  if (photo.drop === 0) return '0%'
  return `${((photo.drop / 100) * renderedHeight(photo)).toFixed(2)}%`
}

/** Content column at its widest: the 1440px max-width less 72px of padding each side. */
const COLUMN_MAX = 1296
/** Viewport at which the column stops growing: 1440 plus both paddings. */
const COLUMN_LOCK = 1584
/** Below the lock the column is roughly 90% of the viewport, padding included. */
const COLUMN_VW_RATIO = 0.9

/**
 * A `sizes` value for a photo occupying `share` percent of the content column.
 * Below 768px every band collapses to one photo per row at 92vw.
 */
export function photoSizes(share: number): string {
  const pinned = Math.round((share / 100) * COLUMN_MAX)
  const scaled = Math.round(share * COLUMN_VW_RATIO)
  return `(max-width: 768px) 92vw, (min-width: ${COLUMN_LOCK}px) ${pinned}px, ${scaled}vw`
}

/** A pair is legal unless it puts two portraits side by side, or involves a panorama. */
function canPair(a: GalleryItem, b: GalleryItem): boolean {
  const sa = classify(a)
  const sb = classify(b)
  if (sa === 'pano' || sb === 'pano') return false
  if (sa === 'tall' && sb === 'tall') return false
  return true
}

/** Share for a photo that ends up alone in its band. */
function soloShare(item: GalleryItem, tuning: Tuning): number {
  const shape = classify(item)
  if (shape === 'pano') return tuning.panoSolo
  if (shape === 'tall') return tuning.tallSolo
  return tuning.soloBreath
}

export function buildBands(
  items: GalleryItem[],
  overrides: BandOverrides,
  tuning: Tuning,
): Band[] {
  const indexOf = new Map(items.map((it, i) => [it.id, i]))
  const consumed = new Set<number>()
  const bands: Band[] = []
  let sinceSolo = 0

  /** Pushes a band, assigns its alternating side, and derives its drops. */
  const push = (photos: BandPhoto[], explicitDrops?: number[]) => {
    const band: Band = { photos, align: bands.length % 2 === 0 ? 'left' : 'right' }
    if (explicitDrops) {
      bands.push({
        ...band,
        photos: photos.map((p, i) => ({ ...p, drop: explicitDrops[i] ?? 0 })),
      })
      return
    }
    bands.push(applyDrops(band, tuning))
  }

  const asPhoto = (i: number, share: number): BandPhoto => ({
    item: items[i], index: i, share, drop: 0,
  })

  for (let i = 0; i < items.length; i++) {
    if (consumed.has(i)) continue
    const lead = items[i]
    consumed.add(i)

    // 1. An authored grouping wins outright, and may pull a non-adjacent photo.
    const override = overrides[lead.id]
    if (override) {
      const partnerIds = Array.isArray(override.with) ? override.with : [override.with]
      const partners = partnerIds
        .map(id => indexOf.get(id))
        .filter((j): j is number => j !== undefined && !consumed.has(j))
      if (partners.length > 0) {
        const shares = override.shares
          ?? [tuning.pairShares[0], ...partners.map(() => tuning.pairShares[1])]
        const photos = [asPhoto(i, shares[0] ?? tuning.pairShares[0])]
        partners.forEach((j, n) => {
          consumed.add(j)
          photos.push(asPhoto(j, shares[n + 1] ?? tuning.pairShares[1]))
        })
        push(photos, override.drops)
        sinceSolo = 0
        continue
      }
      // Every named partner was missing or already placed — fall through to derived.
    }

    // 2. Panoramas stand alone.
    if (classify(lead) === 'pano') {
      push([asPhoto(i, soloShare(lead, tuning))])
      sinceSolo = 0
      continue
    }

    // 3. A periodic solo, so the page is not relentless pairs.
    if (sinceSolo >= tuning.soloEvery) {
      push([asPhoto(i, soloShare(lead, tuning))])
      sinceSolo = 0
      continue
    }

    // 4. Otherwise pair with the next unconsumed photo, if that pairing is legal.
    let partner = -1
    for (let j = i + 1; j < items.length; j++) {
      if (consumed.has(j)) continue
      if (canPair(lead, items[j])) partner = j
      break   // only the immediate next photo, so order is never rearranged
    }

    if (partner === -1) {
      push([asPhoto(i, soloShare(lead, tuning))])
      sinceSolo = 0
      continue
    }

    consumed.add(partner)
    const wideWide = classify(lead) === 'wide' && classify(items[partner]) === 'wide'
    const [a, b] = wideWide ? tuning.pairSharesWideWide : tuning.pairShares
    push([asPhoto(i, a), asPhoto(partner, b)])
    sinceSolo++
  }

  return bands
}
