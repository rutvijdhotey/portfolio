// lib/stars.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dropY, flakeAt, makeDrops, makeFlakes, rng, starCountFor } from './stars.ts'

test('rng is deterministic per seed and stays in [0, 1)', () => {
  const a = rng(7)
  const b = rng(7)
  for (let i = 0; i < 50; i++) {
    const v = a()
    assert.equal(v, b())
    assert.ok(v >= 0 && v < 1)
  }
  assert.notEqual(rng(1)(), rng(2)())
})

test('starCountFor scales with area and is clamped', () => {
  assert.equal(starCountFor(375, 812), 60)
  assert.equal(starCountFor(1440, 900), 144)
  assert.equal(starCountFor(3840, 2160), 220)
  assert.equal(starCountFor(0, 0), 60)
})

test('makeDrops is deterministic and every drop is a short, falling streak', () => {
  assert.deepEqual(makeDrops(30, 5), makeDrops(30, 5))
  for (const d of makeDrops(200)) {
    assert.ok(d.x >= 0 && d.x < 1)
    assert.ok(d.y >= 0 && d.y < 1)
    assert.ok(d.len >= 6 && d.len <= 16)
    assert.ok(d.speed > 0)
  }
})

test('dropY falls over time and wraps back inside the canvas', () => {
  const d = { x: 0.5, y: 0.9, len: 10, speed: 0.5 }
  assert.equal(dropY(d, 0), 0.9)
  const later = dropY(d, 0.1)
  assert.ok(later > 0.9 && later < 1)
  for (const t of [0.3, 1, 7.25, 1000]) {
    const y = dropY(d, t)
    assert.ok(y >= 0 && y < 1, `dropY ${y}`)
  }
})

test('makeFlakes is deterministic and every flake is small and slow', () => {
  assert.deepEqual(makeFlakes(30, 5), makeFlakes(30, 5))
  for (const f of makeFlakes(200)) {
    assert.ok(f.x >= 0 && f.x < 1)
    assert.ok(f.y >= 0 && f.y < 1)
    assert.ok(f.r >= 1 && f.r <= 3)
    assert.ok(f.speed > 0 && f.speed < makeDrops(1)[0].speed)
  }
})

test('flakeAt drifts down, sways a little, and wraps', () => {
  const f = { x: 0.5, y: 0.2, r: 2, speed: 0.1, phase: 0 }
  const a = flakeAt(f, 0)
  const b = flakeAt(f, 1)
  assert.ok(b.y > a.y)
  for (const t of [0, 0.7, 3, 60, 5000]) {
    const p = flakeAt(f, t)
    assert.ok(p.y >= 0 && p.y < 1, `y ${p.y}`)
    assert.ok(Math.abs(p.sway) <= 6, `sway ${p.sway}`)
  }
})
