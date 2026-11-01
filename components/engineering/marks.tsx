// components/engineering/marks.tsx
// Every icon on /engineering, drawn inline so the page loads no icon font.
// Line icons are 24-unit and take currentColor; the stack marks are simple
// monochrome sketches, not the brands' official artwork.

import type { ReactNode, SVGProps } from 'react'
import type { FeatureIcon } from '@/lib/projects'
import type { StackMark } from '@/lib/profile'

type IconName =
  | FeatureIcon
  | 'home' | 'briefcase' | 'grid' | 'stack' | 'sun' | 'moon'
  | 'arrow-up-right' | 'loader'

const PATHS: Record<IconName, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z" />,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  stack: <><path d="m12 3 9 5-9 5-9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" />,
  'arrow-up-right': <path d="M7 17 17 7M8 7h9v9" />,
  loader: <path d="M12 3a9 9 0 1 0 9 9" />,
  layers: <><path d="m12 3 9 5-9 5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
  nodes: <><circle cx="6" cy="5" r="2" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="12" r="2" /><path d="M6 7v10M6 7c0 4 4 5 10 5" /></>,
  route: <><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16" /></>,
  'hands-off': <><circle cx="12" cy="8" r="4" /><path d="M5 21v-1a6 6 0 0 1 9.5-4.9M3 3l18 18" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  tag: <><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></>,
  offline: <><path d="M17.5 19H7a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.7 9.1a4.5 4.5 0 0 1-.2 9.9Z" /><path d="M3 3l18 18" /></>,
}

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}

/* ── stack marks ──────────────────────────────────────────────────── */
const MARKS: Record<StackMark, ReactNode> = {
  typescript: (
    <>
      <rect x="3" y="3" width="26" height="26" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="16" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="currentColor" fontFamily="inherit">TS</text>
    </>
  ),
  react: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6">
      <ellipse cx="16" cy="16" rx="13" ry="5" />
      <ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(120 16 16)" />
      <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
    </g>
  ),
  supabase: <path d="M18 3 6 18h9l-1 11 12-15h-9Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  gemini: <path d="M16 3c0 7 6 13 13 13-7 0-13 6-13 13 0-7-6-13-13-13 7 0 13-6 13-13Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  ghost: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M7 28V14a9 9 0 0 1 18 0v14l-3-2-3 2-3-2-3 2-3-2Z" />
      <circle cx="13" cy="14" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="14" r="1.4" fill="currentColor" stroke="none" />
    </g>
  ),
  cloud: <path d="M9 25h14.5a5.5 5.5 0 0 0 .9-10.93A8 8 0 0 0 9.2 13.1 6 6 0 0 0 9 25Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  braces: (
    <path
      d="M12 5c-3 0-4 1.5-4 4v3.5C8 14.5 7 16 5 16c2 0 3 1.5 3 3.5V23c0 2.5 1 4 4 4M20 5c3 0 4 1.5 4 4v3.5c0 2 1 3.5 3 3.5-2 0-3 1.5-3 3.5V23c0 2.5-1 4-4 4"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    />
  ),
  exchange: (
    <path
      d="M5 11h20m-5-5 5 5-5 5M27 21H7m5-5-5 5 5 5"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    />
  ),
  database: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="16" cy="8" rx="10" ry="3.5" />
      <path d="M6 8v16c0 1.9 4.5 3.5 10 3.5s10-1.6 10-3.5V8M6 16c0 1.9 4.5 3.5 10 3.5s10-1.6 10-3.5" />
    </g>
  ),
}

export function StackGlyph({ mark }: { mark: StackMark }) {
  return <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">{MARKS[mark]}</svg>
}

/* ── company marks: a play glyph for YouTube, text marks for the rest ── */
export function CompanyMark({ company }: { company: string }) {
  if (company === 'YouTube') {
    return (
      <svg className="eng-co-mark" width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
        <rect width="22" height="16" rx="4.5" fill="currentColor" />
        <path d="M9 4.6v6.8l5.8-3.4Z" fill="var(--co-mark-cut, #0a0a0a)" />
      </svg>
    )
  }
  return <span className="eng-co-text" aria-hidden="true">{company === 'eBay' ? 'ebay' : company.slice(0, 1)}</span>
}

/* Five dots, the CTA pill's leading glyph. */
export function Dots() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="3.5" r="1.4" /><circle cx="10" cy="6" r="1.4" /><circle cx="5" cy="9" r="1.4" />
      <circle cx="11" cy="11.5" r="1.4" /><circle cx="3" cy="13" r="1.1" />
    </svg>
  )
}
