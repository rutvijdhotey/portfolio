// components/engineering/StackGrid.tsx
import { STACK_GROUPS } from '@/lib/profile'
import { StackGlyph } from './marks'

/* Tools as icon tiles, in one section with two small labelled groups: work
   first, then the side projects. Where there is no drawn mark, the tile
   shows a dashed monogram instead, so a missing logo reads as a choice, not
   a gap. */
export default function StackGrid() {
  return (
    <div className="eng-stack-groups">
      {STACK_GROUPS.map((g) => (
        <div key={g.label} className="eng-stack-group">
          <h3 className="eng-stack-label">{g.label}</h3>
          <ul className="eng-stack">
            {g.items.map((s) => (
              <li key={s.name} className="eng-sk">
                {s.mark ? <StackGlyph mark={s.mark} /> : <span className="eng-sk-mono" aria-hidden="true">{s.monogram}</span>}
                <span className="eng-sk-name">{s.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
