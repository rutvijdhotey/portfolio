// lib/projects.ts
// The two personal projects shown on /engineering, and the filter logic for
// the chips above them. Feature-card copy only restates facts already in the
// approved project text.

export const ALL = 'Show all'
export const FILTERS = [ALL, 'Agentic AI', 'Mobile app', 'Distributed systems'] as const

/** Icons drawn in components/engineering/marks.tsx. */
export type FeatureIcon = 'layers' | 'nodes' | 'route' | 'hands-off' | 'mic' | 'tag' | 'book' | 'offline'

export type Project = {
  slug: string
  name: string
  kicker: string
  year: string
  bubble: string
  blurb: string
  role: string
  roleDetail: string
  tags: readonly string[]
  mock: 'site' | 'phone'
  link: { href: string; label: string; external: boolean }
  features: readonly { icon: FeatureIcon; title: string; text: string }[]
}

export const PROJECTS: readonly Project[] = [
  {
    slug: 'lacuriosity',
    name: 'LaCuriosity',
    kicker: 'Automated editorial platform',
    year: '2026',
    bubble: 'Which stream is trending this week?',
    blurb: 'A publication that writes, illustrates and ships itself every day. One daily trigger, fifty-five nodes, zero human touchpoints.',
    role: 'Role: Sole engineer',
    roleDetail: 'Research, orchestration, prompt design and distribution, end to end.',
    tags: ['Agentic AI', 'Distributed systems'],
    mock: 'site',
    link: { href: 'https://lacuriosity.com', label: 'Visit the site', external: true },
    features: [
      { icon: 'layers', title: 'Five streams.', text: 'Science, Psychology, Technology, Mathematics and Ecology, each driven by its own Claude instance.' },
      { icon: 'nodes', title: 'Fifty-five nodes.', text: 'One daily trigger fans out across a chain of models.' },
      { icon: 'route', title: 'Research to publish.', text: 'Models research, draft, fact-check and publish.' },
      { icon: 'hands-off', title: 'Zero touchpoints.', text: 'No human in the loop between trigger and published page.' },
    ],
  },
  {
    slug: 'notebound',
    name: 'Notebound',
    kicker: 'iOS travel journaling app',
    year: '2026',
    bubble: 'What did we do on day three?',
    blurb: 'Turning a trip’s photos, notes and voice into a written story. Human-in-the-loop intelligence inside a polished consumer product.',
    role: 'Role: Sole engineer',
    roleDetail: 'Haiku classifies intent and tags notes; Opus reads the photos and writes the narrative.',
    tags: ['Agentic AI', 'Mobile app'],
    mock: 'phone',
    link: { href: '/engineering/notebound', label: 'Read the case study', external: false },
    features: [
      { icon: 'mic', title: 'Voice first.', text: 'Capture is voice-first, so a note is a sentence, not a form.' },
      { icon: 'tag', title: 'Tagged by Haiku.', text: 'Haiku classifies intent and tags each note.' },
      { icon: 'book', title: 'Written by Opus.', text: 'Opus reads the photos and writes the narrative.' },
      { icon: 'offline', title: 'Offline-first.', text: 'All capture works with no signal.' },
    ],
  },
]

export function filterProjects<T extends { tags: readonly string[] }>(projects: readonly T[], filter: string): T[] {
  if (filter === ALL) return [...projects]
  return projects.filter((p) => p.tags.includes(filter))
}

export function countLabel(shown: number, total: number): string {
  return `Showing ${shown} of ${total} project${total === 1 ? '' : 's'}`
}
