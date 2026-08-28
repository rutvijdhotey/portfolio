import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TRIPS, tripBySlug, tripFrames, allFrames, selectedFrames, SELECTED_IDS } from './trips.ts'

test('there are three trips, newest first', () => {
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

test('frames carry the trip slug, not the storage category', () => {
  for (const f of tripFrames('japan')) assert.equal(f.tripSlug, 'japan')
})

test('frames carry the storage category so derivative URLs resolve', () => {
  for (const f of tripFrames('japan')) assert.equal(f.storageCategory, 'city')
})

test('frames carry the trip title for captions', () => {
  for (const f of tripFrames('copenhagen')) assert.equal(f.tripTitle, 'Copenhagen')
})

test('every trip has at least one frame', () => {
  for (const t of TRIPS) assert.ok(tripFrames(t.slug).length > 0, `${t.slug} is empty`)
})

test('allFrames covers the whole corpus exactly once', () => {
  const ids = allFrames().map(f => f.id)
  assert.equal(ids.length, 22)
  assert.equal(new Set(ids).size, 22)
})

test('Copenhagen contributes the only tall frames', () => {
  const tall = allFrames().filter(f => f.orientation === 'tall')
  assert.equal(tall.length, 3)
  for (const f of tall) assert.equal(f.tripSlug, 'copenhagen')
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
