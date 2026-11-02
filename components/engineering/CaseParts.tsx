// components/engineering/CaseParts.tsx
// Pieces both case studies share: the stat row, the "next case study" card
// and the footer.

import Link from 'next/link'
import { Icon } from './marks'

export function CaseStats({ stats }: { stats: readonly { value: string; label: string }[] }) {
  return (
    <ul className="cs-stats">
      {stats.map((s) => (
        <li key={s.label} className="cs-stat"><b>{s.value}</b><span>{s.label}</span></li>
      ))}
    </ul>
  )
}

export function CaseNext({ href, name }: { href: string; name: string }) {
  return (
    <Link className="cs-next" href={href}>
      <div>
        <p className="cs-kick">Next case study</p>
        <b>{name}</b>
      </div>
      <span className="eng-cta2-dot" aria-hidden="true"><Icon name="arrow-up-right" size={20} /></span>
    </Link>
  )
}

export function CaseFoot() {
  return (
    <footer className="cs-foot">
      <span>© {new Date().getFullYear()} Rutvij Dhotey</span>
      <Link href="/engineering#works">← Back to Engineering</Link>
    </footer>
  )
}
