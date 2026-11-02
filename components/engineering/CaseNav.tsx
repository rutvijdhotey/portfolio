// components/engineering/CaseNav.tsx
'use client'

import Link from 'next/link'
import { EMAIL } from '@/lib/profile'
import ThemeOrb from './ThemeOrb'
import { Icon } from './marks'
import { useActiveSection } from './useActiveSection'

export type CaseSection = { id: string; label: string }

/* The case studies' version of the pill nav: a back arrow to /engineering,
   then one text pill per section (hidden on narrow screens, where the page
   is a single short column), the theme orb and the same call-to-action. */
export default function CaseNav({ sections }: { sections: readonly CaseSection[] }) {
  const active = useActiveSection(sections.map((s) => s.id))

  return (
    <div className="eng-navbar">
      <nav className="eng-nav" aria-label="Case study">
        <Link className="eng-nav-icon" href="/engineering#works" aria-label="Back to Engineering">
          <Icon name="arrow-left" size={19} />
        </Link>
        {sections.map((s, i) => (
          <a
            key={s.id}
            className="eng-nav-icon cs-nav-text"
            href={`#${s.id}`}
            aria-current={active === i ? 'true' : undefined}
          >
            {s.label}
          </a>
        ))}
      </nav>
      <ThemeOrb />
      <a className="eng-cta" href={`mailto:${EMAIL}`}>
        <span className="eng-avatar" aria-hidden="true">RD</span>
        <span className="eng-nav-label">Get in touch</span>
      </a>
    </div>
  )
}
