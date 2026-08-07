import { test } from 'node:test'
import assert from 'node:assert/strict'
import { photoId, masterUrl, derivativeKey, derivativeUrl } from './urls.mjs'

test('photoId strips extension and spaces', () => {
  assert.equal(photoId('RJ405649.jpg'), 'RJ405649')
  assert.equal(photoId('RJ405710 copy.jpg'), 'RJ405710-copy')
})

test('masterUrl encodes spaces in the folder', () => {
  assert.equal(
    masterUrl('nature', 'RJ400615.jpg'),
    'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/Images/Nature/Bend%20Oregon%20LR%20Edits/RJ400615.jpg'
  )
})

test('derivativeKey encodes width and format', () => {
  assert.equal(derivativeKey('city', 'RJ405649', 1200, 'avif'), 'optimized/city/RJ405649-1200.avif')
})

test('derivativeUrl is a fully qualified public URL', () => {
  assert.equal(
    derivativeUrl('city', 'RJ405649', 1200, 'avif'),
    'https://knlwzjvuqipjrjpgnovc.supabase.co/storage/v1/object/public/portfolio/optimized/city/RJ405649-1200.avif'
  )
})
