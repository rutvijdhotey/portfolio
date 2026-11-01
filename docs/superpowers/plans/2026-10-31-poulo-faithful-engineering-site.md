# poulo.site-Faithful Engineering Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/engineering` so it looks and behaves as close to https://www.poulo.site/ as original code allows: intro loader, scene-changing pinned hero with cycling roles, floating pill nav with a circular theme reveal, filterable "Works", and scroll reveals, with no content ever hidden behind JavaScript.

**Architecture:** Promote the existing `/engineering_v1` study (already the closest take: TikTok Sans, IBM Plex Mono, pill nav, filter chips) to `/engineering`, then add the interactions it lacks as small client components under `components/engineering/`. All scroll logic is pure functions in `lib/` with `node --test` coverage; components only read the DOM and feed numbers in. Every animated state defaults to "finished and visible", so JS off, reduced motion, and phones degrade to a complete static page.

**Tech Stack:** Next.js 16.2.4 (App Router, `output: 'export'`), React 19.2.4, TypeScript, plain CSS (custom properties, `animation-timeline: view()`), `next/font/google`, `node --test` for `lib/` tests. No new dependencies.

---

## Revision A (after Rutvij's feedback on the preview): read before executing anything below

Rutvij reviewed the first preview and gave seven corrections. A second, browser-tested preview
that includes all of them is saved at `docs/rebuild/preview/engineering-preview-v2.html`; treat
it as the visual spec. The tasks below were written **before** that feedback. **Tasks 1-3
(`lib/scene.ts`, `lib/stars.ts`, `lib/projects.ts` + `lib/profile.ts`) remain valid.** Everything else
changes as follows. Rewrite the affected tasks (with full code, per the writing-plans rules) once
the portrait is approved; do not execute them as written.

| Area | Change |
|---|---|
| Theme | The hero is **not** always dark. Scene colours, star colour, cloud and sun tints are per theme (values are in the preview's `#app` and `#app.lt` blocks and its `COLS` table). One switch drives hero, nav, cards, mockups. Task 6's "hero re-scopes dark variables" and Task 8's "hero stays dark" are void. A theme reader must use `useSyncExternalStore` on `<html data-theme>`, not setState-in-effect (the repo already has 2 lint errors of that kind; add none). |
| Portrait | Replace `CursorPortrait.tsx` with a new `Portrait` client component drawn from `docs/rebuild/reference/portrait-reference.png` (see REBUILD_PROGRESS Session 4 for what the photo shows). Keep: sticker outline, flat fills, pupils that follow the cursor, content visible with JS off. Fix v2's faults: medium-brown skin, moustache plus stubble rather than a full beard, teeth smile, hair with a swept front. Outfit is an open question. Rutvij's uncommitted `CursorPortrait.tsx` edit stays until he decides. **Session 5: done.** `components/engineering/Portrait.tsx` is built (a simple monochrome outline, not the cartoon described here) and `CursorPortrait.tsx` is deleted; wherever a task below imports `CursorPortrait`, use `Portrait` instead, and drop it from Task 0's expected status and Task 8's commit. |
| Scroll rail | **New** `components/engineering/ScrollRail.tsx`: five dashes (Home, Experience, Works, Stack, Ask me anything), the active one long and bright, name pill on hover/focus only, click jumps to the section, bottom of page activates the last dash. Active section via IntersectionObserver in the real build. |
| Experience | **New** `components/engineering/ExperienceSwitcher.tsx` plus pure `lib/experience.ts`: `timelineSegments(experience, totalMonths)` (segment left/width as percentages of months, chronological) and `toggleSelection(current, next)` (selecting the selected company, or "Overview", clears it). Test both first. With nothing selected it shows the proportional timeline (NetApp 0-14 months, eBay 14-38, YouTube 38-116 of 116); with a company selected it shows that company's title, dates, approved one-sentence summary and domain tag (Video, Marketplace, Storage). Add `tag` and month offsets to `lib/profile.ts`. |
| Projects | Task 7's `Works`/`ProjectCard` become `ProjectShowcase`: poulo's block layout (framed UI mockup + chat-bubble pill + title row on the left, summary + role + CTA pill on the right, four feature cards below). LaCuriosity gets a browser-frame site mock; Notebound a phone mock. Feature-card copy is limited to facts already in the approved text. Extend `Project` in `lib/projects.ts` with `features: {icon, title, text}[]` and a `mock: 'site' \| 'phone'` field, and extend its tests. |
| Stack | **New** `components/engineering/StackGrid.tsx`. SSR cannot detect an icon font, so the real build uses inline SVG marks where licensing allows and a dashed monogram tile otherwise (Claude, Make.com, ElevenLabs had no Tabler icon). eBay and NetApp marks: inline official SVGs or text marks, Rutvij to decide. |
| Edge masks | Top and bottom fades fade in **only after the hero scrolls away** (in the preview: opacity from `(scrollTop-(heroH-paneH)+40)/120`), because over the hero they would mismatch the scene colour. |
| Colour | Neutrals plus one accent (clay `#d98b5a`, D2 still open). Project tiles are the clay tinted 24% into the card colour. |
| Preview-only | The inner scroll pane, the instant theme swap and the "Play tour" button exist only in the preview. The real page scrolls the window and uses the circular View Transitions reveal. |

Execution status when this was written: Task 0 done; Task 1 implemented by a subagent (8/8 tests,
`tsc` clean) and **awaiting spec and quality review**; nothing committed; no commits until
Rutvij says so.

---

## Read this before executing

1. **`AGENTS.md` warns this Next.js has breaking changes.** Before Task 8, skim `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`. Nothing in this plan uses an experimental Next flag.
2. **Scope.** This plan covers the `/engineering` landing page only. Deliberately *not* here (each is its own plan): self-hosting Supabase images (REBUILD_PROGRESS D5), the `/engineering/notebound` and `/engineering/lacuriosity` pages, the photography routes, and GSAP removal. **GSAP stays in `package.json`:** `app/engineering/notebound/page.tsx` and `components/OverlayViewer.tsx` still import it.
3. **Assumption to confirm:** "our site" = the standalone engineering site (the `/engineering_v1` study, promoted). If you meant the photography site too, say so and this becomes two plans.
4. **This overrides one line of `docs/rebuild/DESIGN_PLAN.md`.** That doc said not to take poulo's pinned hero. The latest instruction is "as close as possible", so we take it, bounded: ~1.6 viewports of pinned travel (poulo's is ~3.4), desktop only, a visible "Skip intro" link, bypassed under reduced motion, content visible by default.
5. **Pre-existing uncommitted work:** `components/CursorPortrait.tsx` has an uncommitted redraw (Rutvij's portrait). Do not discard it. It ships in Task 8's commit. `.claude/` and the two `docs/superpowers/*2026-06-2x*` files are untracked and stay untracked.
6. **Commit steps run only when the user says to commit.**
7. All commands run from the repo root:
   `cd "/Users/rutvijdhotey/Documents/Personal Projects/Photo Video Website"`

## What poulo.site does, and what we do about it

Read in a real browser on 2026-10-31. "Measured" = read from the live page's CSS/DOM. "Observed" = seen in screenshots only. Timings and easings of poulo's scroll-linked effects were **not** measured; ours are original values tuned by eye.

| poulo.site behaviour | Evidence | Our implementation | Task |
|---|---|---|---|
| Intro loader: isometric line-art keyboard + progress bar + "Loading", with a `site-loader-failsafe` keyframe that force-hides it | Observed; keyframe name measured | Line-art **camera** draws itself (stroke-dashoffset), CSS-only bar, CSS failsafe, first visit per session only | 5 |
| Hero background changes as you scroll: starfield canvas → drifting clouds → sun/light rays | Observed; keyframes `hero-cloud-drift`, `hero-sun-breathe` measured; two full-viewport canvases measured | Pinned stage, three cross-faded layers: canvas stars, CSS clouds, CSS sun | 6 |
| Hero role text cycles ("Seasoned UX Designer" → "Experienced Product Manager" …) with a blur/rise/scale vapor transition | Observed; keyframes `vapor-in`, `vapor-out` measured | Three stacked role spans, scroll-linked blur/translate/scale from per-scene weights | 6 |
| Fixed floating pill nav: 5 icon buttons, a round theme button, a filled CTA pill; active section highlighted | Observed | Same three bubbles, IntersectionObserver active state | 4 |
| Theme toggle reveals the new theme as an expanding circle (`theme-reveal` keyframe on a custom property) | Keyframe measured | View Transitions API clip-path circle from the button; instant swap where unsupported | 4 |
| "Works." with filter chips and "Showing N of N projects" | Observed, copy in the pasted markdown | `Works` client component driven by `lib/projects.ts` | 3, 7 |
| Card hover: lift/border/shadow over 0.3s; link colour 0.15s | Transition values measured | Same durations on our cards | 9 |
| Fixed gradient masks pinned top and bottom | Measured in session 3 | Two fixed `pointer-events:none` gradients | 9 |
| Statement + framed showreel tiles; draggable 3D turntable; AI "Ask me anything" chat; handwritten `Reenie Beanie` accent; `hw-wipe` handwriting underline | Observed / measured | **Skipped.** Showreel needs the asset work (D5). The rest is Pouya's personality or a different product. "Ask me anything" becomes a mailto. | — |
| The `#about` area rendered blank for ≥2s after a programmatic jump | Observed once, not investigated | Treated as the hazard to avoid, not a pattern to copy: nothing here starts at `opacity: 0` unless it is an inactive alternate | all |

**Not copied:** poulo's markup, CSS, assets, copy, lime `#adfa1d`, Reenie Beanie, the keyboard art, the avatar. Fonts (TikTok Sans, IBM Plex Mono) are Google Fonts already used by the v1 study. Accent stays v1's clay `#d98b5a` (decision D2 still open).

**Editable copy defaults** (in `lib/profile.ts`): hero roles `Agentic AI Engineer` / `Backend Engineer` / `Systems Builder`. Change them freely; a test only checks there are exactly three.

## File structure

**Create**
- `lib/scene.ts` — pure scroll progress → cross-fade weights. One responsibility: the math.
- `lib/stars.ts` — seeded starfield generation and twinkle. Pure.
- `lib/projects.ts` — project data, filter chips, filter + count helpers.
- `lib/profile.ts` — hero roles, experience, stack (static data).
- `lib/scene.test.ts`, `lib/stars.test.ts`, `lib/projects.test.ts`, `lib/profile.test.ts`
- `components/engineering/ThemeOrb.tsx` — round theme button, circular reveal.
- `components/engineering/PillNav.tsx` + `nav.css` — fixed pill nav.
- `components/engineering/Intro.tsx`, `IntroSeen.tsx`, `intro.css` — loader.
- `components/engineering/Starfield.tsx` — canvas.
- `components/engineering/HeroScene.tsx` + `hero.css` — pinned stage, scene layers.
- `components/engineering/Works.tsx`, `ProjectCard.tsx`, `works.css` — filterable projects.
- `components/engineering/fx.css` — edge masks, hover polish.

**Move / rewrite**
- `app/engineering_v1/page.tsx` → `app/engineering/page.tsx` (rewritten in full, Task 8)
- `app/engineering_v1/v1.css` → `app/engineering/engineering.css` (renamed classes, theme vars)
- `app/engineering/layout.tsx` — gains the two fonts.

**Delete**
- Old `app/engineering/page.tsx` and `engineering.css` (the GSAP page), `app/engineering_v1|v2|v3/`, `components/VersionSwitch.tsx`, `components/version-switch.css`. Recoverable from commit `d3f7869`.

---

### Task 0: Preflight

**Files:** none changed.

- [ ] **Step 1: Confirm branch and working tree**

Run: `git branch --show-current && git status --short`
Expected: `rebuild/speed-and-engineering`, then ` M components/CursorPortrait.tsx` and the three untracked paths (`.claude/`, two `docs/superpowers` files). Nothing else.

- [ ] **Step 2: Record the baseline**

Run: `npm test 2>&1 | tail -8 && npx tsc --noEmit && echo TSC_OK && npm run lint 2>&1 | tail -15`
Expected: tests `pass 81`, `fail 0`; `TSC_OK`. Write down the lint summary (error and warning counts). Later tasks must not add to it.

---

### Task 1: Scene math (`lib/scene.ts`)

**Files:**
- Create: `lib/scene.ts`
- Test: `lib/scene.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/scene.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SCENE_COUNT, clamp01, heroProgress, sceneWeights } from './scene.ts'

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !~ ${b}`)

