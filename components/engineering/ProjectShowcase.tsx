// components/engineering/ProjectShowcase.tsx
import Link from 'next/link'
import type { Project } from '@/lib/projects'
import { Dots, Icon } from './marks'

/* One project in the reference's block layout: on the left a tinted tile
   with a framed UI mockup, a chat-bubble pill and the title row; on the right
   the summary, role and a call-to-action pill; four feature cards below.
   The mockups are drawn, not screenshots, so they follow the theme. */
export default function ProjectShowcase({ project: p }: { project: Project }) {
  const cta = (
    <>
      <span className="eng-cta2-dot"><Dots /></span>
      {p.link.label}
    </>
  )

  return (
    <article className="eng-pj" aria-labelledby={`pj-${p.slug}`}>
      <div className="eng-pj-grid">
        <div className="eng-tile">
          <div className={`eng-shot eng-shot--${p.mock}`} aria-hidden="true">
            {p.mock === 'site' ? <SiteMock /> : <PhoneMock />}
          </div>
          <div className="eng-bub" aria-hidden="true">
            <span>{p.bubble}</span>
            <b><Icon name="loader" size={16} className="eng-spin" /></b>
          </div>
          <div>
            <h3 className="eng-pj-name" id={`pj-${p.slug}`}>{p.name}</h3>
            <p className="eng-pj-meta"><span>{p.kicker}</span><span>Year: {p.year}</span></p>
          </div>
        </div>

        <div className="eng-side">
          <p className="eng-blurb">{p.blurb}</p>
          <p className="eng-role-l">{p.role}</p>
          <p className="eng-role-d">{p.roleDetail}</p>
          {p.link.external ? (
            <a className="eng-cta2" href={p.link.href} target="_blank" rel="noopener">{cta}</a>
          ) : (
            <Link className="eng-cta2" href={p.link.href}>{cta}</Link>
          )}
        </div>
      </div>

      <ul className="eng-feat">
        {p.features.map((f) => (
          <li key={f.title} className="eng-fc">
            <Icon name={f.icon} size={22} />
            <div>
              <h4>{f.title}</h4>
              <p>{f.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

/* LaCuriosity: a browser window showing the five stream chips and a feed. */
function SiteMock() {
  return (
    <div className="mk-win">
      <div className="mk-bar"><i /><i /><i /><u>lacuriosity.com</u></div>
      <div className="mk-body">
        <span className="mk-logo">LaCuriosity</span>
        <div className="mk-chips">
          <s className="on">Science</s><s>Psychology</s><s>Technology</s><s>Mathematics</s><s>Ecology</s>
        </div>
        <div className="mk-card">
          <div className="mk-img" />
          <div className="mk-lines"><i style={{ width: '90%' }} /><i style={{ width: '70%' }} /><i style={{ width: '80%' }} /></div>
        </div>
        <div className="mk-row"><i /><i /><i /></div>
      </div>
    </div>
  )
}

const WAVE = [6, 12, 8, 16, 10, 18, 7, 14, 9, 12, 6]

/* Notebound: a phone showing a day's photos, a voice note and its text. */
function PhoneMock() {
  return (
    <div className="mk-phone">
      <div className="mk-notch" />
      <p className="mk-day">Day 3 · Kyoto</p>
      <div className="mk-photos"><i /><i /><i /></div>
      <div className="mk-wave">{WAVE.map((h, i) => <i key={i} style={{ height: h }} />)}</div>
      <div className="mk-lines"><i style={{ width: '92%' }} /><i style={{ width: '78%' }} /></div>
      <span className="mk-mic"><Icon name="mic" size={14} /></span>
    </div>
  )
}
