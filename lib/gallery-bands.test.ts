import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classify } from './gallery-bands.ts'
import type { GalleryItem } from './gallery-items.ts'

/** Minimal item — only width and height matter to the layout engine. */
const item = (id: string, width: number, height: number): GalleryItem =>
  ({ id, category: 'city', width, height, tint: '#000', alt: 'test' })

test('classify buckets by aspect ratio', () => {
  assert.equal(classify(item('pano', 3000, 1000)), 'pano')   // 3.00
  assert.equal(classify(item('wide', 3000, 2000)), 'wide')   // 1.50
  assert.equal(classify(item('sq', 1000, 1000)), 'square')   // 1.00
  assert.equal(classify(item('tall', 2000, 3000)), 'tall')   // 0.67
})

test('classify boundaries are inclusive at the lower edge', () => {
  assert.equal(classify(item('a', 2200, 1000)), 'pano')      // exactly 2.2
  assert.equal(classify(item('b', 2199, 1000)), 'wide')
  assert.equal(classify(item('c', 1300, 1000)), 'wide')      // exactly 1.3
  assert.equal(classify(item('d', 1299, 1000)), 'square')
  assert.equal(classify(item('e', 850, 1000)), 'square')     // exactly 0.85
  assert.equal(classify(item('f', 849, 1000)), 'tall')
})