test('clamp01 bounds its input and sanitises NaN', () => {
  assert.equal(clamp01(-3), 0)
  assert.equal(clamp01(7), 1)
  assert.equal(clamp01(0.4), 0.4)
  assert.equal(clamp01(NaN), 0)
  assert.equal(clamp01(Infinity), 0)
})

test('heroProgress: 0 on arrival, 1 at the end, 0 when nothing can scroll', () => {
  assert.equal(heroProgress(0, 2000, 800), 0)
  assert.equal(heroProgress(-600, 2000, 800), 0.5)
  assert.equal(heroProgress(-1200, 2000, 800), 1)
  assert.equal(heroProgress(-5000, 2000, 800), 1)
  assert.equal(heroProgress(200, 2000, 800), 0)
  assert.equal(heroProgress(0, 800, 800), 0)
})

test('sceneWeights lands exactly on one scene at the start, middle and end', () => {
  assert.deepEqual(sceneWeights(0, 3), [1, 0, 0])
  assert.deepEqual(sceneWeights(0.5, 3), [0, 1, 0])
  assert.deepEqual(sceneWeights(1, 3), [0, 0, 1])
})

test('sceneWeights blends neighbours at a slot boundary', () => {
  const w = sceneWeights(1 / 3, 3)
  near(w[0], 0.5)
  near(w[1], 0.5)
  near(w[2], 0)
})

test('sceneWeights holds a plateau inside a slot', () => {
  assert.deepEqual(sceneWeights(0.1, 3), [1, 0, 0])
  assert.deepEqual(sceneWeights(0.9, 3), [0, 0, 1])
})

test('sceneWeights always sums to 1 and never leaves 0..1', () => {
  for (let i = 0; i <= 200; i++) {
    const w = sceneWeights(i / 200, 3)
    near(w.reduce((a, b) => a + b, 0), 1)
    for (const v of w) assert.ok(v >= 0 && v <= 1)
  }
})

test('sceneWeights tolerates junk progress and tiny counts', () => {
  assert.deepEqual(sceneWeights(NaN, 3), [1, 0, 0])
  assert.deepEqual(sceneWeights(0.7, 1), [1])
  assert.deepEqual(sceneWeights(0.7, 0), [])
})

