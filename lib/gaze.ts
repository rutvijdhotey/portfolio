// lib/gaze.ts
// Pure mapping from a cursor position to the portrait's pupil offset. No DOM
// access, so it is unit testable: Portrait reads the DOM and feeds numbers in.

/** Furthest a pupil travels sideways, in SVG units. */
export const GAZE_X = 3.5
/** Furthest a pupil travels up or down, in SVG units. Less than GAZE_X
 *  because the glasses are wider than the eye is tall. */
export const GAZE_Y = 2.5
/** Screen distance, in px, at which the pupils reach full travel. Closer
 *  than this they ease in, so a cursor crossing the face does not snap them. */
export const GAZE_REACH = 200

/** Pupil offset for a cursor `dx`, `dy` px from the eyes. Points the pupils
 *  at the cursor and keeps them inside an ellipse of GAZE_X by GAZE_Y. */
export function gazeOffset(dx: number, dy: number): { x: number; y: number } {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return { x: 0, y: 0 }
  const d = Math.hypot(dx, dy)
  if (d === 0) return { x: 0, y: 0 }
  const k = Math.min(1, d / GAZE_REACH)
  return { x: (dx / d) * GAZE_X * k, y: (dy / d) * GAZE_Y * k }
}
