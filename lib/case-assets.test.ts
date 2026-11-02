// lib/case-assets.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ASSET_ROOT, CASE_ASSETS, findImage, findVideo, imagePaths, posterPath, srcSet, videoPath } from './case-assets.ts'

test('derivative paths encode key, width and format under the asset root', () => {
  assert.equal(ASSET_ROOT, '/img/engineering')
  assert.deepEqual(imagePaths('notebound/capture', [400, 800], 'avif'), [
    '/img/engineering/notebound/capture-400.avif',
    '/img/engineering/notebound/capture-800.avif',
  ])
})

test('srcSet pairs each path with its width descriptor', () => {
  assert.equal(
    srcSet('lacuriosity/pipeline', [800, 1600], 'webp'),
    '/img/engineering/lacuriosity/pipeline-800.webp 800w, /img/engineering/lacuriosity/pipeline-1600.webp 1600w',
  )
})

test('video and poster paths', () => {
  assert.equal(videoPath('notebound/demo'), '/img/engineering/notebound/demo.mp4')
  assert.equal(posterPath('notebound/demo'), '/img/engineering/notebound/demo-poster.webp')
})

test('lookups return only entries of the right kind', () => {
  const m = {
    a: { kind: 'image' as const, w: 10, h: 20, widths: [400] },
    v: { kind: 'video' as const, w: 1280, h: 720 },
  }
  assert.deepEqual(findImage(m, 'a'), m.a)
  assert.equal(findImage(m, 'v'), null)
  assert.equal(findImage(m, 'missing'), null)
  assert.deepEqual(findVideo(m, 'v'), m.v)
  assert.equal(findVideo(m, 'a'), null)
})

test('every source has a unique key and a Supabase fallback URL', () => {
  const keys = CASE_ASSETS.map((a) => a.key)
  assert.equal(new Set(keys).size, keys.length)
  for (const a of CASE_ASSETS) assert.match(a.source, /^https:\/\/knlwzjvuqipjrjpgnovc\.supabase\.co\//)
})
