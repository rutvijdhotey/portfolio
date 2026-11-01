// components/engineering/ExperienceSwitcher.tsx
'use client'

import { useState, type CSSProperties } from 'react'
import { EXPERIENCE } from '@/lib/profile'
import { timelineSegments, toggleSelection } from '@/lib/experience'
import { CompanyMark } from './marks'

/* Company buttons, newest first. With none selected the card shows the whole
   career as a timeline, each bar proportional to the months spent there;
   picking a company swaps in its title, dates, summary and domain. Picking it
   again, or "Overview", goes back.

   `now` ('YYYY-MM') comes from the page, so the server and the client draw
   the same timeline. */
export default function ExperienceSwitcher({ now }: { now: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  const role = EXPERIENCE.find((e) => e.company === selected)
  const pick = (company: string | null) => setSelected((cur) => toggleSelection(cur, company))

  return (
    <>
      <div className="eng-cos" role="group" aria-label="Companies">
        {EXPERIENCE.map((e) => (
          <button
            key={e.company}
            type="button"
            className="eng-co"
            aria-pressed={selected === e.company}
            onClick={() => pick(e.company)}
          >
            <CompanyMark company={e.company} />
            {e.company}
          </button>
        ))}
      </div>

      <div className="eng-card eng-exp" aria-live="polite">
        {role ? (
          <div className="eng-exp-detail">
            <div className="eng-exp-head">
              <span className="eng-exp-mark"><CompanyMark company={role.company} /></span>
              <div>
                <h3 className="eng-exp-name">{role.company}</h3>
                <p className="eng-exp-meta">{role.title} · {role.when}</p>
              </div>
              <button type="button" className="eng-exp-back" onClick={() => pick(null)}>Overview</button>
            </div>
            <p className="eng-exp-what">{role.what}</p>
            <span className="eng-exp-tag">{role.tag}</span>
          </div>
        ) : (
          <div className="eng-exp-overview">
            <p className="eng-exp-big">Nine years of backend work across video, marketplace and storage.</p>
            <ol className="eng-tl" aria-label="Career timeline">
              {timelineSegments(EXPERIENCE, now).map((s) => {
                const e = EXPERIENCE.find((x) => x.company === s.company)!
                return (
                  <li key={s.company} className="eng-tl-item" style={{ '--l': `${s.left}%`, '--wd': `${s.width}%` } as CSSProperties}>
                    <button
                      type="button"
                      className={`eng-tl-bar${s.current ? ' is-now' : ''}`}
                      onClick={() => pick(s.company)}
                      aria-label={`${s.company}, ${e.when}`}
                    />
                    <span className="eng-tl-label">{s.company}<small>{e.years}</small></span>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </div>
    </>
  )
}
