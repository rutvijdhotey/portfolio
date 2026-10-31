import Link from 'next/link'
import './version-switch.css'

const VERSIONS = [1, 2, 3] as const

/* Review scaffolding: lets the three studies be compared side by side without
   retyping URLs. No state, no JS — three links. */
export default function VersionSwitch({ current }: { current: 1 | 2 | 3 }) {
  return (
    <nav className="vswitch" aria-label="Design versions">
      <span className="vswitch-label">Version</span>
      {VERSIONS.map((v) => (
        <Link
          key={v}
          href={`/engineering_v${v}`}
          aria-current={v === current ? 'page' : undefined}
        >
          v{v}
        </Link>
      ))}
    </nav>
  )
}
