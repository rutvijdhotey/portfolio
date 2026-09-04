// scripts/photos/freshness.mjs
// Pure freshness predicate. No I/O — safe to import from tests.

/**
 * Should a derivative be re-encoded?
 *
 * @param {number|null|undefined} destMtimeMs  mtime of the derivative, or null/undefined if absent
 * @param {number} srcMtimeMs                  mtime of the master
 * @param {boolean} [force]                    ignore freshness and rebuild anyway
 * @returns {boolean}
 */
export function needsRebuild(destMtimeMs, srcMtimeMs, force = false) {
  if (force) return true
  if (destMtimeMs === null || destMtimeMs === undefined) return true
  return destMtimeMs < srcMtimeMs
}
