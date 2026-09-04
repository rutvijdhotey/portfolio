// lib/print-room.ts
// Rendered widths for the Print Room layout.
//
// A wide frame takes the full content column. A tall frame is deliberately
// held back — a 2:3 frame at full column width runs far past the viewport
// and the visitor scrolls through a single photograph.

export const PRINT_MAX = 1440
export const TALL_MAX = 720

export function printSizes(orientation: 'wide' | 'tall'): string {
  return orientation === 'tall'
    ? `(max-width: 768px) 92vw, min(${TALL_MAX}px, 53vw)`
    : `(max-width: 768px) 92vw, min(${PRINT_MAX}px, 92vw)`
}
