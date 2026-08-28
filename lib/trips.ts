// lib/trips.ts
// The trip model. A trip is the unit of work on this site.
//
// `slug` is what appears in a URL. `storageCategory` is what appears in a
// Supabase path. They are deliberately different: renaming the storage
// prefix would mean re-uploading every derivative for no gain.

import manifest from './photo-manifest.json' with { type: 'json' }

export interface Trip {
  /** URL segment: /photography/<slug> */
  slug: string
  title: string
  /** Shown under the title. Place, not category. */
  place: string
  year: number
  /** Prefix under optimized/ on Supabase. Never change this. */
  storageCategory: string
  blurb: string
}

export interface Frame {
  id: string
  tripSlug: string
  /** Trip title, for captions. */
  tripTitle: string
  /** Supabase prefix under optimized/. Needed to build derivative URLs. */
  storageCategory: string
  width: number
  height: number
  tint: string
  alt: string
  /** 'tall' below 0.95, otherwise 'wide'. Drives layout, nothing else. */
  orientation: 'tall' | 'wide'
}

/** Newest first — the index reads as a body of work in reverse chronology. */
export const TRIPS: Trip[] = [
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

function toFrame(id: string, m: ManifestEntry, trip: Trip): Frame {
  return {
    id,
    tripSlug: trip.slug,
    tripTitle: trip.title,
    storageCategory: trip.storageCategory,
    width: m.width,
    height: m.height,
    tint: m.tint,
    alt: `${trip.title} — ${trip.place}`,
    orientation: m.width / m.height < 0.95 ? 'tall' : 'wide',
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
export const SELECTED_IDS: string[] = [
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

/** Selected frames in authored order. Throws if an id has gone stale. */
export function selectedFrames(): Frame[] {
  const byId = new Map(allFrames().map(f => [f.id, f]))
  return SELECTED_IDS.map(id => {
    const frame = byId.get(id)
    if (!frame) throw new Error(`SELECTED_IDS references a frame not in the manifest: ${id}`)
    return frame
  })
}
