// lib/gaze.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GAZE_REACH, GAZE_X, GAZE_Y, gazeOffset } from './gaze.ts'

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !~ ${b}`)

test('a cursor on the eyes leaves the pupils centred', () => {
  assert.deepEqual(gazeOffset(0, 0), { x: 0, y: 0 })
})

test('a far cursor moves the pupils the full reach along each axis', () => {
  near(gazeOffset(1000, 0).x, GAZE_X)
  near(gazeOffset(-1000, 0).x, -GAZE_X)
  near(gazeOffset(0, 1000).y, GAZE_Y)
  near(gazeOffset(0, -1000).y, -GAZE_Y)
})

test('the pupils ease in over the reach instead of snapping', () => {
  near(gazeOffset(GAZE_REACH / 2, 0).x, GAZE_X / 2)
  near(gazeOffset(GAZE_REACH, 0).x, GAZE_X)
})

test('a diagonal cursor stays inside the ellipse of travel', () => {
  const { x, y } = gazeOffset(5000, 5000)
  assert.ok((x / GAZE_X) ** 2 + (y / GAZE_Y) ** 2 <= 1 + 1e-9)
})

test('bad measurements never move the pupils', () => {
  assert.deepEqual(gazeOffset(NaN, 4), { x: 0, y: 0 })
  assert.deepEqual(gazeOffset(Infinity, 0), { x: 0, y: 0 })
})
