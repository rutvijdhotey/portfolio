// lib/sections.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SECTIONS, activeIndex, maskOpacity } from './sections.ts'

test('five sections, unique ids, the hero first and contact last', () => {
  assert.equal(SECTIONS.length, 5)
  assert.equal(new Set(SECTIONS.map((s) => s.id)).size, 5)
  assert.equal(SECTIONS[0].id, 'top')
  assert.equal(SECTIONS[4].id, 'contact')
})

// Section tops in document px, a 1000px viewport, a 5000px document.
const TOPS = [0, 1200, 2000, 3200, 4200]

test('activeIndex picks the last section whose top has crossed 40% of the viewport', () => {
  assert.equal(activeIndex(TOPS, 0, 1000, 5000), 0)
  assert.equal(activeIndex(TOPS, 700, 1000, 5000), 0)
  assert.equal(activeIndex(TOPS, 800, 1000, 5000), 1)
  assert.equal(activeIndex(TOPS, 1700, 1000, 5000), 2)
})

test('activeIndex lights the last section at the bottom of the page, even if it is short', () => {
  assert.equal(activeIndex(TOPS, 4000, 1000, 5000), 4)
  assert.equal(activeIndex([0, 1200, 2000, 3200, 4900], 4000, 1000, 5000), 4)
})

test('activeIndex survives a missing section', () => {
  assert.equal(activeIndex([0, NaN, 2000], 1700, 1000, 9000), 2)
  assert.equal(activeIndex([], 100, 1000, 9000), 0)
})

test('maskOpacity is 0 over the hero and fades to 1 over 120px after it', () => {
  assert.equal(maskOpacity(0, 2600, 900), 0)
  assert.equal(maskOpacity(1660, 2600, 900), 0)
  assert.equal(maskOpacity(1720, 2600, 900), 0.5)
  assert.equal(maskOpacity(1780, 2600, 900), 1)
  assert.equal(maskOpacity(9000, 2600, 900), 1)
})
