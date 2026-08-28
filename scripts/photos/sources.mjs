// scripts/photos/sources.mjs
// The canonical list of photos in the portfolio, in display order.
//
// Cut from 39 to 22 on 2026-08-27. Removed entirely: the 8 Bend Oregon
// frames and the 4 "Random" frames, which were the same register — bright,
// outdoors, people at leisure — and pulled against the night-street work
// that the rest of the site is. Five more went individually:
//   RJ405649  Japan, flat daytime street, the one frame with no light in it
//   RJ402306  Paris, posed portrait by the Seine
//   RJ402597  Paris, generic blue-sky street
//   RJ402656  Paris, posed portrait at the Moulin Rouge
//   RJ400161  Copenhagen, couple in a library
// Nothing was deleted from Supabase. These derivatives simply go unreferenced.

const list = (category, filenames) => filenames.map(filename => ({ category, filename }))

export const SOURCE_PHOTOS = [
  // Japan — storage category is `city` and must stay that way, or every
  // derivative URL changes and 200+ files need re-uploading for no gain.
  ...list('city', [
    'RJ405760.jpg', 'RJ405690.jpg', 'RJ405702.jpg', 'RJ405650.jpg',
    'RJ405757.jpg', 'RJ405776.jpg', 'RJ405808.jpg', 'RJ405710 copy.jpg',
  ]),
  ...list('copenhagen', [
    'RJ400008.jpg', 'RJ400034.jpg', 'RJ400074.jpg', 'RJ400173.jpg',
    'RJ400190.jpg', 'RJ400204.jpg', 'RJ400207.jpg', 'RJ409387.jpg',
    'RJ409814.jpg',
  ]),
  ...list('paris', [
    'RJ402344.jpg', 'RJ402371.jpg', 'RJ402536.jpg', 'RJ402605.jpg',
    'RJ402666.jpg',
  ]),
]
