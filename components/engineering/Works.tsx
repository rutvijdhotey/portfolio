// components/engineering/Works.tsx
'use client'

import { useState } from 'react'
import { ALL, FILTERS, PROJECTS, countLabel, filterProjects } from '@/lib/projects'
import ProjectShowcase from './ProjectShowcase'

/* Filter chips over the projects, with a live count. The server renders
   "Show all", so with JS off every project is on the page. */
export default function Works() {
  const [filter, setFilter] = useState<string>(ALL)
  const shown = filterProjects(PROJECTS, filter)

  return (
    <>
      <div className="eng-chips" role="group" aria-label="Filter projects">
        {FILTERS.map((f) => (
          <button key={f} type="button" className="eng-chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <p className="eng-count" aria-live="polite">{countLabel(shown.length, PROJECTS.length)}</p>
      {shown.map((p) => <ProjectShowcase key={p.slug} project={p} />)}
    </>
  )
}
