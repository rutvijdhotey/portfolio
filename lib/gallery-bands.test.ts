import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classify, buildBands, dropOffset, photoSizes, TEST_TUNING } from './gallery-bands.ts'
import type { Band } from './gallery-bands.ts'
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

/** Flattens bands back to ids, in render order. */
const idsOf = (bands: Band[]) => bands.flatMap(b => b.photos.map(p => p.item.id))

const wide   = (id: string) => item(id, 3000, 2000)
const tall   = (id: string) => item(id, 2000, 3000)
const square = (id: string) => item(id, 2000, 2000)
const pano   = (id: string) => item(id, 3000, 1000)

test('every photo appears exactly once, in input order', () => {
  const items = [wide('a'), tall('b'), square('c'), tall('d'), wide('e')]
  const bands = buildBands(items, {}, TEST_TUNING)
  assert.deepEqual(idsOf(bands), ['a', 'b', 'c', 'd', 'e'])
})

test('index is the position in the input array, not the band', () => {
  const items = [wide('a'), tall('b'), square('c')]
  const bands = buildBands(items, {}, TEST_TUNING)
  const flat = bands.flatMap(b => b.photos)
  assert.deepEqual(flat.map(p => p.index), [0, 1, 2])
})

test('panoramas are always solo', () => {
  const items = [pano('a'), wide('b'), tall('c')]
  const bands = buildBands(items, {}, TEST_TUNING)
  assert.equal(bands[0].photos.length, 1)
  assert.equal(bands[0].photos[0].item.id, 'a')
})

test('two tall photos never share a band', () => {
  const items = [tall('a'), tall('b'), tall('c'), tall('d')]
  const bands = buildBands(items, {}, TEST_TUNING)
  for (const band of bands) {
    const talls = band.photos.filter(p => classify(p.item) === 'tall')
    assert.ok(talls.length <= 1, 'a band paired two portraits')
  }
})

test('wide pairs with tall', () => {
  const items = [wide('a'), tall('b')]
  const bands = buildBands(items, {}, TEST_TUNING)
  assert.equal(bands.length, 1)
  assert.deepEqual(bands[0].photos.map(p => p.item.id), ['a', 'b'])
})

test('a solo breath appears after soloEvery paired bands', () => {
  const items = Array.from({ length: 12 }, (_, i) =>
    i % 2 === 0 ? wide(`w${i}`) : tall(`t${i}`))
  const bands = buildBands(items, {}, { ...TEST_TUNING, soloEvery: 2 })
  const solos = bands.filter(b => b.photos.length === 1)
  assert.ok(solos.length >= 2, `expected periodic solos, got ${solos.length}`)
})

test('an odd photo count still places every photo', () => {
  const items = [wide('a'), tall('b'), wide('c')]
  const bands = buildBands(items, {}, TEST_TUNING)
  assert.deepEqual(idsOf(bands).sort(), ['a', 'b', 'c'])
})

test('bands alternate which side of the column they sit toward', () => {
  const items = [wide('a'), tall('b'), wide('c'), tall('d')]
  const bands = buildBands(items, {}, TEST_TUNING)
  assert.notEqual(bands[0].align, bands[1].align)
})

test('an override groups its photos and consumes them both', () => {
  const items = [wide('a'), wide('b'), tall('c')]
  const bands = buildBands(items, { a: { with: 'c' } }, TEST_TUNING)
  assert.deepEqual(bands[0].photos.map(p => p.item.id), ['a', 'c'])
  assert.deepEqual(idsOf(bands).sort(), ['a', 'b', 'c'])
})

test('an override wins over the derived pairing even when it pulls a distant photo', () => {
  const items = [wide('a'), tall('b'), wide('c'), tall('d')]
  const bands = buildBands(items, { a: { with: 'd' } }, TEST_TUNING)
  assert.deepEqual(bands[0].photos.map(p => p.item.id), ['a', 'd'])
  assert.equal(idsOf(bands).filter(id => id === 'd').length, 1)
})

test('an override naming a missing id is ignored rather than throwing', () => {
  const items = [wide('a'), tall('b')]
  const bands = buildBands(items, { a: { with: 'nope' } }, TEST_TUNING)
  assert.deepEqual(idsOf(bands).sort(), ['a', 'b'])
})

