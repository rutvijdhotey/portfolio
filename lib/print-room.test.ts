import { test } from 'node:test'
import assert from 'node:assert/strict'
import { printSizes, PRINT_MAX, TALL_MAX } from './print-room.ts'

test('a wide frame fills the column', () => {
  assert.equal(printSizes('wide'), '(max-width: 768px) 92vw, min(1440px, 92vw)')
})

test('a tall frame is held back so it fits the viewport height', () => {
  assert.equal(printSizes('tall'), '(max-width: 768px) 92vw, min(720px, 53vw)')
})

test('the documented maxima match the sizes strings', () => {
  assert.equal(PRINT_MAX, 1440)
  assert.equal(TALL_MAX, 720)
})