test('the default count is the hero scene count', () => {
  assert.equal(SCENE_COUNT, 3)
  assert.equal(sceneWeights(0.5).length, SCENE_COUNT)
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test lib/scene.test.ts`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `./scene.ts`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/scene.ts
// Pure mapping from scroll position to hero scene weights. No DOM access, so
// it is unit testable: HeroScene reads the DOM and feeds numbers in.

/** Night, clouds, sun. Also the number of hero roles (see lib/profile.test.ts). */
export const SCENE_COUNT = 3

/** Clamp to 0..1. NaN and Infinity become 0 so a bad measurement can never
 *  poison a CSS custom property. */
export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/** 0 when the hero's top edge reaches the viewport top, 1 once all of its
 *  pinned travel is used. 0 for a hero that cannot scroll. */
export function heroProgress(sectionTop: number, sectionHeight: number, viewportHeight: number): number {
  const travel = sectionHeight - viewportHeight
  if (travel <= 0) return 0
  return clamp01(-sectionTop / travel)
}

/**
 * Cross-fade weights for `count` scenes. Scene i is centred in its slot of
 * the progress range, holds weight 1 across a plateau, and trades weight with
 * its neighbour across `blend` (a fraction of one slot) at each boundary.
 * The weights always sum to 1.
 */
export function sceneWeights(progress: number, count: number = SCENE_COUNT, blend = 0.3): number[] {
  if (count <= 0) return []
  const weights = new Array<number>(count).fill(0)
  const s = Math.min(count - 1, Math.max(0, clamp01(progress) * count - 0.5))
  const i = Math.floor(s)
  const f = s - i
  const lo = (1 - blend) / 2
  const raw = clamp01((f - lo) / blend)
  const t = raw * raw * (3 - 2 * raw)
  if (i + 1 >= count) {
    weights[i] = 1
  } else {
    weights[i] = 1 - t
    weights[i + 1] = t
  }
  return weights
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `node --test lib/scene.test.ts`
Expected: `pass 8`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/scene.ts lib/scene.test.ts
git commit -m "feat: pure scroll-to-scene weights for the hero" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Starfield math (`lib/stars.ts`)

**Files:**
- Create: `lib/stars.ts`
- Test: `lib/stars.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/stars.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeStars, rng, starCountFor, twinkle } from './stars.ts'

test('rng is deterministic per seed and stays in [0, 1)', () => {
  const a = rng(7)
  const b = rng(7)
  for (let i = 0; i < 50; i++) {
    const v = a()
    assert.equal(v, b())
    assert.ok(v >= 0 && v < 1)
  }
  assert.notEqual(rng(1)(), rng(2)())
})

test('makeStars returns the requested count, deterministically', () => {
  assert.equal(makeStars(40).length, 40)
  assert.deepEqual(makeStars(40, 3), makeStars(40, 3))
  assert.notDeepEqual(makeStars(40, 3), makeStars(40, 4))
})

test('every star sits inside the unit square with a sane radius', () => {
  for (const s of makeStars(300)) {
    assert.ok(s.x >= 0 && s.x < 1)
    assert.ok(s.y >= 0 && s.y < 1)
    assert.ok(s.r >= 0.4 && s.r <= 1.7)
  }
})

test('twinkle stays between 0.25 and 1 at any time', () => {
  for (const s of makeStars(50)) {
    for (const t of [0, 0.5, 3.3, 120, 9999]) {
      const v = twinkle(s, t)
      assert.ok(v >= 0.25 - 1e-9 && v <= 1 + 1e-9, `twinkle ${v}`)
    }
  }
})

test('starCountFor scales with area and is clamped', () => {
  assert.equal(starCountFor(375, 812), 60)
  assert.equal(starCountFor(1440, 900), 144)
  assert.equal(starCountFor(3840, 2160), 220)
  assert.equal(starCountFor(0, 0), 60)
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test lib/stars.test.ts`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `./stars.ts`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/stars.ts
// Seeded starfield. Seeded so server and client agree and tests are stable.

export type Star = { x: number; y: number; r: number; phase: number; speed: number }

/** mulberry32: a small, well-distributed seeded generator. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** x and y are fractions of the canvas, so the field survives a resize. */
export function makeStars(count: number, seed = 7): Star[] {
  const r = rng(seed)
  return Array.from({ length: count }, () => ({
    x: r(),
    y: r(),
    r: 0.4 + r() * 1.3,
    phase: r() * Math.PI * 2,
    speed: 0.4 + r() * 1.2,
  }))
}

/** Opacity 0.25..1 at time `t` seconds. */
export function twinkle(star: Star, t: number): number {
  return 0.625 + 0.375 * Math.sin(star.phase + t * star.speed)
}

/** Roughly one star per 9000 css px, clamped so phones stay cheap and
 *  4K screens stay uncluttered. */
export function starCountFor(width: number, height: number): number {
  return Math.min(220, Math.max(60, Math.round((width * height) / 9000)))
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `node --test lib/stars.test.ts`
Expected: `pass 5`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/stars.ts lib/stars.test.ts
git commit -m "feat: seeded starfield helpers" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Project and profile data (`lib/projects.ts`, `lib/profile.ts`)

**Files:**
- Create: `lib/projects.ts`, `lib/profile.ts`
- Test: `lib/projects.test.ts`, `lib/profile.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/projects.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ALL, FILTERS, PROJECTS, countLabel, filterProjects, hashtag } from './projects.ts'

test('"Show all" returns every project, as a copy', () => {
  const out = filterProjects(PROJECTS, ALL)
  assert.deepEqual(out, [...PROJECTS])
  assert.notEqual(out, PROJECTS)
})

test('a tag filter returns only projects carrying that tag', () => {
  const out = filterProjects(PROJECTS, 'Mobile app')
  assert.ok(out.length > 0)
  for (const p of out) assert.ok(p.tags.includes('Mobile app'))
})

test('an unknown filter matches nothing', () => {
  assert.deepEqual(filterProjects(PROJECTS, 'Nope'), [])
})

test('countLabel pluralises on the total', () => {
  assert.equal(countLabel(2, 2), 'Showing 2 of 2 projects')
  assert.equal(countLabel(1, 2), 'Showing 1 of 2 projects')
  assert.equal(countLabel(1, 1), 'Showing 1 of 1 project')
  assert.equal(countLabel(0, 2), 'Showing 0 of 2 projects')
})

test('hashtag joins capitalised words', () => {
  assert.equal(hashtag('Agentic AI'), '#AgenticAI')
  assert.equal(hashtag('Distributed systems'), '#DistributedSystems')
  assert.equal(hashtag('Mobile app'), '#MobileApp')
})

test('data integrity: unique slugs, known tags, no dead filter chip', () => {
  const slugs = PROJECTS.map((p) => p.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  const chips = FILTERS.filter((f) => f !== ALL)
  for (const p of PROJECTS) for (const t of p.tags) assert.ok(chips.includes(t as never), `unknown tag ${t}`)
  for (const chip of chips) assert.ok(filterProjects(PROJECTS, chip).length > 0, `dead chip ${chip}`)
})
```

```ts
// lib/profile.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HERO_ROLES, EXPERIENCE, STACK } from './profile.ts'
import { SCENE_COUNT } from './scene.ts'

test('there is one hero role per hero scene', () => {
  assert.equal(HERO_ROLES.length, SCENE_COUNT)
})

test('experience is newest first and every entry is complete', () => {
  assert.equal(EXPERIENCE.length, 3)
  for (const e of EXPERIENCE) {
    for (const k of ['company', 'when', 'title', 'what'] as const) assert.ok(e[k].length > 0)
  }
  assert.equal(EXPERIENCE[0].company, 'YouTube')
})

test('stack has no duplicates', () => {
  assert.equal(new Set(STACK).size, STACK.length)
})
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `node --test lib/projects.test.ts lib/profile.test.ts`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `./projects.ts` and `./profile.ts`.

- [ ] **Step 3: Write the implementations**

```ts
// lib/projects.ts
// The two personal projects shown on /engineering, and the filter logic for
// the chips above them. Pure, so the filter is unit tested.

export const ALL = 'Show all'
export const FILTERS = [ALL, 'Agentic AI', 'Mobile app', 'Distributed systems'] as const

export type Project = {
  slug: string
  headline: string
  bubble: string
  kicker: string
  meta: string
  summary: string
  role: string
  roleDetail: string
  tags: readonly string[]
  link: { href: string; label: string; external: boolean }
  stats: readonly { value: string; label: string; accent?: boolean }[]
}

export const PROJECTS: readonly Project[] = [
  {
    slug: 'lacuriosity',
    headline: 'LaCuriosity. A publication that writes, illustrates and ships itself every day.',
    bubble: 'Which stream is trending this week?',
    kicker: 'Automated editorial platform',
    meta: 'Personal project · 2026',
    summary:
      'Five thematic streams — Science, Psychology, Technology, Mathematics and Ecology — each driven by a specialized Claude instance with its own persona, research mandate and visual identity. One daily trigger, fifty-five nodes, zero human touchpoints.',
    role: 'Role: Sole engineer.',
    roleDetail: 'Research, orchestration, prompt design and distribution, end to end.',
    tags: ['Agentic AI', 'Distributed systems'],
    link: { href: 'https://lacuriosity.com', label: 'Visit the site', external: true },
    stats: [
      { value: '55', label: 'Automation nodes' },
      { value: '5', label: 'Editorial streams' },
      { value: '0', label: 'Human touchpoints', accent: true },
    ],
  },
  {
    slug: 'notebound',
    headline: 'Notebound. Turning a trip’s photos, notes and voice into a written story.',
    bubble: 'What did we do on day three?',
    kicker: 'iOS travel journaling app',
    meta: 'Personal project · 2026',
    summary:
      'The opposite mode of agentic AI to LaCuriosity: human-in-the-loop, multimodal intelligence inside a polished consumer product. Capture is voice-first and offline-first.',
    role: 'Role: Sole engineer.',
    roleDetail: 'Haiku classifies intent and tags notes; Opus reads the photos and writes the narrative.',
    tags: ['Agentic AI', 'Mobile app'],
    link: { href: '/engineering/notebound', label: 'Read the case study', external: false },
    stats: [
      { value: '289', label: 'Tests passing' },
      { value: '3', label: 'Claude models' },
      { value: '100%', label: 'Offline-first capture', accent: true },
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

/** 'Distributed systems' -> '#DistributedSystems' */
export function hashtag(tag: string): string {
  return '#' + tag.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('')
}
```

```ts
// lib/profile.ts
// Static copy for /engineering. The experience text is the approved,
// abstracted wording from docs/rebuild/REBUILD_PROGRESS.md.

/** One per hero scene — lib/profile.test.ts enforces the count. */
export const HERO_ROLES = ['Agentic AI Engineer', 'Backend Engineer', 'Systems Builder'] as const

export const EXPERIENCE = [
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
] as const

export const STACK = [
  'Claude API', 'Gemini API', 'TypeScript', 'React Native',
  'Supabase', 'Ghost CMS', 'Make.com', 'ElevenLabs',
] as const
```

- [ ] **Step 4: Run them and confirm they pass**

Run: `node --test lib/projects.test.ts lib/profile.test.ts`
Expected: `pass 9`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/projects.ts lib/projects.test.ts lib/profile.ts lib/profile.test.ts
git commit -m "feat: project filter logic and profile data" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Theme orb and pill nav

The theme variables these components read (`--nav-bg`, `--hover`, …) are defined in Task 8. Until then this task is verified by `tsc` and lint only.

**Files:**
- Create: `components/engineering/ThemeOrb.tsx`, `components/engineering/PillNav.tsx`, `components/engineering/nav.css`

- [ ] **Step 1: Write `ThemeOrb.tsx`**

```tsx
// components/engineering/ThemeOrb.tsx
'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import { resolveTheme, nextTheme, THEME_STORAGE_KEY, type Theme } from '@/lib/theme'

type WithViewTransition = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> }
}

/* Round theme button. Where the View Transitions API exists the new theme is
   revealed as a circle growing from the button; everywhere else, and under
   reduced motion, the theme simply swaps. The swap is a data-theme write on
   <html>, the same mechanism as components/ThemeToggle.tsx, so the root
   ThemeScript keeps working. */
export default function ThemeOrb() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    let stored: string | null = null
    try { stored = localStorage.getItem(THEME_STORAGE_KEY) } catch {}
    setTheme(resolveTheme(stored, window.matchMedia('(prefers-color-scheme: light)').matches))
  }, [])

  function apply(next: Theme) {
    document.documentElement.dataset.theme = next
    try { localStorage.setItem(THEME_STORAGE_KEY, next) } catch {}
    setTheme(next)
  }

  function flip(e: MouseEvent<HTMLButtonElement>) {
    if (!theme) return
    const next = nextTheme(theme)
    const doc = document as WithViewTransition
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !doc.startViewTransition) {
      apply(next)
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const t = doc.startViewTransition(() => apply(next))
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  // Placeholder until the client knows the theme: same size, so nothing shifts.
  if (!theme) return <span className="eng-orb" aria-hidden="true" />

  return (
    <button type="button" className="eng-orb" onClick={flip} aria-label={`Switch to ${nextTheme(theme)} theme`}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" />
        )}
      </svg>
    </button>
  )
}
```

- [ ] **Step 2: Write `PillNav.tsx`**

```tsx
// components/engineering/PillNav.tsx
'use client'

import { useEffect, useState, type ReactNode } from 'react'
import ThemeOrb from './ThemeOrb'
import './nav.css'

const ICON = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

const ITEMS: { id: string; label: string; icon: ReactNode }[] = [
  { id: 'top', label: 'Top', icon: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z" /> },
  { id: 'work', label: 'Work', icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></> },
  { id: 'experience', label: 'Experience', icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></> },
  { id: 'stack', label: 'Stack', icon: <><path d="m12 3 9 5-9 5-9-5Z" /><path d="m3 13 9 5 9-5" /></> },
]

/* Three bubbles, like the reference: the section pill, the theme orb, and a
   filled call-to-action. The active section is whichever one crosses a thin
   band just above the middle of the viewport. */
export default function PillNav() {
  const [active, setActive] = useState('top')

  useEffect(() => {
    const els = ITEMS.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e)
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) setActive(e.target.id) },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="eng-navbar">
      <nav className="eng-nav" aria-label="Sections">
        {ITEMS.map((i) => (
          <a key={i.id} className="eng-nav-icon" href={`#${i.id}`} aria-label={i.label} aria-current={active === i.id ? 'true' : undefined}>
            <svg {...ICON}>{i.icon}</svg>
          </a>
        ))}
      </nav>
      <ThemeOrb />
      <a className="eng-cta" href="mailto:rutvij.dhotey@gmail.com">
        <span className="eng-avatar" aria-hidden="true">RD</span>
        <span className="eng-nav-label">Get in touch</span>
      </a>
    </div>
  )
}
```

- [ ] **Step 3: Write `nav.css`**

```css
/* components/engineering/nav.css
   Three floating bubbles pinned top-centre. Colours come from the .eng theme
   variables defined in app/engineering/engineering.css. */

