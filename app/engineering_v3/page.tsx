import Link from 'next/link'
import VersionSwitch from '@/components/VersionSwitch'
import './v3.css'

const LEDGER = [
  {
    company: 'YouTube',
    when: '2020 —',
    title: 'Software Engineer',
    what: 'Backend engineering on the Shorts creation platform: distributed systems at billions-of-requests scale, cross-team launches, and mentoring engineers.',
  },
  {
    company: 'eBay',
    when: '2018 — 2020',
    title: 'Software Engineer',
    what: 'Backend services and machine learning for marketplace ranking and listing pricing.',
  },
  {
    company: 'NetApp',
    when: '2017 — 2018',
    title: 'Member of Technical Staff',
    what: 'Data-protection features and REST APIs for VMware backup and restore.',
  },
]

const RECORD = [
  { h: 'US Patent', p: '“Verified Video Reviews” — US 20210158371, filed 2019' },
  { h: 'Google Developer Challenge Scholarship', p: 'Selected from 100,000+ applicants, 2018' },
  { h: 'Robotics National Winner', p: 'IISc Bangalore, 2015' },
  { h: 'M.Eng, Penn State', p: 'Computer Science & Engineering — ML and computer vision, 2015–16' },
]

export default function EngineeringV3() {
  return (
    <main className="v3">
      <VersionSwitch current={3} />

      <div className="v3-wrap">
        <div className="v3-bar v3-mono">
          <span>Rutvij Dhotey — engineering</span>
          <nav aria-label="Sections">
            <a href="#modes">01 / Modes</a>
            <a href="#scale">02 / Scale</a>
            <a href="#record">03 / Record</a>
            <a href="mailto:rutvij.dhotey@gmail.com">Contact</a>
          </nav>
        </div>

        <header className="v3-hero">
          <h1 className="v3-h1">
            The same craft, pointed in <em>opposite</em> directions.
          </h1>
          <dl className="v3-spec">
            <div>
              <dt className="v3-mono">Role</dt>
              <dd>Software Engineer, YouTube</dd>
            </div>
            <div>
              <dt className="v3-mono">Discipline</dt>
              <dd>Backend · Agentic AI</dd>
            </div>
            <div>
              <dt className="v3-mono">Since</dt>
              <dd>2017</dd>
            </div>
            <div>
              <dt className="v3-mono">Based</dt>
              <dd>Bay Area, California</dd>
            </div>
          </dl>
        </header>

        <section id="modes" className="v3-section v3-reveal">
          <div className="v3-shead">
            <span className="v3-mono v3-num">01</span>
            <h2 className="v3-h2">Two modes of agentic AI</h2>
          </div>
          <p className="v3-say">
            Most AI work gets described by the models it calls. That says almost nothing.
            What actually decides how a system is built is <strong>where the human
            sits</strong> — outside the loop entirely, or inside every turn of it. I have
            built one of each, and they came out as different animals.
          </p>

          <div className="v3-axis">
            <svg className="v3-axis-svg" viewBox="0 0 1000 86" role="img" aria-label="An axis of autonomy: Notebound sits at the human-in-the-loop end, LaCuriosity at the fully autonomous end.">
              <line x1="8" y1="54" x2="992" y2="54" stroke="rgb(237 237 240 / 0.18)" strokeWidth="1" />
              <line x1="8" y1="46" x2="8" y2="62" stroke="rgb(237 237 240 / 0.3)" strokeWidth="1" />
              <line x1="992" y1="46" x2="992" y2="62" stroke="rgb(237 237 240 / 0.3)" strokeWidth="1" />
              <line x1="500" y1="49" x2="500" y2="59" stroke="rgb(237 237 240 / 0.16)" strokeWidth="1" />

              <circle cx="208" cy="54" r="7" fill="#7fd1c1" />
              <text className="v3-axis-label" x="208" y="30" textAnchor="middle">Notebound</text>

              <circle cx="940" cy="54" r="7" fill="#ededf0" />
              <text className="v3-axis-label" x="940" y="30" textAnchor="middle">LaCuriosity</text>
            </svg>
            <div className="v3-axis-ends v3-mono">
              <span>Human in every turn</span>
              <span>No human at all</span>
            </div>
          </div>

          <div className="v3-modes">
            <article className="v3-mode">
              <p className="v3-mode-kind v3-mono">Mode A — embedded</p>
              <h3>Notebound</h3>
              <p>
                An iOS app that turns a trip&rsquo;s photos, notes and voice into a written
                story and a mapped, day-by-day itinerary. The person is the author; the
                models are the assistants. Every output is something they can overrule.
              </p>
              <div className="v3-flow" aria-label="Pipeline: human speaks, Haiku classifies, Opus writes, human edits">
                <span className="v3-step v3-step--human">Human speaks</span>
                <span className="v3-arrow" aria-hidden="true">→</span>
                <span className="v3-step">Haiku tags</span>
                <span className="v3-arrow" aria-hidden="true">→</span>
                <span className="v3-step">Opus writes</span>
                <span className="v3-arrow" aria-hidden="true">→</span>
                <span className="v3-step v3-step--human">Human edits</span>
              </div>
              <p>
                That constraint drove everything: offline-first capture, because trips lose
                signal, and a test suite big enough to trust a pipeline you cannot watch.
              </p>
              <div className="v3-mode-facts">
                <div>
                  <div className="v3-fn">289</div>
                  <div className="v3-fl">Tests passing</div>
                </div>
                <div>
                  <div className="v3-fn">3</div>
                  <div className="v3-fl">Claude models</div>
                </div>
                <div>
                  <div className="v3-fn">100%</div>
                  <div className="v3-fl">Offline capture</div>
                </div>
              </div>
              <Link className="v3-go" href="/engineering/notebound">Read the case study →</Link>
            </article>

            <article className="v3-mode">
              <p className="v3-mode-kind v3-mono">Mode B — autonomous</p>
              <h3>LaCuriosity</h3>
              <p>
                A publication across five thematic streams that researches, writes,
                illustrates, narrates and ships itself every day. Nobody approves anything.
                The only human decision was made once, in the design of the pipeline.
              </p>
              <div className="v3-flow" aria-label="Pipeline: trigger, research, draft, fact-check, publish">
                <span className="v3-step">Daily trigger</span>
                <span className="v3-arrow" aria-hidden="true">→</span>
                <span className="v3-step">Research</span>
                <span className="v3-arrow" aria-hidden="true">→</span>
                <span className="v3-step">Draft</span>
                <span className="v3-arrow" aria-hidden="true">→</span>
                <span className="v3-step">Fact-check</span>
                <span className="v3-arrow" aria-hidden="true">→</span>
                <span className="v3-step">Publish</span>
              </div>
              <p>
                With no reviewer, correctness has to be structural — agents that check each
                other, and a failure mode that stops rather than publishes.
              </p>
              <div className="v3-mode-facts">
                <div>
                  <div className="v3-fn">55</div>
                  <div className="v3-fl">Automation nodes</div>
                </div>
                <div>
                  <div className="v3-fn">5</div>
                  <div className="v3-fl">Editorial streams</div>
                </div>
                <div>
                  <div className="v3-fn">0</div>
                  <div className="v3-fl">Human touchpoints</div>
                </div>
              </div>
              <a className="v3-go" href="https://lacuriosity.com" target="_blank" rel="noopener">Visit the site ↗</a>
            </article>
          </div>
        </section>

        <section id="scale" className="v3-section v3-reveal">
          <div className="v3-shead">
            <span className="v3-mono v3-num">02</span>
            <h2 className="v3-h2">Where the habits came from</h2>
          </div>
          <p className="v3-say" style={{ marginBottom: 44 }}>
            Nine years of backend work, six of them at YouTube. At that scale the happy
            path is never the problem — the rare case is the whole job.
          </p>
          {LEDGER.map((r) => (
            <div className="v3-row" key={r.company}>
              <h3>{r.company}</h3>
              <p><b>{r.title}</b>{r.what}</p>
              <span className="v3-mono">{r.when}</span>
            </div>
          ))}
        </section>

        <section id="record" className="v3-section v3-reveal">
          <div className="v3-shead">
            <span className="v3-mono v3-num">03</span>
            <h2 className="v3-h2">On the record</h2>
          </div>
          <div className="v3-record">
            {RECORD.map((r) => (
              <div key={r.h}>
                <h4>{r.h}</h4>
                <p>{r.p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="v3-end">
          <p className="v3-mono">Open to conversations</p>
          <a className="v3-mail" href="mailto:rutvij.dhotey@gmail.com">rutvij.dhotey@gmail.com</a>
          <div className="v3-end-links">
            <a href="https://linkedin.com/in/rutvij-dhotey" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://github.com/rutvijdhotey" target="_blank" rel="noopener">GitHub</a>
            <Link href="/">Photography</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
