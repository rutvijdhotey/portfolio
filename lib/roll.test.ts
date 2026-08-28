import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rollProgress, trackOffset, activeIndex, rollHeightPx } from './roll.ts'

test('progress is 0 before the roll and 1 after it', () => {
  // roll spans document y 1000..3000, viewport 500 => scrollable range 1500
  assert.equal(rollProgress(500, 1000, 2000, 500), 0)
  assert.equal(rollProgress(1000, 1000, 2000, 500), 0)
  assert.equal(rollProgress(2500, 1000, 2000, 500), 1)
  assert.equal(rollProgress(9999, 1000, 2000, 500), 1)
})

test('progress is linear across the range', () => {
  assert.equal(rollProgress(1750, 1000, 2000, 500), 0.5)
})

test('a roll shorter than the viewport never scrubs', () => {
  assert.equal(rollProgress(1200, 1000, 400, 500), 0)
})

test('trackOffset centres the first frame at progress 0', () => {
  // centres at 100, 300, 500; viewport 1000 => viewport centre is 500
  assert.equal(trackOffset(0, [100, 300, 500], 1000), 400)
})

test('trackOffset centres the last frame at progress 1', () => {
  assert.equal(trackOffset(1, [100, 300, 500], 1000), 0)
})

test('trackOffset interpolates between neighbouring centres', () => {
  // progress .25 over 3 frames => pos 0.5 => halfway between 100 and 300 = 200
  assert.equal(trackOffset(0.25, [100, 300, 500], 1000), 300)
})

test('trackOffset handles a single frame', () => {
  assert.equal(trackOffset(0.7, [250], 1000), 250)
})

test('trackOffset handles an empty strip', () => {
  assert.equal(trackOffset(0.5, [], 1000), 0)
})

test('activeIndex rounds to the nearest frame', () => {
  assert.equal(activeIndex(0, 9), 0)
  assert.equal(activeIndex(1, 9), 8)
  assert.equal(activeIndex(0.5, 9), 4)
  assert.equal(activeIndex(0.4, 9), 3)   // 0.4 * 8 = 3.2
})

test('activeIndex is safe on an empty strip', () => {
  assert.equal(activeIndex(0.5, 0), 0)
})

test('rollHeightPx allows one screen of travel per frame plus the sticky screen', () => {
  assert.equal(rollHeightPx(9, 1000, 0.62), 6580)
})