.eng-navbar {
  position: fixed; top: 24px; left: 0; right: 0; z-index: 50;
  display: flex; justify-content: center; gap: 8px;
  padding-inline: 16px;
  pointer-events: none;
}
.eng-navbar > * { pointer-events: auto; }

.eng-nav, .eng-orb, .eng-cta {
  background: var(--nav-bg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--line);
  border-radius: 999px;
}
.eng-nav { display: flex; align-items: center; gap: 2px; padding: 5px; }
.eng-nav-icon {
  width: 44px; height: 44px; border-radius: 999px;
  display: grid; place-items: center;
  color: var(--muted);
  transition: color 0.15s, background-color 0.15s;
}
.eng-nav-icon:hover,
.eng-nav-icon[aria-current="true"] { color: var(--paper); background: var(--hover); }

.eng-orb {
  width: 54px; height: 54px; display: grid; place-items: center;
  color: var(--paper); cursor: pointer; font: inherit;
  transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}
.eng-orb:active { transform: scale(0.95); }

.eng-cta {
  height: 54px; display: flex; align-items: center; gap: 10px;
  padding: 0 8px;
  background: var(--paper); color: var(--ink); border-color: transparent;
  font-size: 16px; font-weight: 500;
}
.eng-avatar {
  width: 36px; height: 36px; border-radius: 999px;
  background: var(--clay); color: var(--ink);
  display: grid; place-items: center;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 13px; letter-spacing: 0;
}
.eng-nav-label { display: none; }
@media (min-width: 620px) {
  .eng-cta { padding: 0 20px 0 8px; }
  .eng-nav-label { display: inline; }
}

/* Anchors must clear the fixed bar. #top is the hero and sits under it. */
.eng [id] { scroll-margin-top: 96px; }
.eng #top { scroll-margin-top: 0; }

/* Theme swap: the new theme is revealed through a growing circle (animated in
   ThemeOrb), so the browser's default cross-fade must be off. */
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
::view-transition-new(root) { z-index: 1; }
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && echo TSC_OK && npx eslint components/engineering`
Expected: `TSC_OK` and no eslint errors. If eslint flags `react-hooks/set-state-in-effect` on the `setTheme` call, that is the same pattern `components/ThemeToggle.tsx` already uses: match its handling, do not restructure.

- [ ] **Step 5: Commit**

```bash
git add components/engineering/ThemeOrb.tsx components/engineering/PillNav.tsx components/engineering/nav.css
git commit -m "feat: floating pill nav with circular theme reveal" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Intro loader

**Files:**
- Create: `components/engineering/Intro.tsx`, `components/engineering/IntroSeen.tsx`, `components/engineering/intro.css`

Design rule: the overlay is pure CSS and ends itself (`forwards` to `visibility: hidden`), so it cannot get stuck. It is a ~1.6s timed intro, not a fake load meter, and it plays once per session.

- [ ] **Step 1: Write `IntroSeen.tsx`**

```tsx
// components/engineering/IntroSeen.tsx
'use client'

import { useEffect } from 'react'

/* Marks the intro as seen once it has had time to play, so client-side
   navigations back to /engineering in the same session skip it. The inline
   script in Intro.tsx covers full page loads before first paint. */
export default function IntroSeen() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      document.documentElement.dataset.intro = 'seen'
      try { sessionStorage.setItem('eng-intro-seen', '1') } catch {}
    }, 2000)
    return () => window.clearTimeout(t)
  }, [])
  return null
}
```

- [ ] **Step 2: Write `Intro.tsx`**

```tsx
// components/engineering/Intro.tsx
import IntroSeen from './IntroSeen'
import './intro.css'

/* Runs during parsing, before first paint: a returning visitor never sees the
   overlay. Keep the storage key in step with IntroSeen.tsx. */
const SCRIPT = `(function(){try{
var k='eng-intro-seen';
if(sessionStorage.getItem(k)){document.documentElement.dataset.intro='seen';}
}catch(e){}})();`

const LINE = { pathLength: 1, fill: 'none' } as const

export default function Intro() {
  return (
    <>
      <div className="eng-intro" aria-hidden="true">
        <svg viewBox="0 0 240 160" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="44" width="200" height="100" rx="14" {...LINE} />
          <path d="M84 44 96 24h48l12 20" {...LINE} />
          <circle cx="120" cy="94" r="32" {...LINE} />
          <circle cx="120" cy="94" r="18" {...LINE} />
          <rect x="40" y="58" width="22" height="12" rx="3" {...LINE} />
        </svg>
        <div className="eng-intro-bar"><span /></div>
        <p className="eng-intro-label">Loading</p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <IntroSeen />
    </>
  )
}
```

- [ ] **Step 3: Write `intro.css`**

