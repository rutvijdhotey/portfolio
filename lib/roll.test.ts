import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rollProgress, trackOffset, activeIndex, rollHeightPx, rollSizes } from './roll.ts'

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

// rollSizes must mirror .roll__frame in roll.css, which bounds width on BOTH
// axes. Declaring only the vw half made every one of the 22 frames fetch a rung
// or two too high: the trip pages shipped 4.68 MB where 2.32 MB would do.
test('rollSizes carries the height-derived bound, not just the vw bound', () => {
  // 16:9 landscape — 62vh * 1.7778 = 110.2vh, so 72vw wins on a wide viewport
  assert.equal(
    rollSizes(1920, 1080),
    '(max-width: 768px) min(88vw, 92.4vh), min(72vw, 110.2vh)',
  )
})

test('rollSizes holds a tall frame back to its height-derived width', () => {
  // RJ400008 is 0.805:1. 62vh * 0.805 = 49.9vh = 359px at 720px tall, and it is
  // that term — not 72vw (922px) — that decides the rung.
  assert.equal(
    rollSizes(921, 1144),
    '(max-width: 768px) min(88vw, 41.9vh), min(72vw, 49.9vh)',
  )
})

test('rollSizes survives a degenerate frame', () => {
  assert.equal(rollSizes(100, 0), '(max-width: 768px) 88vw, 72vw')
  assert.equal(rollSizes(0, 100), '(max-width: 768px) 88vw, 72vw')
})