test('a pair never splits the band evenly', () => {
  const items = [wide('a'), tall('b'), wide('c'), wide('d')]
  const bands = buildBands(items, {}, TEST_TUNING)
  for (const band of bands.filter(b => b.photos.length > 1)) {
    const [first, second] = band.photos
    assert.notEqual(first.share, second.share)
    assert.ok(Math.abs(first.share - second.share) >= 10,
      `shares ${first.share}/${second.share} are too close to read as unequal`)
  }
})

test('a band leaves margin in the column rather than filling it', () => {
  const items = [wide('a'), tall('b'), pano('c'), wide('d'), wide('e')]
  const bands = buildBands(items, {}, TEST_TUNING)
  for (const band of bands) {
    const gaps = (band.photos.length - 1) * TEST_TUNING.gap
    const total = band.photos.reduce((sum, p) => sum + p.share, 0) + gaps
    assert.ok(total <= 96, `band occupies ${total}% of the column`)
  }
})

test('drops are deterministic for the same photo id', () => {
  const items = [wide('a'), tall('b')]
  const first  = buildBands(items, {}, TEST_TUNING)
  const second = buildBands(items, {}, TEST_TUNING)
  assert.deepEqual(
    first.flatMap(band => band.photos.map(p => p.drop)),
    second.flatMap(band => band.photos.map(p => p.drop)),
  )
})

test('exactly one photo in a pair is dropped', () => {
  const bands = buildBands([wide('a'), tall('b')], {}, TEST_TUNING)
  const dropped = bands[0].photos.filter(p => p.drop > 0)
  assert.equal(dropped.length, 1)
})

test('the shorter photo is the one that drops', () => {
  // wide at 50% share renders 0.333 column-widths tall; tall at 30% renders 0.45.
  const bands = buildBands([wide('a'), tall('b')], {}, TEST_TUNING)
  const dropped = bands[0].photos.find(p => p.drop > 0)
  assert.equal(dropped?.item.id, 'a')
})

test('a solo photo never drops', () => {
  const bands = buildBands([pano('a')], {}, TEST_TUNING)
  assert.equal(bands[0].photos[0].drop, 0)
})

test('a drop never pushes a photo past the bottom of the tallest in its band', () => {
  const bands = buildBands([wide('a'), tall('b')], {}, TEST_TUNING)
  const bottoms = bands[0].photos.map(p => {
    const height = p.share / (p.item.width / p.item.height)
    return height + (p.drop / 100) * height
  })
  const tallest = Math.max(
    ...bands[0].photos.map(p => p.share / (p.item.width / p.item.height)))
  for (const bottom of bottoms) {
    assert.ok(bottom <= tallest + 0.001, `band overflows: ${bottom} > ${tallest}`)
  }
})

test('an override can set drops explicitly', () => {
  const bands = buildBands(
    [wide('a'), tall('b')],
    { a: { with: 'b', shares: [50, 30], drops: [0, 12] } },
    TEST_TUNING,
  )
  assert.deepEqual(bands[0].photos.map(p => p.drop), [0, 12])
})

test('dropOffset converts a drop into a percentage of the column', () => {
  // 30% share, aspect 2/3 → rendered height 45% of the column.
  // A 20% drop of that height is 9% of the column.
  const photo = { item: tall('x'), index: 0, share: 30, drop: 20 }
  assert.equal(dropOffset(photo), '9.00%')
})

test('dropOffset is zero for an undropped photo', () => {
  const photo = { item: wide('x'), index: 0, share: 50, drop: 0 }
  assert.equal(dropOffset(photo), '0%')
})

test('photoSizes pins a pixel width above the column max and scales below it', () => {
  // Column is 1296px at and above a 1584px viewport (1440 max-width less 2x72 padding).
  // 30% of 1296 is 389px.
  assert.equal(
    photoSizes(30),
    '(max-width: 768px) 92vw, (min-width: 1584px) 389px, 27vw',
  )
})

test('photoSizes handles a full-width panorama', () => {
  assert.equal(
    photoSizes(92),
    '(max-width: 768px) 92vw, (min-width: 1584px) 1192px, 83vw',
  )
})
