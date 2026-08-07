// scripts/photos/urls.mjs
// Pure helpers. No I/O — safe to import from tests and from build scripts.

import { MASTER_PREFIX, DERIVATIVE_PREFIX, DERIVATIVE_PATH, CATEGORY_FOLDERS } from './config.mjs'

/** Filename -> stable id. Spaces become hyphens so ids are URL-safe. */
export function photoId(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/\s+/g, '-')
}

/** Public URL of an untouched original. */
export function masterUrl(category, filename) {
  const folder = CATEGORY_FOLDERS[category]
  if (!folder) throw new Error(`Unknown category: ${category}`)
  const encodedFolder = folder.split('/').map(encodeURIComponent).join('/')
  return `${MASTER_PREFIX}/${encodedFolder}/${encodeURIComponent(filename)}`
}

/** Storage key (path within the bucket) for a derivative. */
export function derivativeKey(category, id, width, ext) {
  return `${DERIVATIVE_PATH}/${category}/${id}-${width}.${ext}`
}

/** Public URL for a derivative. */
export function derivativeUrl(category, id, width, ext) {
  return `${DERIVATIVE_PREFIX}/${category}/${id}-${width}.${ext}`
}
