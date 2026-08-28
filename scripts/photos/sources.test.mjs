import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SOURCE_PHOTOS } from './sources.mjs'
import { photoId } from './urls.mjs'

const ids = SOURCE_PHOTOS.map(p => photoId(p.filename))
const categories = [...new Set(SOURCE_PHOTOS.map(p => p.category))]

test('the corpus is the 22 curated frames', () => {
  assert.equal(SOURCE_PHOTOS.length, 22)
})

test('only the three surviving trips remain', () => {
  assert.deepEqual(categories.sort(), ['city', 'copenhagen', 'paris'])
})

test('per-trip counts are 8 Japan, 9 Copenhagen, 5 Paris', () => {
  const count = c => SOURCE_PHOTOS.filter(p => p.category === c).length
  assert.equal(count('city'), 8)
  assert.equal(count('copenhagen'), 9)
  assert.equal(count('paris'), 5)
})

test('the five individually cut frames are gone', () => {
  for (const cut of ['RJ405649', 'RJ402306', 'RJ402597', 'RJ402656', 'RJ400161']) {
    assert.ok(!ids.includes(cut), `${cut} should have been cut`)
  }
})

test('no frame appears twice', () => {
  assert.equal(new Set(ids).size, ids.length)
})
