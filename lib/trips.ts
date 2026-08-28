// lib/trips.ts
// The trip model. A trip is the unit of work on this site.
//
// `slug` is what appears in a URL. `storageCategory` is what appears in a
// Supabase path. They are deliberately different: renaming the storage
// prefix would mean re-uploading every derivative for no gain.

import manifest from './photo-manifest.json' with { type: 'json' }
import type { GalleryCategory, GalleryItem } from './gallery-items.ts'
import { classify } from './gallery-bands.ts'

export interface Trip {
  /** URL segment: /photography/<slug> */
  slug: string
  title: string
  /** Shown under the title. Place, not category. */
  place: string
  year: number
  /** Prefix under optimized/ on Supabase. Never change this. */
  storageCategory: GalleryCategory
  blurb: string
}

export interface Frame {
  id: string
  tripSlug: string
  /** Trip title, for captions. */
  tripTitle: string
  /** Supabase prefix under optimized/. Needed to build derivative URLs. */
  storageCategory: GalleryCategory
  width: number
  height: number
  tint: string
  alt: string
  /** 'tall' below the square threshold, otherwise 'wide'. Drives layout, nothing else. */
  orientation: 'tall' | 'wide'
}

/** Bridge to the existing <Photo> component and URL helpers, which predate Frame. */
export function frameAsItem(f: Frame): GalleryItem {
  return {
    id: f.id,
    category: f.storageCategory,
    width: f.width,
    height: f.height,
    tint: f.tint,
    alt: f.alt,
  }
}

/** Newest first — the index reads as a body of work in reverse chronology. */
export const TRIPS: readonly Trip[] = [
  {
    slug: 'paris',
    title: 'Paris',
    place: 'France',
    year: 2026,
    storageCategory: 'paris',
    blurb: 'Facades, and the people who walk past them without looking up.',
  },
  {
    slug: 'copenhagen',
    title: 'Copenhagen',
    place: 'Denmark',
    year: 2025,
    storageCategory: 'copenhagen',
    blurb: 'Bicycles, stairwells, and the particular grey the harbour turns just before it rains.',
  },
  {
    slug: 'japan',
    title: 'Japan',
    place: 'Tokyo & Osaka',
    year: 2023,
    storageCategory: 'city',
    blurb: 'Neon after rain. Most of these were taken standing still for a long time.',
  },
]

export function tripBySlug(slug: string): Trip | undefined {
  return TRIPS.find(t => t.slug === slug)
}

type ManifestEntry = { category: string; width: number; height: number; tint: string }
const entries = Object.entries(manifest) as [string, ManifestEntry][]

/**
 * Per-frame alt text. A shared per-trip string makes a screen reader announce
 * the same sentence eight times, so each frame describes what is actually in it.
 * Falls back to the trip for anything unlisted.
 */
const ALT: Record<string, string> = {
  // Japan
  'RJ405650': 'Commuters crossing a glass walkway at Shinjuku station, Tokyo',
  'RJ405690': 'Crowds beneath the neon signs of Dotonbori, Osaka',
  'RJ405702': 'Red paper lanterns strung outside an izakaya',
  'RJ405710-copy': 'A man with an umbrella on wet steps, in black and white',
  'RJ405757': 'A narrow alley of lit signage after rain',
  'RJ405760': 'A lone figure standing still in a neon-lit street at night',
  'RJ405776': 'A red taxi waiting at a crossing after dark',
  'RJ405808': 'The length of a covered shopping arcade, lit and almost empty',
  // Copenhagen
  'RJ400008': 'A figure on a warm-lit stairwell',
  'RJ400034': 'A stairwell interior in warm lamplight',
  'RJ400074': 'A figure on the steps of a yellow building',
  'RJ400173': 'Parked bicycles and a passing figure, in black and white',
  'RJ400190': 'Cyclists crossing an open square, in black and white',
  'RJ400204': 'A cyclist passing an arched doorway, in black and white',
  'RJ400207': 'A bicycle leaning against a building wall, in black and white',
  'RJ409387': 'A queue at a ticket booth, in black and white',
  'RJ409814': 'Figures walking a path through a park, in black and white',
  // Paris
  'RJ402344': 'A figure at dusk with the river behind',
  'RJ402371': 'A street lamp against an orange evening sky',
  'RJ402536': 'People sitting on the steps below a Haussmann facade',
  'RJ402605': 'A figure walking past an ornate cream facade',
  'RJ402666': 'A man in a suit crossing the street, a green coat in the foreground',
}

function altFor(id: string, trip: Trip): string {
  return ALT[id] ?? `${trip.title} — ${trip.place}`
}

/**
 * One aspect-ratio vocabulary: classify() is the existing authority on
 * aspect-ratio buckets (lib/gallery-bands.ts). Frame only needs the coarse
 * tall/wide split, so a square photo collapses into 'tall' — at full column
 * width a square runs past the viewport, so it is constrained like a portrait.
 */
export function frameOrientation(width: number, height: number): 'tall' | 'wide' {
  const shape = classify({ id: '', category: 'city', width, height, tint: '', alt: '' })
  return shape === 'tall' || shape === 'square' ? 'tall' : 'wide'
}

function toFrame(id: string, m: ManifestEntry, trip: Trip): Frame {
  return {
    id,
    tripSlug: trip.slug,
    tripTitle: trip.title,
    storageCategory: trip.storageCategory,
    width: m.width,
    height: m.height,
    tint: m.tint,
    alt: altFor(id, trip),
    orientation: frameOrientation(m.width, m.height),
  }
}

/** Frames for one trip, in manifest order. Empty array for an unknown slug. */
export function tripFrames(slug: string): Frame[] {
  const trip = tripBySlug(slug)
  if (!trip) return []
  return entries
    .filter(([, m]) => m.category === trip.storageCategory)
    .map(([id, m]) => toFrame(id, m, trip))
}

/** Every frame on the site, trip order then manifest order. */
export function allFrames(): Frame[] {
  return TRIPS.flatMap(t => tripFrames(t.slug))
}

/**
 * The Selected cut — the front door. Fixed length by design: nothing enters
 * without displacing something. Sequenced by feel, not by trip or date.
 */
export const SELECTED_IDS: readonly string[] = [
  'RJ405710-copy',  // Japan      — B&W, umbrella on the steps
  'RJ400008',       // Copenhagen — warm stairwell
  'RJ402605',       // Paris      — figure passing an ornate facade
  'RJ405690',       // Japan      — Dotonbori crowd
  'RJ400173',       // Copenhagen — B&W bicycles
  'RJ405702',       // Japan      — izakaya lanterns
  'RJ402666',       // Paris      — green coat, man in a suit
  'RJ400204',       // Copenhagen — B&W, doorway
  'RJ405757',       // Japan      — neon alley
  'RJ409814',       // Copenhagen — B&W, figures in the park
  'RJ402371',       // Paris      — lamp against an orange sky
  'RJ405650',       // Japan      — Shinjuku walkway
]

/** Resolves ids against a lookup map, throwing once with every stale id. */
export function resolveSelected(ids: readonly string[], byId: Map<string, Frame>): Frame[] {
  const missing = ids.filter(id => !byId.has(id))
  if (missing.length > 0) {
    throw new Error(`SELECTED_IDS references frames not in the manifest: ${missing.join(', ')}`)
  }
  return ids.map(id => byId.get(id)!)
}

/** Selected frames in authored order. Throws if any id has gone stale. */
export function selectedFrames(): Frame[] {
  const byId = new Map(allFrames().map(f => [f.id, f]))
  return resolveSelected(SELECTED_IDS, byId)
}
