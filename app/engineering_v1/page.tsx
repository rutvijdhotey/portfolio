import Link from 'next/link'
import CursorPortrait from '@/components/CursorPortrait'
import VersionSwitch from '@/components/VersionSwitch'
import './v1.css'

const ROLES = [
  {
    company: 'YouTube',
    when: 'Apr 2020 — present',
    title: 'Software Engineer',
    what: 'Backend engineering on the Shorts creation platform: distributed systems at billions-of-requests scale, cross-team launches, and mentoring engineers.',
  },
  {
    company: 'eBay',
    when: 'Apr 2018 — Apr 2020',
    title: 'Software Engineer',
    what: 'Backend services and machine learning for marketplace ranking and listing pricing.',
  },
  {
    company: 'NetApp',
    when: 'Feb 2017 — Apr 2018',
    title: 'Member of Technical Staff',
    what: 'Data-protection features and REST APIs for VMware backup and restore.',
  },
]

const STACK = [
  'Claude API', 'Gemini API', 'TypeScript', 'React Native',
  'Supabase', 'Ghost CMS', 'Make.com', 'ElevenLabs',
]

export default function EngineeringV1() {
  return (
    <main className="v1">
      <VersionSwitch current={1} />

      <div className="v1-navbar">
        <nav className="v1-nav" aria-label="Sections">
          <a className="v1-nav-icon" href="#top" aria-label="Top">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z" /></svg>
          </a>
          <a className="v1-nav-icon" href="#work" aria-label="Work">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
          </a>
          <a className="v1-nav-icon" href="#experience" aria-label="Experience">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
          </a>
          <a className="v1-nav-icon" href="#stack" aria-label="Stack">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5Z" /><path d="m3 13 9 5 9-5" /></svg>
          </a>
          <span className="v1-nav-sep" aria-hidden="true" />
          <a className="v1-cta" href="mailto:rutvij.dhotey@gmail.com">
            <span className="v1-avatar" aria-hidden="true">RD</span>
            <span className="v1-nav-label">Get in touch</span>
          </a>
        </nav>
      </div>

      <div className="v1-wrap">
        <header className="v1-hero" id="top">
          <div>
            <h1 className="v1-h1">Agentic AI<br />Engineer</h1>
            <div className="v1-pills">
              <a className="v1-pill v1-pill--solid" href="#experience">About me</a>
              <a className="v1-pill" href="#work">See my work <span aria-hidden="true">↗</span></a>
            </div>
          </div>

          <CursorPortrait className="v1-portrait" />

          <div className="v1-intro">
            <p className="v1-eyebrow">Hi, I&rsquo;m Rutvij</p>
            <p className="v1-lede">I build systems that run themselves</p>
            <p>Backend engineering at YouTube on the Shorts creation platform, at billions-of-requests scale.</p>
            <p className="v1-lede">Autonomous pipelines and embedded intelligence</p>
            <p>One trigger fires and a chain of models research, draft, fact-check and publish. Or the intelligence lives inside a product someone holds.</p>
          </div>
        </header>

        <section className="v1-section v1-reveal">
          <h2 className="v1-title">Shipped at scale at</h2>
          <p className="v1-sub" style={{ marginBottom: 56 }}>
            Nine years of backend work across video, marketplace and storage — distributed
            systems, ranking models and the APIs underneath them.
          </p>
          <div className="v1-logos">
            <span className="v1-logo v1-logo--now">YouTube</span>
            <span className="v1-logo">eBay</span>
            <span className="v1-logo">NetApp</span>
            <span className="v1-logo">Penn State</span>
          </div>
        </section>

        <section id="work" className="v1-reveal" style={{ paddingBottom: 48 }}>
          <h2 className="v1-title">Works.</h2>
          <div className="v1-chips">
            <span className="v1-chip v1-chip--on">Show all</span>
            <span className="v1-chip">Agentic AI</span>
            <span className="v1-chip">Mobile app</span>
            <span className="v1-chip">Distributed systems</span>
          </div>
          <p className="v1-count">Showing 2 of 2 projects</p>
        </section>

        <section className="v1-section v1-reveal" style={{ paddingBottom: 72 }}>
          <h3 className="v1-proj-head">
            LaCuriosity. A publication that writes, illustrates and ships itself every day.
          </h3>
          <div className="v1-tags">
            <span className="v1-tag">#AgenticAI</span>
            <span className="v1-tag">#DistributedSystems</span>
          </div>
          <article className="v1-card">
            <div>
              <p className="v1-bubble">Which stream is trending this week?</p>
              <h4>Automated editorial platform</h4>
              <p className="v1-meta">Personal project · 2026</p>
              <p>
                Five thematic streams — Science, Psychology, Technology, Mathematics and
                Ecology — each driven by a specialized Claude instance with its own persona,
                research mandate and visual identity. One daily trigger, fifty-five nodes,
                zero human touchpoints.
              </p>
              <p><strong>Role: Sole engineer.</strong> Research, orchestration, prompt design and distribution, end to end.</p>
              <a className="v1-pill v1-pill--solid" href="https://lacuriosity.com" target="_blank" rel="noopener">
                Visit the site <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="v1-stats">
              <div>
                <div className="v1-stat-n">55</div>
                <div className="v1-stat-l">Automation nodes</div>
              </div>
              <div>
                <div className="v1-stat-n">5</div>
                <div className="v1-stat-l">Editorial streams</div>
              </div>
              <div>
                <div className="v1-stat-n v1-stat-n--accent">0</div>
                <div className="v1-stat-l">Human touchpoints</div>
              </div>
            </div>
          </article>
        </section>

        <section className="v1-section v1-reveal">
          <h3 className="v1-proj-head">
            Notebound. Turning a trip&rsquo;s photos, notes and voice into a written story.
          </h3>
          <div className="v1-tags">
            <span className="v1-tag">#AgenticAI</span>
            <span className="v1-tag">#MobileApp</span>
          </div>
          <article className="v1-card">
            <div>
              <p className="v1-bubble">What did we do on day three?</p>
              <h4>iOS travel journaling app</h4>
              <p className="v1-meta">Personal project · 2026</p>
              <p>
                The opposite mode of agentic AI to LaCuriosity: human-in-the-loop, multimodal
                intelligence inside a polished consumer product. Capture is voice-first and
                offline-first.
              </p>
              <p><strong>Role: Sole engineer.</strong> Haiku classifies intent and tags notes; Opus reads the photos and writes the narrative.</p>
              <Link className="v1-pill" href="/engineering/notebound">
                Read the case study <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="v1-stats">
              <div>
                <div className="v1-stat-n">289</div>
                <div className="v1-stat-l">Tests passing</div>
              </div>
              <div>
                <div className="v1-stat-n">3</div>
                <div className="v1-stat-l">Claude models</div>
              </div>
              <div>
                <div className="v1-stat-n v1-stat-n--accent">100%</div>
                <div className="v1-stat-l">Offline-first capture</div>
              </div>
            </div>
          </article>
        </section>

        <section id="experience" className="v1-section v1-reveal">
          <h2 className="v1-title">Experience.</h2>
          {ROLES.map((r) => (
            <div className="v1-role" key={r.company}>
              <div>
                <h3>{r.company}</h3>
                <p className="v1-role-when">{r.when}</p>
              </div>
              <div>
                <p className="v1-role-what">{r.title}</p>
                <p>{r.what}</p>
              </div>
            </div>
          ))}
        </section>

        <section id="stack" className="v1-section v1-reveal">
          <h2 className="v1-title">Stack.</h2>
          <div className="v1-stack">
            {STACK.map((s) => <span key={s}>{s}</span>)}
          </div>
        </section>
      </div>

      <footer className="v1-footer">
        <div className="v1-wrap v1-footer-in">
          <div>
            <p className="v1-eyebrow" style={{ marginBottom: 20 }}>Ask me anything</p>
            <a className="v1-mail" href="mailto:rutvij.dhotey@gmail.com">rutvij.dhotey@gmail.com</a>
          </div>
          <div className="v1-links">
            <a className="v1-pill" href="https://linkedin.com/in/rutvij-dhotey" target="_blank" rel="noopener">LinkedIn</a>
            <a className="v1-pill" href="https://github.com/rutvijdhotey" target="_blank" rel="noopener">GitHub</a>
            <Link className="v1-pill" href="/">Photography</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
