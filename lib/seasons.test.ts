import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ROLE_MS, SEASONS, SEASON_MS, nextSeason, vaporWords, type Season } from './seasons.ts'

test('the seasons run none, rain, snow, sun', () => {
  assert.deepEqual([...SEASONS], ['none', 'rain', 'snow', 'sun'])
})

test('nextSeason walks the seasons and comes back to none', () => {
  const seen: Season[] = ['none']
  for (let i = 0; i < 4; i++) seen.push(nextSeason(seen[i]))
  assert.deepEqual(seen, ['none', 'rain', 'snow', 'sun', 'none'])
})

test('a role holds for longer than a season', () => {
  assert.ok(ROLE_MS > SEASON_MS)
})

test('vaporWords keeps every character, split by word', () => {
  const words = vaporWords('Agentic AI Engineer')
  assert.deepEqual(words.map((w) => w.map((c) => c.ch).join('')), ['Agentic', 'AI', 'Engineer'])
  assert.deepEqual(vaporWords(''), [])
  assert.deepEqual(vaporWords('  Systems   Builder ').map((w) => w.length), [7, 7])
})

test('vaporWords is the same on every call, so server and client markup match', () => {
  assert.deepEqual(vaporWords('Backend Engineer'), vaporWords('Backend Engineer'))
})

test('vaporWords keeps drift and delays in range', () => {
  const chars = vaporWords('Agentic AI Engineer').flat()
  for (const c of chars) {
    assert.ok(Math.abs(c.vx) <= 0.25)
    assert.ok(c.dx >= 0.15 && c.dx <= 0.6)
    assert.ok(c.dy >= -0.9 && c.dy <= -0.5)
    assert.ok(c.inDelay >= 0 && c.outDelay >= 0)
  }
  // Letters condense left to right, give or take the jitter.
  assert.ok(chars.at(-1)!.inDelay > chars[0].inDelay)
})
