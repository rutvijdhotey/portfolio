import type { Metadata } from 'next'
import CaseNav from '@/components/engineering/CaseNav'
import { CaseImage, fullSizeHref } from '@/components/engineering/CaseMedia'
import { CaseFoot, CaseNext, CaseStats } from '@/components/engineering/CaseParts'
import { SiteMock } from '@/components/engineering/ProjectShowcase'
import { Icon } from '@/components/engineering/marks'
import '../engineering.css'
import '../case-study.css'

export const metadata: Metadata = {
  title: 'LaCuriosity',
  description: 'Case study: a fully automated editorial platform that researches, writes, illustrates and publishes daily across five streams.',
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'pipeline', label: 'Pipeline' },
] as const

const SITE = 'https://lacuriosity.com'
const TAGS = ['Claude API', 'Gemini API', 'Make.com', 'Ghost CMS', 'Supabase', 'ElevenLabs', 'Prompt Engineering']
const PIPELINE = 'lacuriosity/pipeline'

/* Copy is the old /engineering page's LaCuriosity feature, unchanged
   (git show 4c989c7^:app/engineering/page.tsx). */
export default function LaCuriosityPage() {
  return (
    <main className="eng">
      <CaseNav sections={SECTIONS} />

      <div className="eng-wrap">
        <section className="cs-hero" id="overview" aria-labelledby="h-top">
          <div>
            <p className="cs-kick">Case study · Agentic AI · 2026</p>
            <h1 className="cs-title" id="h-top">LaCuriosity.</h1>
            <p className="cs-lede">
              A fully automated editorial platform publishing daily long-form articles across five
              thematic streams — Science, Psychology, Technology, Mathematics, and Ecology — each
              driven by a specialized Claude instance with its own persona, research mandate,
              and visual identity.
            </p>
            <p className="cs-lede">
              The pipeline handles everything without human intervention: demand-signal research via
              Tavily and Reddit, multi-agent drafting and fact-checking, Risograph-style image
              generation with Gemini, voiceover via ElevenLabs, video assembly via Creatomate, and
              distribution through Ghost CMS, email, and social. One daily trigger. Fifty-five nodes.
              Zero human touchpoints.
            </p>
            <div className="eng-pills">
              <a className="eng-pill cs-pill-inv" href={SITE} target="_blank" rel="noopener">
                Visit lacuriosity.com <Icon name="arrow-up-right" size={16} />
              </a>
              <a className="eng-pill" href="#pipeline">See the pipeline <Icon name="arrow-down" size={16} /></a>
            </div>
          </div>
          <div className="cs-tile" aria-hidden="true">
            <div className="eng-shot eng-shot--site"><SiteMock /></div>
          </div>
        </section>

        <CaseStats stats={[
          { value: '5', label: 'Editorial streams' },
          { value: '55', label: 'Automation nodes' },
          { value: '0', label: 'Human touchpoints' },
        ]} />
        <ul className="cs-tags" aria-label="Built with">
          {TAGS.map((t) => <li key={t}>{t}</li>)}
        </ul>

        <section className="eng-sec" id="pipeline" aria-labelledby="h-pipeline">
          <h2 className="eng-h" id="h-pipeline">Pipeline.</h2>
          <p className="eng-sub cs-sub cs-meta">Make.com · 55 nodes · 1 daily trigger</p>
          <div className="cs-panel">
            <a className="cs-figure" href={fullSizeHref(PIPELINE)} target="_blank" rel="noopener">
              <CaseImage
                assetKey={PIPELINE}
                alt="LaCuriosity pipeline architecture: the Make.com scenario, 55 nodes from one daily trigger to publishing."
                sizes="(min-width: 1180px) 1000px, 92vw"
              />
            </a>
            <p className="cs-figure-note">
              <a href={fullSizeHref(PIPELINE)} target="_blank" rel="noopener">Open the full-size diagram</a>
            </p>
          </div>
        </section>

        <CaseNext href="/engineering/notebound" name="Notebound" />
        <CaseFoot />
      </div>
    </main>
  )
}
