// lib/profile.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EXPERIENCE, HERO_ROLES, LINKS, STACK_GROUPS } from './profile.ts'

test('the hero has several distinct roles to cycle through', () => {
  assert.ok(HERO_ROLES.length >= 2)
  assert.equal(new Set(HERO_ROLES).size, HERO_ROLES.length)
})

test('experience is newest first and every entry is complete', () => {
  assert.deepEqual(EXPERIENCE.map((e) => e.company), ['YouTube', 'eBay', 'NetApp'])
  for (const e of EXPERIENCE) {
    for (const k of ['company', 'when', 'title', 'what', 'tag', 'years', 'start'] as const) assert.ok(e[k].length > 0, `${e.company}.${k}`)
    assert.match(e.start, /^\d{4}-\d{2}$/)
    if (e.end !== null) assert.match(e.end, /^\d{4}-\d{2}$/)
  }
  assert.equal(EXPERIENCE[0].end, null)
})

test('stack is two groups, work first, with no tool listed twice', () => {
  assert.deepEqual(STACK_GROUPS.map((g) => g.label), ['At work', 'Side projects'])
  const names = STACK_GROUPS.flatMap((g) => g.items.map((s) => s.name))
  assert.equal(new Set(names).size, names.length)
  for (const tool of ['C++', 'Python', 'Spanner', 'gRPC', 'REST', 'GCP']) {
    assert.ok(STACK_GROUPS[0].items.some((s) => s.name === tool), `${tool} missing from At work`)
  }
})

test('every stack tile has a mark, or a monogram short enough for its tile', () => {
  for (const s of STACK_GROUPS.flatMap((g) => g.items)) {
    if (s.mark === null) assert.ok(s.monogram.length >= 1 && s.monogram.length <= 3, s.name)
  }
})

test('links are absolute https URLs or site paths', () => {
  for (const l of LINKS) assert.match(l.href, /^(https:\/\/|\/)/)
})