```css
/* components/engineering/intro.css
   Everything here ends on its own: the overlay's last keyframe is
   visibility: hidden with fill-mode forwards. With JS dead it still leaves. */

.eng-intro {
  position: fixed; inset: 0; z-index: 100;
  display: grid; place-content: center; justify-items: center; gap: 28px;
  background: var(--ink); color: var(--paper);
  pointer-events: none;
  animation: eng-intro-out 0.45s ease 1.15s forwards;
}
:root[data-intro="seen"] .eng-intro { display: none; }

.eng-intro svg { width: min(240px, 56vw); height: auto; }
.eng-intro svg > * {
  stroke-dasharray: 1; stroke-dashoffset: 1;
  animation: eng-draw 0.9s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}
.eng-intro svg > *:nth-child(2) { animation-delay: 0.08s; }
.eng-intro svg > *:nth-child(3) { animation-delay: 0.16s; }
.eng-intro svg > *:nth-child(4) { animation-delay: 0.24s; }
.eng-intro svg > *:nth-child(5) { animation-delay: 0.3s; }

.eng-intro-bar { width: 168px; height: 2px; border-radius: 2px; background: var(--line); overflow: hidden; }
.eng-intro-bar span {
  display: block; height: 100%; background: var(--paper);
  transform: scaleX(0); transform-origin: left;
  animation: eng-fill 1.05s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
.eng-intro-label {
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--muted);
}

@keyframes eng-draw { to { stroke-dashoffset: 0; } }
@keyframes eng-fill { to { transform: scaleX(1); } }
@keyframes eng-intro-out { to { opacity: 0; visibility: hidden; } }

@media (prefers-reduced-motion: reduce) {
  .eng-intro { display: none; }
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit && echo TSC_OK`
Expected: `TSC_OK`. (If TypeScript rejects spreading `{ pathLength: 1, fill: 'none' }` onto SVG elements, replace `{...LINE}` with the literal attributes `pathLength={1} fill="none"` on each of the five shapes.)

- [ ] **Step 5: Commit**

```bash
git add components/engineering/Intro.tsx components/engineering/IntroSeen.tsx components/engineering/intro.css
git commit -m "feat: self-ending line-art intro that plays once per session" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Starfield and pinned hero scene

**Files:**
- Create: `components/engineering/Starfield.tsx`, `components/engineering/HeroScene.tsx`, `components/engineering/hero.css`

Behaviour contract, which the CSS and component must both honour:
- Default (server render, JS off, phones, reduced motion): hero is one viewport tall, scene 0 (night) and role 0 visible. This is a complete page.
- `is-live` (added by JS only when `(min-width: 1000px) and (min-height: 640px)` **and** `prefers-reduced-motion: no-preference`): hero becomes 260svh tall with a sticky 100svh stage; `--w0/--w1/--w2` (scene weights) are written on the section as you scroll.

- [ ] **Step 1: Write `Starfield.tsx`**

```tsx
// components/engineering/Starfield.tsx
'use client'

import { useEffect, useRef } from 'react'
import { makeStars, starCountFor, twinkle } from '@/lib/stars'

/* Decorative canvas. Draws one still frame under reduced motion, animates
   only while on screen, and sizes itself to its box (not the window). */
export default function Starfield({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let stars = makeStars(120)
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = rect.width
      h = rect.height
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      stars = makeStars(starCountFor(w, h))
    }

    function draw(t: number) {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, w, h)
      ctx!.fillStyle = '#ffffff'
      for (const s of stars) {
        ctx!.globalAlpha = twinkle(s, t)
        ctx!.beginPath()
        ctx!.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx!.fill()
      }
    }

    function frame(ms: number) {
      raf = 0
      if (!visible) return
      draw(ms / 1000)
      raf = requestAnimationFrame(frame)
    }
    function start() {
      if (!raf && !reduce) raf = requestAnimationFrame(frame)
    }

    resize()
    draw(0)
    const ro = new ResizeObserver(() => { resize(); draw(0) })
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
```

- [ ] **Step 2: Write `HeroScene.tsx`**

```tsx
// components/engineering/HeroScene.tsx
'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { SCENE_COUNT, heroProgress, sceneWeights } from '@/lib/scene'
import Starfield from './Starfield'
import './hero.css'

const LIVE_QUERY = '(min-width: 1000px) and (min-height: 640px)'
const MOTION_QUERY = '(prefers-reduced-motion: no-preference)'
const VARS = Array.from({ length: SCENE_COUNT }, (_, i) => `--w${i}`)

/* Pinned hero. The server renders the finished, static hero. Only after
   hydration, and only on a large screen that allows motion, does this add
   `is-live` and start writing scene weights (--w0..--w2) as CSS custom
   properties; hero.css turns those into layer opacity and the role vapor.
   Remove `is-live` and every variable and the page is simply the first scene. */
