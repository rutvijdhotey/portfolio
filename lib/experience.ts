// lib/experience.ts
// The experience timeline and the company switch. Pure, so both are tested.

type Span = { company: string; start: string; end: string | null }

export type Segment = { company: string; left: number; width: number; current: boolean }

/** 'YYYY-MM' -> months since year 0, so differences are whole months. */
export function monthIndex(ym: string): number {
  const [y, m] = ym.split('-').map(Number)
  return y * 12 + (m - 1)
}

/** Timeline bars, oldest first, as percentages of the whole career up to
 *  `now` ('YYYY-MM'). A current role (end null) runs to `now`. */
export function timelineSegments(roles: readonly Span[], now: string): Segment[] {
  const sorted = [...roles].sort((a, b) => monthIndex(a.start) - monthIndex(b.start))
  if (sorted.length === 0) return []
  const first = monthIndex(sorted[0].start)
  const total = Math.max(1, monthIndex(now) - first)
  return sorted.map((r) => {
    const from = monthIndex(r.start) - first
    const to = (r.end === null ? monthIndex(now) : monthIndex(r.end)) - first
    return {
      company: r.company,
      left: (from / total) * 100,
      width: ((to - from) / total) * 100,
      current: r.end === null,
    }
  })
}

/** Picking the selected company again, or "Overview" (null), clears it. */
export function toggleSelection(current: string | null, next: string | null): string | null {
  return next === null || next === current ? null : next
}
