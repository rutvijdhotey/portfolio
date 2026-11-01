// lib/projects.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ALL, FILTERS, PROJECTS, countLabel, filterProjects } from './projects.ts'

test('"Show all" returns every project, as a copy', () => {
  const out = filterProjects(PROJECTS, ALL)
  assert.deepEqual(out, [...PROJECTS])
  assert.notEqual(out, PROJECTS)
})

test('a tag filter returns only projects carrying that tag', () => {
  const out = filterProjects(PROJECTS, 'Mobile app')
  assert.ok(out.length > 0)
  for (const p of out) assert.ok(p.tags.includes('Mobile app'))
})

test('an unknown filter matches nothing', () => {
  assert.deepEqual(filterProjects(PROJECTS, 'Nope'), [])
})

test('countLabel pluralises on the total', () => {
  assert.equal(countLabel(2, 2), 'Showing 2 of 2 projects')
  assert.equal(countLabel(1, 2), 'Showing 1 of 2 projects')
  assert.equal(countLabel(1, 1), 'Showing 1 of 1 project')
  assert.equal(countLabel(0, 2), 'Showing 0 of 2 projects')
})

test('data integrity: unique slugs, known tags, no dead filter chip', () => {
  const slugs = PROJECTS.map((p) => p.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  const chips = FILTERS.filter((f) => f !== ALL)
  for (const p of PROJECTS) for (const t of p.tags) assert.ok((chips as readonly string[]).includes(t), `unknown tag ${t}`)
  for (const chip of chips) assert.ok(filterProjects(PROJECTS, chip).length > 0, `dead chip ${chip}`)
})

test('every project has four feature cards and a known mock', () => {
  for (const p of PROJECTS) {
    assert.equal(p.features.length, 4, p.slug)
    for (const f of p.features) assert.ok(f.title.length > 0 && f.text.length > 0)
    assert.ok(p.mock === 'site' || p.mock === 'phone')
  }
})
