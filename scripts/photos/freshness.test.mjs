import { test } from 'node:test'
import assert from 'node:assert/strict'
import { needsRebuild } from './freshness.mjs'

test('a missing derivative always needs rebuilding', () => {
  assert.equal(needsRebuild(null, 1000), true)
  assert.equal(needsRebuild(undefined, 1000), true)
})

test('a derivative older than its master needs rebuilding', () => {
  assert.equal(needsRebuild(500, 1000), true)
})

test('a derivative newer than its master is left alone', () => {
  assert.equal(needsRebuild(1500, 1000), false)
})

test('equal timestamps count as fresh', () => {
  assert.equal(needsRebuild(1000, 1000), false)
})

test('force overrides freshness', () => {
  assert.equal(needsRebuild(1500, 1000, true), true)
})
