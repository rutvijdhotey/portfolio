// scripts/photos/sources.mjs
// The canonical list of photos in the portfolio, in display order.

const list = (category, filenames) => filenames.map(filename => ({ category, filename }))

export const SOURCE_PHOTOS = [
  ...list('city', [
    'RJ405649.jpg', 'RJ405760.jpg', 'RJ405690.jpg', 'RJ405702.jpg',
    'RJ405650.jpg', 'RJ405757.jpg', 'RJ405776.jpg', 'RJ405808.jpg',
    'RJ405710 copy.jpg',
  ]),
  ...list('nature', [
    'RJ400615.jpg', 'RJ400631.jpg', 'RJ400656.jpg', 'RJ400680.jpg',
    'RJ400695.jpg', 'RJ400721.jpg', 'RJ400730.jpg', 'RJ400731.jpg',
  ]),
  ...list('random', [
    'dji_fly_20230512_173012_662_1684010304506_photo_optimized.jpg',
    'DSC07277.jpg', 'IMG_8880.jpg', 'DSC07504.jpg',
  ]),
  ...list('paris', [
    'RJ402306.jpg', 'RJ402344.jpg', 'RJ402371.jpg', 'RJ402536.jpg',
    'RJ402597.jpg', 'RJ402605.jpg', 'RJ402656.jpg', 'RJ402666.jpg',
  ]),
]