export default function HeroScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const live = window.matchMedia(LIVE_QUERY)
    const motion = window.matchMedia(MOTION_QUERY)
    let raf = 0

    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      sceneWeights(heroProgress(r.top, r.height, window.innerHeight)).forEach((v, i) =>
        el.style.setProperty(VARS[i], v.toFixed(3)),
      )
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }

    const sync = () => {
      const on = live.matches && motion.matches
      el.classList.toggle('is-live', on)
      if (on) {
        update()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
      } else {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
        VARS.forEach((v) => el.style.removeProperty(v))
      }
    }

    sync()
    live.addEventListener('change', sync)
    motion.addEventListener('change', sync)
    return () => {
      live.removeEventListener('change', sync)
      motion.removeEventListener('change', sync)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
      el.classList.remove('is-live')
    }
  }, [])

  return (
    <section ref={ref} id="top" className="eng-scene">
      <div className="eng-stage">
        <div className="eng-layer eng-layer--day" aria-hidden="true">
          <div className="eng-rays" />
          <div className="eng-sun" />
        </div>
        <div className="eng-layer eng-layer--cloud" aria-hidden="true">
          <span className="eng-cloud" style={{ top: '10%', animationDelay: '-6s' }} />
          <span className="eng-cloud eng-cloud--b" style={{ top: '38%', animationDelay: '-31s' }} />
          <span className="eng-cloud" style={{ top: '64%', animationDelay: '-52s' }} />
        </div>
        <div className="eng-layer eng-layer--night" aria-hidden="true">
          <Starfield className="eng-stars" />
        </div>
        <div className="eng-stage-content">{children}</div>
        <a className="eng-skip" href="#work">Skip intro <span aria-hidden="true">↓</span></a>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Write `hero.css`**

```css
/* components/engineering/hero.css
   Nothing here makes the first scene or first role invisible: every weight
   defaults to "scene 0 on". Inactive roles and layers are alternates, not
   content. The hero is always dark artwork, whatever the page theme. */

.eng-scene {
  position: relative; z-index: 41; /* above the edge masks (z 40) in fx.css */
  background: #070709; color: #fafafa;
  --ink: #070709; --paper: #fafafa; --muted: #9b9ba3;
  --line: rgb(255 255 255 / 0.1);
  --hover: rgb(255 255 255 / 0.06); --hover-line: rgb(255 255 255 / 0.3);
}
.eng-stage {
  position: relative; overflow: hidden;
  min-height: 100svh; display: grid; align-items: center;
}
.eng-scene.is-live { height: 260svh; }
.eng-scene.is-live .eng-stage { position: sticky; top: 0; height: 100svh; }

.eng-stage .eng-hero { padding-block: 104px 72px; }
.eng-stage-content { position: relative; z-index: 1; width: 100%; }

/* ── scene layers: cross-faded by the weights ───────────────────── */
.eng-layer { position: absolute; inset: 0; pointer-events: none; }
.eng-layer--night { opacity: var(--w0, 1); }
.eng-layer--cloud { opacity: var(--w1, 0); background: linear-gradient(#0b0d12, #151a24); }
.eng-layer--day   { opacity: var(--w2, 0); background: linear-gradient(#0a0f1e 0%, #1c2742 55%, #3a3550 100%); }
.eng-stars { width: 100%; height: 100%; display: block; }

.eng-cloud {
  position: absolute; left: 0; width: 38vw; height: 14vw; border-radius: 50%;
  background: radial-gradient(closest-side, rgb(255 255 255 / 0.2), transparent);
  filter: blur(28px);
  animation: eng-cloud-drift 70s linear infinite;
}
.eng-cloud--b { width: 28vw; height: 10vw; animation-duration: 95s; }

.eng-sun {
  position: absolute; top: -20vw; right: -8vw; width: 60vw; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(closest-side, rgb(255 236 200 / 0.85), rgb(255 200 140 / 0.25) 45%, transparent 70%);
  animation: eng-sun-breathe 6s ease-in-out infinite alternate;
}
.eng-rays {
  position: absolute; inset: 0;
  background: repeating-conic-gradient(from 195deg at 88% 0%, rgb(255 240 210 / 0.1) 0 3deg, transparent 3deg 9deg);
  -webkit-mask-image: linear-gradient(to bottom left, #000, transparent 72%);
          mask-image: linear-gradient(to bottom left, #000, transparent 72%);
}

@keyframes eng-cloud-drift { from { translate: -40vw 0; } to { translate: 110vw 0; } }
@keyframes eng-sun-breathe { from { opacity: 0.85; scale: 0.94; } to { opacity: 1; scale: 1.04; } }

/* ── hero roles: stacked in one grid cell so nothing shifts ─────── */
.eng-roles { display: grid; }
.eng-role {
  grid-area: 1 / 1;
  opacity: var(--w);
  filter: blur(calc((1 - var(--w)) * 12px));
  transform: translateY(calc((1 - var(--w)) * 0.3em)) scale(calc(1 + (1 - var(--w)) * 0.1));
  transition: opacity 0.12s linear, filter 0.12s linear, transform 0.12s linear;
}
.eng-role[data-i="0"] { --w: var(--w0, 1); }
.eng-role[data-i="1"] { --w: var(--w1, 0); }
.eng-role[data-i="2"] { --w: var(--w2, 0); }
.eng-sr {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}

/* ── skip link: only exists while the hero is pinned ────────────── */
.eng-skip {
  display: none; position: absolute; z-index: 2; left: 50%; bottom: 28px; translate: -50% 0;
  height: 40px; align-items: center; gap: 8px; padding-inline: 18px;
  border: 1px solid var(--line); border-radius: 999px;
  background: rgb(0 0 0 / 0.35); backdrop-filter: blur(10px);
  color: var(--muted); font-size: 14px;
  transition: color 0.15s, border-color 0.15s;
}
.eng-scene.is-live .eng-skip { display: inline-flex; }
.eng-skip:hover { color: var(--paper); border-color: var(--hover-line); }

@media (prefers-reduced-motion: reduce) {
  .eng-cloud, .eng-sun { animation: none; }
  .eng-role { transition: none; }
}
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && echo TSC_OK && npx eslint components/engineering`
Expected: `TSC_OK`, no eslint errors.

- [ ] **Step 5: Commit**

```bash
git add components/engineering/Starfield.tsx components/engineering/HeroScene.tsx components/engineering/hero.css
git commit -m "feat: pinned hero with night, cloud and sun scenes" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Filterable works

**Files:**
- Create: `components/engineering/ProjectCard.tsx`, `components/engineering/Works.tsx`, `components/engineering/works.css`

- [ ] **Step 1: Write `ProjectCard.tsx`**

```tsx
// components/engineering/ProjectCard.tsx
import Link from 'next/link'
import { hashtag, type Project } from '@/lib/projects'

export default function ProjectCard({ project: p, hidden }: { project: Project; hidden: boolean }) {
  return (
    <section className="eng-section eng-reveal eng-project" hidden={hidden}>
      <h3 className="eng-proj-head">{p.headline}</h3>
      <div className="eng-tags">
        {p.tags.map((t) => <span className="eng-tag" key={t}>{hashtag(t)}</span>)}
      </div>
      <article className="eng-card">
        <div>
          <p className="eng-bubble">{p.bubble}</p>
          <h4>{p.kicker}</h4>
          <p className="eng-meta">{p.meta}</p>
          <p>{p.summary}</p>
          <p><strong>{p.role}</strong> {p.roleDetail}</p>
          {p.link.external ? (
            <a className="eng-pill eng-pill--solid" href={p.link.href} target="_blank" rel="noopener">
              {p.link.label} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <Link className="eng-pill" href={p.link.href}>
              {p.link.label} <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
        <div className="eng-stats">
          {p.stats.map((s) => (
            <div key={s.label}>
              <div className={s.accent ? 'eng-stat-n eng-stat-n--accent' : 'eng-stat-n'}>{s.value}</div>
              <div className="eng-stat-l">{s.label}</div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
```

- [ ] **Step 2: Write `Works.tsx`**

```tsx
// components/engineering/Works.tsx
'use client'

import { useState } from 'react'
import { ALL, FILTERS, countLabel, filterProjects, type Project } from '@/lib/projects'
import ProjectCard from './ProjectCard'
import './works.css'

/* Every project is in the server HTML. Filtering only toggles `hidden`, so
   with JS off the chips do nothing and the full list is on the page. */
export default function Works({ projects }: { projects: readonly Project[] }) {
  const [filter, setFilter] = useState<string>(ALL)
  const shown = filterProjects(projects, filter)

  return (
    <div id="work">
      <div className="eng-works-head eng-reveal">
        <h2 className="eng-title">Works.</h2>
        <div className="eng-chips" role="group" aria-label="Filter projects">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={f === filter ? 'eng-chip eng-chip--on' : 'eng-chip'}
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="eng-count" aria-live="polite">{countLabel(shown.length, projects.length)}</p>
      </div>
      {projects.map((p) => (
        <ProjectCard key={p.slug} project={p} hidden={!shown.includes(p)} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Write `works.css`**

```css
/* components/engineering/works.css
   The chips were <span>s in the v1 study; they are buttons now. */

.eng-works-head { padding-bottom: 48px; }
.eng-project { padding-bottom: 72px; }
.eng-project[hidden] { display: none; }

button.eng-chip {
  font: inherit; color: inherit; background: transparent; cursor: pointer;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}
button.eng-chip:hover { border-color: var(--hover-line); }
button.eng-chip.eng-chip--on { background: var(--paper); color: var(--ink); border-color: var(--paper); }
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && echo TSC_OK && npx eslint components/engineering`
Expected: `TSC_OK`, no eslint errors.

- [ ] **Step 5: Commit**

```bash
git add components/engineering/ProjectCard.tsx components/engineering/Works.tsx components/engineering/works.css
git commit -m "feat: filterable works with project cards" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Promote v1 to `/engineering` and assemble

This is the task that makes everything visible. It deletes the GSAP page and the three studies (recoverable from `d3f7869`).

**Files:**
- Delete: `app/engineering/page.tsx`, `app/engineering/engineering.css`, `app/engineering_v1/`, `app/engineering_v2/`, `app/engineering_v3/`, `components/VersionSwitch.tsx`, `components/version-switch.css`
- Move: `app/engineering_v1/page.tsx` → `app/engineering/page.tsx` (then overwritten), `app/engineering_v1/v1.css` → `app/engineering/engineering.css`
- Modify: `app/engineering/layout.tsx`
- Include in the commit: the existing uncommitted `components/CursorPortrait.tsx`

- [ ] **Step 1: Move the files**

```bash
git rm -f app/engineering/page.tsx app/engineering/engineering.css
git mv app/engineering_v1/page.tsx app/engineering/page.tsx
git mv app/engineering_v1/v1.css app/engineering/engineering.css
git rm -rf app/engineering_v1 app/engineering_v2 app/engineering_v3 components/VersionSwitch.tsx components/version-switch.css
ls app/engineering app/ | head -30
```
Expected: `app/engineering` contains `engineering.css`, `into-your-stories`, `layout.tsx`, `notebound`, `page.tsx`; `app/` has no `engineering_v*`.

- [ ] **Step 2: Rename the v1 classes and make the colours themeable**

```bash
sed -i '' -E 's/v1-/eng-/g; s/className="v1"/className="eng"/; s/\.v1([ ){:,])/.eng\1/g' app/engineering/engineering.css
sed -i '' \
  -e 's|rgb(18 18 18 / 0.72)|var(--nav-bg)|' \
  -e 's|rgb(255 255 255 / 0.06)|var(--hover)|g' \
  -e 's|rgb(255 255 255 / 0.3)|var(--hover-line)|' \
  -e 's|#5a5a5a|var(--logo-dim)|' \
  -e 's|#4a4a4a|var(--logo-dimmer)|' \
  app/engineering/engineering.css
sed -i '' '/^\/\* ── floating pill nav/,/^\/\* ── hero/{/^\/\* ── hero/!d;}' app/engineering/engineering.css
grep -n "v1\|eng-navbar\|eng-nav-icon" app/engineering/engineering.css
```
Expected from the final `grep`: only comment lines mentioning "v1"/"Version 1" in the header comment (fix those in Step 3); **no** `.eng-navbar` or `.eng-nav-icon` rules (the old nav block is gone, `nav.css` replaces it).

- [ ] **Step 3: Replace the file header and add the theme variables**

Use Edit on `app/engineering/engineering.css`.

Replace the header comment (everything from the first line through the line `   GSAP page this replaces. */` is not in this file; the header is the first block comment ending before `.eng {`) with:

```css
/* app/engineering/engineering.css
   The /engineering page. Dark-first like the reference, with a light theme
   driven by the same data-theme attribute as the rest of the site. The hero
   re-scopes its own dark variables (components/engineering/hero.css), so it
   is dark in both themes.

   Nothing here starts at opacity 0. Scroll reveals are CSS scroll-driven
   animations behind @supports, so with JS off, an unsupported browser, or a
   reduced-motion preference the page is simply already finished. */
```

Then add the new variables right after the clay line. Edit: old_string `  --clay: #d98b5a;` → new_string:

```css
  --clay: #d98b5a;
  --nav-bg: rgb(18 18 18 / 0.72);
  --hover: rgb(255 255 255 / 0.06);
  --hover-line: rgb(255 255 255 / 0.3);
  --logo-dim: #5a5a5a;
  --logo-dimmer: #4a4a4a;
```

Append the light theme at the end of the file:

```bash
cat >> app/engineering/engineering.css <<'EOF'

/* ── light theme ───────────────────────────────────────────────── */
:root[data-theme="light"] .eng {
  --ink: #f6f4ef;
  --raised: #ffffff;
  --paper: #121212;
  --muted: #6b6862;
  --line: rgb(0 0 0 / 0.12);
  --line-soft: rgb(0 0 0 / 0.08);
  --clay: #9a4f12;
  --nav-bg: rgb(255 255 255 / 0.75);
  --hover: rgb(0 0 0 / 0.05);
  --hover-line: rgb(0 0 0 / 0.35);
  --logo-dim: #a5a29b;
  --logo-dimmer: #c4c1ba;
}
EOF
```

- [ ] **Step 4: Rewrite the layout (fonts move here from the deleted v1 layout)**

```tsx
// app/engineering/layout.tsx
import type { Metadata } from 'next'
import { TikTok_Sans, IBM_Plex_Mono } from 'next/font/google'

/* Scoped to this route rather than the root layout, so the photography pages
   never download them. The variables are consumed in engineering.css. */
const tiktok = TikTok_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-tiktok',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

// The title carries the root template forward: a plain string here would reset
// it for every nested route, and /engineering/notebound would lose its
// " — Rutvij Dhotey" suffix.
export const metadata: Metadata = {
  title: {
    default: 'Engineering',
    template: '%s — Rutvij Dhotey',
  },
  description: 'Agentic AI and backend engineering by Rutvij Dhotey, engineer at YouTube.',
}

export default function EngineeringLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${tiktok.variable} ${mono.variable}`}>{children}</div>
}
```

- [ ] **Step 5: Write the assembled page**

```tsx
// app/engineering/page.tsx
import Link from 'next/link'
import CursorPortrait from '@/components/CursorPortrait'
import Intro from '@/components/engineering/Intro'
import PillNav from '@/components/engineering/PillNav'
import HeroScene from '@/components/engineering/HeroScene'
import Works from '@/components/engineering/Works'
import { PROJECTS } from '@/lib/projects'
import { HERO_ROLES, EXPERIENCE, STACK } from '@/lib/profile'
import './engineering.css'

/* A server component. Everything on the page is in the HTML; the client
   components (nav, hero scene, works filter) only add behaviour. */
export default function Engineering() {
  return (
    <main className="eng">
      <Intro />
      <PillNav />

      <HeroScene>
        <header className="eng-hero">
          <div>
            <h1 className="eng-h1">
              <span className="eng-roles" aria-hidden="true">
                {HERO_ROLES.map((r, i) => <span className="eng-role" data-i={i} key={r}>{r}</span>)}
              </span>
              <span className="eng-sr">{HERO_ROLES.join(', ')}</span>
            </h1>
            <div className="eng-pills">
              <a className="eng-pill eng-pill--solid" href="#experience">About me</a>
              <a className="eng-pill" href="#work">See my work <span aria-hidden="true">↗</span></a>
            </div>
          </div>

          <CursorPortrait className="eng-portrait" />

          <div className="eng-intro-copy">
            <p className="eng-eyebrow">Hi, I&rsquo;m Rutvij</p>
            <p className="eng-lede">I build systems that run themselves</p>
            <p>Backend engineering at YouTube on the Shorts creation platform, at billions-of-requests scale.</p>
            <p className="eng-lede">Autonomous pipelines and embedded intelligence</p>
            <p>One trigger fires and a chain of models research, draft, fact-check and publish. Or the intelligence lives inside a product someone holds.</p>
          </div>
        </header>
      </HeroScene>

      <div className="eng-wrap">
        <section className="eng-section eng-reveal" style={{ paddingTop: 'clamp(80px, 10vw, 140px)' }}>
          <h2 className="eng-title">Shipped at scale at</h2>
          <p className="eng-sub" style={{ marginBottom: 56 }}>
            Nine years of backend work across video, marketplace and storage — distributed
            systems, ranking models and the APIs underneath them.
          </p>
          <div className="eng-logos">
            <span className="eng-logo eng-logo--now">YouTube</span>
            <span className="eng-logo">eBay</span>
            <span className="eng-logo">NetApp</span>
            <span className="eng-logo">Penn State</span>
          </div>
        </section>

        <Works projects={PROJECTS} />

        <section id="experience" className="eng-section eng-reveal">
          <h2 className="eng-title">Experience.</h2>
          {EXPERIENCE.map((r) => (
            <div className="eng-role-row" key={r.company}>
              <div>
                <h3>{r.company}</h3>
                <p className="eng-role-when">{r.when}</p>
              </div>
              <div>
                <p className="eng-role-what">{r.title}</p>
                <p>{r.what}</p>
              </div>
            </div>
          ))}
        </section>

        <section id="stack" className="eng-section eng-reveal">
          <h2 className="eng-title">Stack.</h2>
          <div className="eng-stack">
            {STACK.map((s) => <span key={s}>{s}</span>)}
          </div>
        </section>
      </div>

      <footer className="eng-footer">
        <div className="eng-wrap eng-footer-in">
          <div>
            <p className="eng-eyebrow" style={{ marginBottom: 20 }}>Ask me anything</p>
            <a className="eng-mail" href="mailto:rutvij.dhotey@gmail.com">rutvij.dhotey@gmail.com</a>
          </div>
          <div className="eng-links">
            <a className="eng-pill" href="https://linkedin.com/in/rutvij-dhotey" target="_blank" rel="noopener">LinkedIn</a>
            <a className="eng-pill" href="https://github.com/rutvijdhotey" target="_blank" rel="noopener">GitHub</a>
            <Link className="eng-pill" href="/">Photography</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
```

The old `.eng-role` CSS (job rows) clashes with the new hero `.eng-role` (cycling spans). Rename the job-row class in the stylesheet to match the page above:

```bash
sed -i '' -E 's/\.eng-role(:first-of-type|:last-of-type| h3| p| \{)/.eng-role-row\1/g' app/engineering/engineering.css
grep -n "eng-role" app/engineering/engineering.css
```
Expected `grep` output: rules for `.eng-role-row`, `.eng-role-row:first-of-type`, `.eng-role-row:last-of-type`, `.eng-role-row h3`, `.eng-role-row p`, `.eng-role-when`, `.eng-role-what` — but **no** bare `.eng-role {` or `.eng-role p` left over, and no collision with hero.css's `.eng-role[data-i]`.

- [ ] **Step 6: Verify the build and tests**

Run: `npx tsc --noEmit && echo TSC_OK && npm test 2>&1 | tail -8 && npm run build 2>&1 | tail -30`
Expected: `TSC_OK`; tests `fail 0` with the pass count above 81 (81 + 8 + 5 + 9 = 103); build succeeds and lists **13** static routes, including `/engineering` and `/engineering/notebound`, with no `engineering_v*`.

- [ ] **Step 7: Verify in the browser**

Start the dev server named `portfolio` from `.claude/launch.json` and open `http://localhost:3000/engineering`. Use the built-in browser, not Bash.

1. Console: `read_console_messages` with `onlyErrors: true`. Expected: none.
2. Intro: reload; a line-art camera draws and fades by ≈1.6s. Reload again within the session: no overlay (the inline script saw the flag after `IntroSeen` set it at 2s).
3. Hero scenes. Run in `javascript_tool`:

```js
(async()=>{const s=document.getElementById('top');const out=[];for(const f of [0,0.5,1]){const travel=s.offsetHeight-innerHeight;scrollTo({top:s.offsetTop+travel*f,behavior:'instant'});await new Promise(r=>setTimeout(r,300));out.push([f,s.classList.contains('is-live'),s.style.getPropertyValue('--w0'),s.style.getPropertyValue('--w1'),s.style.getPropertyValue('--w2')])}return JSON.stringify(out)})()
```
Expected at a ≥1000×640 window: `[[0,true,"1.000","0.000","0.000"],[0.5,true,"0.000","1.000","0.000"],[1,true,"0.000","0.000","1.000"]]`. Take a screenshot at each position: stars, then drifting clouds, then sun and rays. The headline should read three different roles.
4. Nav: the active icon follows the section as you scroll past Work, Experience, Stack.
5. Theme: click the round button. The other theme grows from the button as a circle. Reload: the choice persists.
6. Filter: click "Mobile app". Expected count text `Showing 1 of 2 projects` and LaCuriosity hidden; "Show all" restores both.
7. `/engineering/notebound` still renders without console errors (it now sits inside the layout's wrapper `div`).

- [ ] **Step 8: Commit**

```bash
git add -A app components lib
git status --short
git commit -m "feat: promote the poulo-style study to /engineering and wire the new interactions" -m "Replaces the GSAP page. Removes the three design studies and the version switch (recoverable from d3f7869). Includes the pending CursorPortrait redraw." -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
Before committing, check `git status --short` shows only intended paths; `.claude/` and the two `docs/superpowers/*2026-06-2x*` files must remain untracked, so do **not** use `git add -A` at the repo root.

---

### Task 9: Edge masks, hover polish, and the responsive/accessibility pass

**Files:**
- Create: `components/engineering/fx.css`
- Modify: `app/engineering/page.tsx` (add the masks and the CSS import)

- [ ] **Step 1: Write `fx.css`**

```css
/* components/engineering/fx.css
   Edge masks and hover polish. Durations are the ones measured on the
   reference: 0.15s for colour, 0.3s for lift/border/shadow. */

.eng-mask { position: fixed; left: 0; right: 0; height: 96px; z-index: 40; pointer-events: none; }
.eng-mask--top { top: 0; background: linear-gradient(to bottom, var(--ink), transparent); }
.eng-mask--bottom { bottom: 0; background: linear-gradient(to top, var(--ink), transparent); }

.eng-card {
  transition: translate 0.3s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.3s, box-shadow 0.3s;
}
@media (hover: hover) and (pointer: fine) {
  .eng-card:hover { translate: 0 -4px; border-color: var(--hover-line); box-shadow: 0 18px 40px -24px rgb(0 0 0 / 0.5); }
}

.eng-pill { transition: border-color 0.15s, background-color 0.15s, color 0.15s; }
.eng-stack span { transition: border-color 0.15s, color 0.15s; }
.eng-stack span:hover { border-color: var(--hover-line); }

@media (prefers-reduced-motion: reduce) {
  .eng-card { transition: none; }
  .eng-card:hover { translate: none; }
}
```

- [ ] **Step 2: Wire it into the page**

Edit `app/engineering/page.tsx`: old_string `import './engineering.css'` → new_string:

```tsx
import './engineering.css'
import '@/components/engineering/fx.css'
```

Edit `app/engineering/page.tsx`: old_string `      <PillNav />\n` → new_string:

```tsx
      <PillNav />
      <div className="eng-mask eng-mask--top" aria-hidden="true" />
      <div className="eng-mask eng-mask--bottom" aria-hidden="true" />
```

- [ ] **Step 3: Verify layout at phone width**

Resize the browser tab with `resize_window` preset `mobile` (375×812), reload, then run:

```js
JSON.stringify({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,live:document.getElementById('top').classList.contains('is-live'),navRight:Math.round(document.querySelector('.eng-navbar').lastElementChild.getBoundingClientRect().right)})
```
Expected: `sw === cw` (no horizontal overflow), `live:false` (the hero is the static scene), `navRight <= 375`. Take a screenshot: hero stacked (headline, portrait, intro), stars visible, nav bubbles fit on one row. Reset with `resize_window` preset `desktop` afterwards.

- [ ] **Step 4: Verify reduced motion**

In `javascript_tool`: confirm `matchMedia('(prefers-reduced-motion: reduce)').matches` is `false` now, then reason from the code rather than faking the media query: `HeroScene` only adds `is-live` when `MOTION_QUERY` matches, `Intro` is `display:none` under reduce, and `.eng-card`/`.eng-cloud`/`.eng-sun` have `reduce` overrides. If the built-in browser can emulate the preference, set it, reload, and expect `is-live:false`, no overlay, and scene 0 visible. If it cannot, say so in the final report rather than claiming it was tested.

- [ ] **Step 5: Verify no JS-dependent content**

```bash
npm run build 2>&1 | tail -4
grep -c "Agentic AI Engineer" out/engineering.html
grep -c "LaCuriosity" out/engineering.html
grep -c "Notebound" out/engineering.html
grep -c "Experience\." out/engineering.html
grep -o 'opacity:0[^;"]*' out/engineering.html | head
```
Expected: the four counts are each ≥ 1 (all content is in the exported HTML), and the last command prints nothing (no inline `opacity:0`).

- [ ] **Step 6: Run the full checks**

Run: `npx tsc --noEmit && echo TSC_OK && npm test 2>&1 | tail -8 && npm run lint 2>&1 | tail -15`
Expected: `TSC_OK`, `fail 0`, and the lint summary is no worse than the baseline recorded in Task 0.

- [ ] **Step 7: Commit**

```bash
git add components/engineering/fx.css app/engineering/page.tsx
git commit -m "feat: edge masks, card hover and responsive pass for /engineering" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Update the handoff

**Files:**
- Modify: `docs/rebuild/REBUILD_PROGRESS.md`

Only do this after Task 9 passes.

- [ ] **Step 1: Append a session log entry**

```bash
cat >> docs/rebuild/REBUILD_PROGRESS.md <<'EOF'

---

## Session 4 (2026-10-31) — /engineering rebuilt to follow poulo.site

Plan: `docs/superpowers/plans/2026-10-31-poulo-faithful-engineering-site.md`.

- `/engineering` is now the promoted v1 study plus new interactions: a
  once-per-session line-art intro, a pinned hero whose night/cloud/sun scenes and
  cycling roles follow scroll, a floating pill nav with a circular theme reveal,
  filterable Works, edge masks. GSAP is gone from this page only; it is still
  used by `/engineering/notebound` and `components/OverlayViewer.tsx`, so it
  stays in `package.json`.
- Pure logic lives in `lib/scene.ts`, `lib/stars.ts`, `lib/projects.ts`,
  `lib/profile.ts`, each with tests.
- Deleted the three design studies (`/engineering_v1..v3`) and the version
  switch. They are recoverable from commit `d3f7869`.
- Deliberate departures from poulo.site: a 1.6-viewport pinned hero instead of
  ~3.4, desktop only, with a Skip link; no hold-to-skip; no handwriting font; no
  AI chat; no showreel tiles (needs the asset work, D5).
- Open: D2 accent colour (still v1's clay `#d98b5a`), D3 Education, D4
  `/creative` and `/engineering/into-your-stories`, D5 asset volume.
- Next plans: self-host assets (D5), `/engineering/notebound` and
  `/engineering/lacuriosity`, then GSAP removal.
EOF
git add docs/rebuild/REBUILD_PROGRESS.md
git commit -m "docs: log session 4 — engineering page rebuilt" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review

**Spec coverage.** The request: build "as close to" poulo.site as possible, understanding its animations and interactions. Mapped in the table above: loader (Task 5), scene-changing hero and vapor roles (6), pill nav and circular theme reveal (4), filterable works (3, 7), hover and edge masks (9). Gaps are listed in the table's "Skipped" row with reasons; none is silently dropped.

**Placeholder scan.** None of the usual markers. One step carries a conditional fallback with the exact replacement (the SVG `{...LINE}` spread in Task 5). Task 9 Step 4 says to report honestly if reduced motion cannot be emulated.

**Name consistency.** `SCENE_COUNT`, `sceneWeights`, `heroProgress` (Task 1) are the names `HeroScene` imports (Task 6). `makeStars`, `starCountFor`, `twinkle` (Task 2) match `Starfield`. `ALL`, `FILTERS`, `PROJECTS`, `filterProjects`, `countLabel`, `hashtag`, `Project` (Task 3) match `Works`/`ProjectCard` (Task 7) and the page (Task 8). `HERO_ROLES`, `EXPERIENCE`, `STACK` (Task 3) match the page. CSS variables `--w0..--w2` are written in `HeroScene` and read in `hero.css`; `--nav-bg`, `--hover`, `--hover-line`, `--logo-dim`, `--logo-dimmer` are defined in Task 8 and read in Tasks 4, 6, 7, 9. The hero section class is `eng-scene` and its inner grid keeps the v1 name `eng-hero`; job rows are `eng-role-row`, so only the hero uses `eng-role`.

**Known risks.**
- TikTok Sans must resolve in `next/font/google` for the installed Next version. It built in `d3f7869`, so it should.
- `animation-timeline: view()` reveals (`eng-reveal`) are inherited from the v1 study and are transform-only, so a failure leaves content visible.
- The circular theme reveal relies on the View Transitions API (Chromium, Safari 18+); Firefox gets an instant swap.
- Hero scene tuning (blend width, cloud speed, sun brightness) is by eye. The `emil-design-eng` skill is the right tool if the motion needs refining after Task 8.
