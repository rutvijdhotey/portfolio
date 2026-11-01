// lib/experience.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { monthIndex, timelineSegments, toggleSelection } from './experience.ts'
import { EXPERIENCE } from './profile.ts'

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !~ ${b}`)

test('monthIndex counts whole months', () => {
  assert.equal(monthIndex('2018-04') - monthIndex('2017-02'), 14)
  assert.equal(monthIndex('2020-04') - monthIndex('2018-04'), 24)
})

test('segments are chronological and proportional to months', () => {
  const s = timelineSegments(EXPERIENCE, '2026-10')
  assert.deepEqual(s.map((x) => x.company), ['NetApp', 'eBay', 'YouTube'])
  near(s[0].left, 0)
  near(s[0].width, (14 / 116) * 100)
  near(s[1].left, (14 / 116) * 100)
  near(s[1].width, (24 / 116) * 100)
  near(s[2].left, (38 / 116) * 100)
  near(s[2].width, (78 / 116) * 100)
  assert.equal(s[2].current, true)
  assert.equal(s[0].current, false)
})

test('segments always fill exactly 100%', () => {
  const s = timelineSegments(EXPERIENCE, '2030-01')
  const last = s[s.length - 1]
  near(last.left + last.width, 100)
})

test('selecting toggles: same company or "Overview" clears it', () => {
  assert.equal(toggleSelection(null, 'eBay'), 'eBay')
  assert.equal(toggleSelection('eBay', 'NetApp'), 'NetApp')
  assert.equal(toggleSelection('eBay', 'eBay'), null)
  assert.equal(toggleSelection('eBay', null), null)
})
