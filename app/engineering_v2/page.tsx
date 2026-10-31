import Link from 'next/link'
import VersionSwitch from '@/components/VersionSwitch'
import './v2.css'

const JOBS = [
  {
    company: 'YouTube',
    when: 'Apr 2020 — present',
    title: 'Software Engineer · Shorts creation platform',
    what: 'Backend engineering on the Shorts creation platform: distributed systems at billions-of-requests scale, cross-team launches, and mentoring engineers.',
  },
  {
    company: 'eBay',
    when: 'Apr 2018 — Apr 2020',
    title: 'Software Engineer · Marketplace',
    what: 'Backend services and machine learning for marketplace ranking and listing pricing.',
  },
  {
    company: 'NetApp',
    when: 'Feb 2017 — Apr 2018',
    title: 'Member of Technical Staff · Data protection',
    what: 'Data-protection features and REST APIs for VMware backup and restore.',
  },
]

export default function EngineeringV2() {
  return (
    <main className="v2">
      <VersionSwitch current={2} />

      <div className="v2-wrap">
        <div className="v2-top">
          <span className="v2-name">Rutvij Dhotey</span>
          <div className="v2-top-links">
            <a href="mailto:rutvij.dhotey@gmail.com">Email</a>
            <a href="https://linkedin.com/in/rutvij-dhotey" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://github.com/rutvijdhotey" target="_blank" rel="noopener">GitHub</a>
            <Link href="/">Photography</Link>
          </div>
        </div>

        <header className="v2-head">
          <p className="v2-role">Software Engineer · San Francisco Bay Area</p>
          <h1 className="v2-h1">Backend systems at the scale where the edge cases are the job.</h1>
          <p className="v2-lede">
            Nine years building the services underneath products people use every day —
            six of them at <strong>YouTube</strong>, on the creation platform behind Shorts.
            Outside work I build agentic AI systems end to end, which is where the
            engineering and the design stop being separate things.
          </p>
        </header>

        <dl className="v2-glance">
          <div>
            <dt>Experience</dt>
            <dd>9 years</dd>
          </div>
          <div>
            <dt>Current scale</dt>
            <dd>Billions / day</dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>Backend &amp; AI</dd>
          </div>
          <div>
            <dt>Patent</dt>
            <dd>1 filed</dd>
          </div>
        </dl>

        <section className="v2-section">
          <h2 className="v2-h2">Experience</h2>
          {JOBS.map((j) => (
            <div className="v2-job" key={j.company}>
              <div className="v2-job-top">
                <h3>{j.company}</h3>
                <span className="v2-job-when">{j.when}</span>
              </div>
              <p className="v2-job-title">{j.title}</p>
              <p>{j.what}</p>
            </div>
          ))}
        </section>

        <section className="v2-section">
          <h2 className="v2-h2">Selected projects</h2>
          <div className="v2-projects">
            <article className="v2-proj">
              <h3>LaCuriosity</h3>
              <p className="v2-proj-kind">Autonomous editorial platform</p>
              <p>
                A publication that researches, writes, illustrates, narrates and
                distributes itself daily across five thematic streams. Each stream runs a
                specialized Claude instance with its own persona and research mandate.
                One trigger a day, no human in the loop.
              </p>
              <div className="v2-proj-facts">
                <div>
                  <div className="v2-fact-n">55</div>
                  <div className="v2-fact-l">Automation nodes</div>
                </div>
                <div>
                  <div className="v2-fact-n">5</div>
                  <div className="v2-fact-l">Streams</div>
                </div>
                <div>
                  <div className="v2-fact-n">0</div>
                  <div className="v2-fact-l">Touchpoints</div>
                </div>
              </div>
              <a className="v2-proj-link" href="https://lacuriosity.com" target="_blank" rel="noopener">
                lacuriosity.com →
              </a>
            </article>

            <article className="v2-proj">
              <h3>Notebound</h3>
              <p className="v2-proj-kind">iOS app · multimodal AI</p>
              <p>
                Turns a trip&rsquo;s photos, notes and voice into a written story and a
                mapped itinerary. Voice-first and offline-first capture; a multi-model
                pipeline classifies intent, reads the photographs and emits a structured
                itinerary with coordinates.
              </p>
              <div className="v2-proj-facts">
                <div>
                  <div className="v2-fact-n">289</div>
                  <div className="v2-fact-l">Tests passing</div>
                </div>
                <div>
                  <div className="v2-fact-n">3</div>
                  <div className="v2-fact-l">Models</div>
                </div>
                <div>
                  <div className="v2-fact-n">100%</div>
                  <div className="v2-fact-l">Offline capture</div>
                </div>
              </div>
              <Link className="v2-proj-link" href="/engineering/notebound">
                Read the case study →
              </Link>
            </article>
          </div>
        </section>

        <section className="v2-section">
          <h2 className="v2-h2">What I work in</h2>
          <div className="v2-skills">
            <div>
              <h3>Backend &amp; distributed systems</h3>
              <p>Service design, queueing and throughput, API design, data protection, cross-team launches at scale.</p>
            </div>
            <div>
              <h3>Machine learning</h3>
              <p>Ranking and pricing models in production, multi-agent orchestration, multimodal LLM pipelines, prompt and tool design.</p>
            </div>
            <div>
              <h3>Product engineering</h3>
              <p>TypeScript, React Native and Expo, Supabase and edge functions, offline-first mobile architecture.</p>
            </div>
          </div>
        </section>

        <section className="v2-section">
          <h2 className="v2-h2">Education &amp; recognition</h2>
          <div className="v2-cred">
            <div>
              <div className="v2-item">
                <h4>Pennsylvania State University</h4>
                <p>M.Eng, Computer Science &amp; Engineering · 2015–2016<br />Machine learning and computer vision</p>
              </div>
              <div className="v2-item">
                <h4>Pune Institute of Computer Technology</h4>
                <p>B.E, Electrical &amp; Electronics Engineering · 2011–2015<br />Embedded systems and RTOS</p>
              </div>
            </div>
            <div>
              <div className="v2-item">
                <h4>US Patent — &ldquo;Verified Video Reviews&rdquo;</h4>
                <p>US 20210158371, filed 2019</p>
              </div>
              <div className="v2-item">
                <h4>Google Developer Challenge Scholarship</h4>
                <p>Selected from 100,000+ applicants, 2018</p>
              </div>
              <div className="v2-item">
                <h4>Robotics National Winner</h4>
                <p>IISc Bangalore, 2015</p>
              </div>
            </div>
          </div>
        </section>

        <section className="v2-contact">
          <p className="v2-role">Open to conversations</p>
          <a className="v2-mail" href="mailto:rutvij.dhotey@gmail.com">rutvij.dhotey@gmail.com</a>
        </section>
      </div>
    </main>
  )
}
