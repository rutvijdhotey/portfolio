import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveTheme, nextTheme, THEME_STORAGE_KEY } from './theme.ts'

test('an explicit stored choice always wins', () => {
  assert.equal(resolveTheme('light', false), 'light')
  assert.equal(resolveTheme('dark', true), 'dark')
})

test('with no stored choice, a light OS gives light', () => {
  assert.equal(resolveTheme(null, true), 'light')
})

test('with no stored choice and no signal, the default is dark', () => {
  assert.equal(resolveTheme(null, false), 'dark')
})

test('a junk stored value is ignored', () => {
  assert.equal(resolveTheme('sepia', true), 'light')
  assert.equal(resolveTheme('', false), 'dark')
})

test('nextTheme flips', () => {
  assert.equal(nextTheme('dark'), 'light')
  assert.equal(nextTheme('light'), 'dark')
})

test('the storage key is stable', () => {
  assert.equal(THEME_STORAGE_KEY, 'theme')
})
