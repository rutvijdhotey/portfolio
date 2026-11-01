// lib/profile.ts
// Static copy for /engineering. The experience text is the approved,
// abstracted wording from docs/rebuild/REBUILD_PROGRESS.md.

/** One per hero scene — lib/profile.test.ts enforces the count. */
export const HERO_ROLES = ['Agentic AI Engineer', 'Backend Engineer', 'Systems Builder'] as const

export type Role = {
  company: string
  title: string
  when: string
  /** Short range for the timeline label. */
  years: string
  what: string
  /** One-word domain, shown as a tag under the summary. */
  tag: string
  /** 'YYYY-MM'. `end` is null for the current role. */
  start: string
  end: string | null
}

/** Newest first: the order of the company buttons. */
export const EXPERIENCE: readonly Role[] = [
  {
    company: 'YouTube',
    title: 'Software Engineer',
    when: 'Apr 2020 — present',
    years: '2020 — now',
    what: 'Backend engineering on the Shorts creation platform: distributed systems at billions-of-requests scale, cross-team launches, and mentoring engineers.',
    tag: 'Video',
    start: '2020-04',
    end: null,
  },
  {
    company: 'eBay',
    title: 'Software Engineer',
    when: 'Apr 2018 — Apr 2020',
    years: '2018 — 20',
    what: 'Backend services and machine learning for marketplace ranking and listing pricing.',
    tag: 'Marketplace',
    start: '2018-04',
    end: '2020-04',
  },
  {
    company: 'NetApp',
    title: 'Member of Technical Staff',
    when: 'Feb 2017 — Apr 2018',
    years: '2017 — 18',
    what: 'Data-protection features and REST APIs for VMware backup and restore.',
    tag: 'Storage',
    start: '2017-02',
    end: '2018-04',
  },
]

/** Marks drawn in components/engineering/marks.tsx. `null` means no mark is
 *  drawn for that tool, and the tile shows the dashed monogram instead.
 *  The last four are generic glyphs (a cloud, braces, two arrows, a
 *  database), not the products' logos. */
export type StackMark =
  | 'typescript' | 'react' | 'supabase' | 'gemini' | 'ghost'
  | 'cloud' | 'braces' | 'exchange' | 'database'

export type StackTool = { name: string; mark: StackMark | null; monogram: string }

/** One Stack section, two groups: what Rutvij uses at work, then what the
 *  side projects on this page are built with. */
export const STACK_GROUPS: readonly { label: string; items: readonly StackTool[] }[] = [
  {
    label: 'At work',
    items: [
      { name: 'C++', mark: null, monogram: 'C++' },
      { name: 'Python', mark: null, monogram: 'Py' },
      { name: 'Spanner', mark: 'database', monogram: 'Sp' },
      { name: 'gRPC', mark: 'exchange', monogram: 'gR' },
      { name: 'REST', mark: 'braces', monogram: '{}' },
      { name: 'GCP', mark: 'cloud', monogram: 'GC' },
    ],
  },
  {
    label: 'Side projects',
    items: [
      { name: 'Claude API', mark: null, monogram: 'Cl' },
      { name: 'Gemini API', mark: 'gemini', monogram: 'Gm' },
      { name: 'ChatGPT', mark: null, monogram: 'GPT' },
      { name: 'TypeScript', mark: 'typescript', monogram: 'TS' },
      { name: 'React Native', mark: 'react', monogram: 'Rn' },
      { name: 'Supabase', mark: 'supabase', monogram: 'Sb' },
      { name: 'Postgres', mark: null, monogram: 'Pg' },
      { name: 'Ghost CMS', mark: 'ghost', monogram: 'Gh' },
      { name: 'Make.com', mark: null, monogram: 'M' },
      { name: 'ElevenLabs', mark: null, monogram: '11' },
    ],
  },
]

export const EMAIL = 'rutvij.dhotey@gmail.com'

export const LINKS: readonly { label: string; href: string }[] = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/rutvij-dhotey' },
  { label: 'GitHub', href: 'https://github.com/rutvijdhotey' },
  { label: 'Photography', href: '/' },
]
