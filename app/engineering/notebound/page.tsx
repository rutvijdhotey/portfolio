import type { Metadata } from 'next'
import CaseNav from '@/components/engineering/CaseNav'
import { CaseImage, CaseVideo } from '@/components/engineering/CaseMedia'
import { CaseFoot, CaseNext, CaseStats } from '@/components/engineering/CaseParts'
import { PhoneMock } from '@/components/engineering/ProjectShowcase'
import { Icon } from '@/components/engineering/marks'
import '../engineering.css'
import '../case-study.css'

export const metadata: Metadata = {
  title: 'Notebound',
  description: 'Case study: an iOS app that turns a trip’s photos, notes and voice into a written story and a mapped itinerary.',
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'design', label: 'Design' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'demo', label: 'Demo' },
] as const

const CODE = 'https://github.com/rutvijdhotey/notebound'

const SHOTS = [
  { key: 'notebound/capture', cap: 'Voice-first capture — hold to record, or type; auto-tagged by category.' },
  { key: 'notebound/feed', cap: 'Trip feed — notes with categories, locations, and a map toggle.' },
  { key: 'notebound/story', cap: 'The generated story — narrative written from your notes and photos.' },
  { key: 'notebound/itinerary', cap: 'Itinerary view — a day-by-day plan with a category-pinned map.' },
]

const FEATURES = [
  { h: 'Voice → intent capture', p: 'Hold to record. A transcript is classified by a Claude Haiku function into the right kind of note and auto-tagged — food, stay, activity — with location attached.' },
  { h: 'Multimodal photo curation', p: 'Claude Opus actually looks at the photos (downsized to base64 for vision), judges the strongest few per note, and picks a cover — never one-per-note padding.' },
  { h: 'Auto-itinerary with map', p: 'In the same generation call, the model emits a structured day-by-day itinerary with coordinates, rendered as morning/afternoon cards over a category-pinned map.' },
  { h: 'Offline-first capture & sync', p: 'Notes and photos capture with no signal and drain through upload/offline queues when connectivity returns. Generation status streams back over Supabase realtime.' },
  { h: 'EXIF & trip-aware location', p: 'Dates come from photo EXIF; a GPS fix is validated against the trip’s anchors, inferring the nearest known city when a reading is implausible.' },
  { h: 'Readiness gates', p: 'A free local gate blocks thin trips instantly; a server-side LLM gate returns an honest “not enough notes” state rather than fabricating a story.' },
]

const TRADEOFFS = [
  { h: 'Model selection', p: 'Haiku for classification/tagging keeps per-note cost near zero; Opus is reserved for the one creative, multimodal call that actually warrants it.' },
  { h: 'Vision without blowing the budget', p: 'Photos are downsized to ~1536px and base64-encoded just for the model’s eyes; the blog always embeds the original full-res URLs.' },
  { h: 'Supplementary, never fatal', p: 'A malformed itinerary stores null but the narrative still saves — one feature failing never blocks the core output.' },
  { h: 'Reliability backstop', p: 'A pg_cron job marks any run stuck “generating” past 5 minutes as errored, so the client never spins forever.' },
]

