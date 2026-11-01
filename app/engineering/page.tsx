import Portrait from '@/components/engineering/Portrait'
import PillNav from '@/components/engineering/PillNav'
import ScrollRail from '@/components/engineering/ScrollRail'
import EdgeMasks from '@/components/engineering/EdgeMasks'
import Intro from '@/components/engineering/Intro'
import HeroScene from '@/components/engineering/HeroScene'
import HeroRoles from '@/components/engineering/HeroRoles'
import ExperienceSwitcher from '@/components/engineering/ExperienceSwitcher'
import Works from '@/components/engineering/Works'
import StackGrid from '@/components/engineering/StackGrid'
import { Icon } from '@/components/engineering/marks'
import { EMAIL, LINKS } from '@/lib/profile'
import './engineering.css'

/* /engineering. A static page: the server renders every section finished and
   visible, and the client components only add motion and switching on top.
   The timeline's "now" is the build month, so a static export draws the same
   bars on the server and in the browser. */
export default function EngineeringPage() {
  const d = new Date()
  const now = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

  return (
    <main className="eng">
      <Intro />
      <PillNav />
      <ScrollRail />
      <EdgeMasks />

      <HeroScene>
        <div className="eng-wrap eng-hero">
          <div>
            <HeroRoles />
            <div className="eng-pills">
              {/* The lake: a wave of water along the bottom, tinted by the
                  season. Pressing fills the button. */}
              <a className="eng-pill eng-pill--solid eng-pill--lake" href="#experience">
                <span className="eng-liq" aria-hidden="true">
                  <svg viewBox="0 0 240 24" preserveAspectRatio="none">
                    <path d="M0 12C20 2 40 2 60 12s40 10 60 0 40-10 60 0 40 10 60 0v12H0Z" fill="currentColor" />
                  </svg>
                </span>
                <span className="eng-pill-label">About me</span>
              </a>
              <a className="eng-pill" href="#works">See my work <Icon name="arrow-up-right" size={16} /></a>
            </div>
          </div>

          <Portrait className="eng-portrait" />

          <div className="eng-hello">
            <p>Hi, I&rsquo;m Rutvij</p>
            <p className="eng-lede">I build systems that run themselves</p>
            <p>Backend engineering at YouTube on the Shorts creation platform, at billions-of-requests scale.</p>
            <p className="eng-lede">Autonomous pipelines and embedded intelligence</p>
            <p>One trigger fires and a chain of models research, draft, fact-check and publish. Or the intelligence lives inside a product someone holds.</p>
          </div>
        </div>
      </HeroScene>

      <div className="eng-wrap">
        <section className="eng-sec" id="experience" aria-labelledby="h-experience">
          <h2 className="eng-h" id="h-experience">Experience.</h2>
          <p className="eng-sub">Pick a company for the details, or read the whole line.</p>
          <ExperienceSwitcher now={now} />
        </section>

        <section className="eng-sec" id="works" aria-labelledby="h-works">
          <h2 className="eng-h" id="h-works">Works.</h2>
          <Works />
        </section>

        <section className="eng-sec" id="stack" aria-labelledby="h-stack">
          <h2 className="eng-h" id="h-stack">Stack.</h2>
          <p className="eng-sub">What I build with at work, and on the side.</p>
          <StackGrid />
        </section>

        <figure className="eng-quote">
          <blockquote>
            <p>Build something that sparks an emotion, only then will it be real!</p>
          </blockquote>
          <figcaption>— Someone wise!</figcaption>
        </figure>

        <section className="eng-sec eng-contact" id="contact" aria-labelledby="h-contact">
          <h2 className="eng-ask" id="h-contact">Ask me anything</h2>
          <a className="eng-mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <div className="eng-pills">
            {LINKS.map((l) => (
              <a key={l.label} className="eng-pill" href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>
                {l.label}
              </a>
            ))}
          </div>
          <p className="eng-foot">
            © {d.getFullYear()} Rutvij Dhotey · Design referenced from{' '}
            <a href="https://www.poulo.site" target="_blank" rel="noopener">poulo.site</a>
          </p>
        </section>
      </div>
    </main>
  )
}
