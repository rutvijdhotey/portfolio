import { test } from 'node:test'
import assert from 'node:assert/strict'
import manifest from './photo-manifest.json' with { type: 'json' }
import {
  TRIPS, tripBySlug, tripFrames, allFrames, selectedFrames, resolveSelected,
  frameAsItem, frameOrientation, SELECTED_IDS,
} from './trips.ts'
import type { Frame } from './trips.ts'

test('trips are ordered newest first', () => {
  assert.deepEqual(TRIPS.map(t => t.year), [...TRIPS.map(t => t.year)].sort((a, b) => b - a))
})

test('the three expected trips are present', () => {
  assert.deepEqual(TRIPS.map(t => t.slug), ['paris', 'copenhagen', 'japan'])
})

test('trip slugs are decoupled from storage categories', () => {
  assert.equal(tripBySlug('japan')?.storageCategory, 'city')
  assert.equal(tripBySlug('paris')?.storageCategory, 'paris')
})

test('tripBySlug returns undefined for an unknown slug', () => {
  assert.equal(tripBySlug('oregon'), undefined)
})

test('every trip resolves to the right number of frames', () => {
  assert.equal(tripFrames('japan').length, 8)
  assert.equal(tripFrames('copenhagen').length, 9)
  assert.equal(tripFrames('paris').length, 5)
})

test('an unknown slug resolves to no frames', () => {
  assert.deepEqual(tripFrames('oregon'), [])
})

test('frames carry the trip slug, title, and storage category', () => {
  for (const f of tripFrames('japan')) {
    assert.equal(f.tripSlug, 'japan')
    assert.equal(f.tripTitle, 'Japan')
    assert.equal(f.storageCategory, 'city')
  }
})

test('every trip has at least one frame', () => {
  for (const t of TRIPS) assert.ok(tripFrames(t.slug).length > 0, `${t.slug} is empty`)
})

test('every photo in the manifest belongs to exactly one trip', () => {
  const ids = allFrames().map(f => f.id)
  assert.equal(ids.length, Object.keys(manifest).length)
  assert.equal(new Set(ids).size, ids.length)
})

test('Copenhagen contributes the only tall frames', () => {
  const tall = allFrames().filter(f => f.orientation === 'tall')
  assert.deepEqual(tall.map(f => f.id).sort(), ['RJ400008', 'RJ400074', 'RJ400204'])
  for (const f of tall) assert.equal(f.tripSlug, 'copenhagen')
})

test('a mildly landscape frame is shown at full width, not constrained', () => {
  // RJ402666 is 1.25 — 'square' to classify(), but constraining it here would
  // render it at 763px in a layout built to escape exactly that.
  const f = allFrames().find(x => x.id === 'RJ402666')
  assert.ok(f)
  assert.equal(f.orientation, 'wide')
})

test('frameOrientation pins the 1.0 boundary with synthetic ratios', () => {
  assert.equal(frameOrientation(80, 100), 'tall')   // 0.80
  assert.equal(frameOrientation(99, 100), 'tall')   // 0.99
  assert.equal(frameOrientation(100, 100), 'tall')  // 1.00, inclusive edge
  assert.equal(frameOrientation(101, 100), 'wide')  // 1.01
  assert.equal(frameOrientation(125, 100), 'wide')  // 1.25
  assert.equal(frameOrientation(178, 100), 'wide')  // 1.78
})

test('Selected is exactly twelve frames', () => {
  assert.equal(SELECTED_IDS.length, 12)
  assert.equal(selectedFrames().length, 12)
})

test('Selected preserves its authored order', () => {
  assert.deepEqual(selectedFrames().map(f => f.id), SELECTED_IDS)
  assert.equal(selectedFrames()[0].id, 'RJ405710-copy')
})

test('no id appears twice in Selected', () => {
  assert.equal(new Set(SELECTED_IDS).size, SELECTED_IDS.length)
})

test('resolveSelected throws once, listing every stale id together', () => {
  const byId = new Map<string, Frame>(allFrames().map(f => [f.id, f]))
  assert.throws(
    () => resolveSelected(['nope-1', 'RJ405710-copy', 'nope-2'], byId),
    /nope-1, nope-2/,
  )
})

test('every frame has a distinct, non-empty alt', () => {
  const alts = allFrames().map(f => f.alt)
  for (const a of alts) assert.ok(a.length > 0)
  assert.equal(new Set(alts).size, alts.length)
})

test('every frame has a valid hex tint', () => {
  for (const f of allFrames()) assert.match(f.tint, /^#[0-9a-f]{6}$/)
})

test('frameAsItem round-trips a real frame', () => {
  const f = selectedFrames()[0]
  const item = frameAsItem(f)
  assert.deepEqual(item, {
    id: f.id,
    category: f.storageCategory,
    width: f.width,
    height: f.height,
    tint: f.tint,
    alt: f.alt,
  })
})