export default function NoteboundPage() {
  return (
    <main className="eng">
      <CaseNav sections={SECTIONS} />

      <div className="eng-wrap">
        <section className="cs-hero" id="overview" aria-labelledby="h-top">
          <div>
            <p className="cs-kick">Case study · Mobile + AI · 2026</p>
            <h1 className="cs-title" id="h-top">Notebound.</h1>
            <p className="cs-lede">
              An iOS app that turns a trip&apos;s photos, notes, and voice into a written story
              and a mapped, day-by-day itinerary — powered by a multi-model Claude pipeline,
              built offline-first.
            </p>
            <div className="eng-pills">
              <a className="eng-pill cs-pill-inv" href="#demo">Watch demo <Icon name="arrow-down" size={16} /></a>
              <a className="eng-pill" href={CODE} target="_blank" rel="noopener">View code <Icon name="arrow-up-right" size={16} /></a>
            </div>
          </div>
          <div className="cs-tile" aria-hidden="true">
            <div className="eng-shot eng-shot--phone"><PhoneMock /></div>
          </div>
        </section>

        <CaseStats stats={[
          { value: '3', label: 'Claude models' },
          { value: '289', label: 'Tests passing' },
          { value: '100%', label: 'Offline-first capture' },
        ]} />

        <section className="eng-sec" id="design" aria-labelledby="h-design">
          <h2 className="eng-h" id="h-design">Design.</h2>
          <p className="cs-lead">A calm, voice-first capture experience.</p>
          <p className="eng-sub cs-sub">
            Travel is messy and hands-busy, so capture had to be effortless: hold to speak,
            or jot a line, tag it, and move on. The aesthetic is warm and quiet — the photos
            carry the color, the UI gets out of the way.
          </p>
          <div className="cs-shots">
            {SHOTS.map((s) => (
              <figure className="cs-shot" key={s.key}>
                <div className="cs-phone">
                  <CaseImage assetKey={s.key} alt={s.cap} sizes="(min-width: 900px) 260px, 45vw" />
                </div>
                <figcaption>{s.cap}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="eng-sec" id="features" aria-labelledby="h-features">
          <h2 className="eng-h" id="h-features">Features.</h2>
          <p className="eng-sub cs-sub">From a spoken note to a published story.</p>
          <ul className="cs-cards cs-cards--3">
            {FEATURES.map((f) => (
              <li className="eng-fc" key={f.h}>
                <div><h3 className="cs-fc-h">{f.h}</h3><p>{f.p}</p></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="eng-sec" id="architecture" aria-labelledby="h-arch">
          <h2 className="eng-h" id="h-arch">Architecture.</h2>
          <p className="cs-lead">One generation call, the right model for each job.</p>
          <p className="eng-sub cs-sub">
            A React Native client talks to Supabase. Three Deno edge functions front Claude:
            cheap, fast Haiku for classification and tagging; Opus for the multimodal heavy
            lift. Reliability is defended server-side with a pg_cron sweep.
          </p>
          <div className="cs-panel cs-scroll">
            <ArchitectureDiagram />
          </div>
          <ul className="cs-cards">
            {TRADEOFFS.map((t) => (
              <li className="eng-fc" key={t.h}>
                <div><h3 className="cs-fc-h">{t.h}</h3><p>{t.p}</p></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="eng-sec" id="demo" aria-labelledby="h-demo">
          <h2 className="eng-h" id="h-demo">Demo.</h2>
          <p className="eng-sub cs-sub">See it run.</p>
          <div className="cs-panel">
            <CaseVideo assetKey="notebound/demo" label="Notebound demo" className="cs-video" />
          </div>
        </section>

        <section className="eng-sec" id="practice" aria-labelledby="h-practice">
          <h2 className="eng-h" id="h-practice">Practice.</h2>
          <p className="cs-lead">Shipped with discipline.</p>
          <p className="eng-sub cs-sub">
            Built spec → plan → task-by-task with review at each step. 289 tests, TypeScript
            clean, migrations verified live against Supabase before merge. Edge functions
            versioned and redeployed per change.
          </p>
          <p className="cs-note">
            Built with the help of Claude Code — the same AI-augmented workflow I use to move
            fast without giving up rigor.
          </p>
        </section>

        <CaseNext href="/engineering/lacuriosity" name="LaCuriosity" />
        <CaseFoot />
      </div>
    </main>
  )
}

/* Redrawn from the old page in theme tokens, so it reads in both themes. */
function ArchitectureDiagram() {
  const rows = [130, 230, 330]
  return (
    <svg viewBox="0 0 900 460" role="img" aria-label="Notebound system architecture: the React Native app's capture, offline queues and realtime status talk to three Supabase edge functions (detect-intent, tag-note, generate-blog), which call Claude Haiku 4.5 for intent and tags and Claude Opus 4.8 for the multimodal story, over Postgres with a pg_cron stale-sweep.">
      <defs>
        <marker id="nb-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" fill="var(--mu)" />
        </marker>
      </defs>
      <g stroke="var(--mu)" strokeWidth="1.5" fill="none" markerEnd="url(#nb-arrow)" opacity="0.7">
        {rows.map((y) => <line key={`a${y}`} x1="190" y1={y} x2="326" y2={y} />)}
        {rows.map((y) => <line key={`b${y}`} x1="560" y1={y} x2="686" y2={y} />)}
      </g>
      <Column x={30} w={160} cap="React Native · Expo" nodes={['Voice / Text capture', 'Offline + upload queues', 'Realtime status']} />
      <Column x={330} w={230} cap="Supabase · Edge Functions (Deno)" nodes={['detect-intent', 'tag-note', 'generate-blog']} accent />
      <Column x={690} w={180} cap="Claude" nodes={['Haiku 4.5 · intent', 'Haiku 4.5 · tags', 'Opus 4.8 · multimodal']} />
      <rect x="330" y="400" width="540" height="42" rx="10" fill="var(--in)" stroke="var(--bd)" />
      <text x="600" y="426" textAnchor="middle" className="cs-d-node">Postgres (notes · trips · blog_posts · itinerary jsonb) · pg_cron stale-sweep</text>
    </svg>
  )
}

function Column({ x, w, cap, nodes, accent = false }: { x: number; w: number; cap: string; nodes: string[]; accent?: boolean }) {
  const cx = x + w / 2
  return (
    <g>
      <rect x={x} y="90" width={w} height="280" rx="14" fill={accent ? 'var(--tile)' : 'var(--in)'} stroke={accent ? 'var(--clay)' : 'var(--bd)'} />
      <text x={cx} y="78" textAnchor="middle" className="cs-d-cap">{cap}</text>
      {nodes.map((n, i) => <text key={n} x={cx} y={134 + i * 100} textAnchor="middle" className="cs-d-node">{n}</text>)}
    </g>
  )
}
