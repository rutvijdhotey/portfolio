// components/engineering/PillNav.tsx
'use client'

import { SECTIONS } from '@/lib/sections'
import { EMAIL } from '@/lib/profile'
import ThemeOrb from './ThemeOrb'
import { Icon } from './marks'
import { useActiveSection } from './useActiveSection'

const ICONS = ['home', 'briefcase', 'grid', 'stack'] as const

/* Three floating bubbles, like the reference: the section pill, the theme
   orb, and a filled call-to-action. "Ask me anything" has no icon of its own;
   the CTA stands for it. */
export default function PillNav() {
  const active = useActiveSection()

  return (
    <div className="eng-navbar">
      <nav className="eng-nav" aria-label="Sections">
        {ICONS.map((icon, i) => (
          <a
            key={SECTIONS[i].id}
            className="eng-nav-icon"
            href={`#${SECTIONS[i].id}`}
            aria-label={SECTIONS[i].label}
            aria-current={active === i ? 'true' : undefined}
          >
            <Icon name={icon} size={19} />
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
