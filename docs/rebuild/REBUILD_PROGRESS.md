# Rebuild: Speed + Engineering Restructure (handoff)

**Last updated:** 2026-10-31 (session 3)
**Branch:** `rebuild/speed-and-engineering`. No code has changed yet. Only docs.
**Read this first in a new session.** Then read `DESIGN_PLAN.md` next to this file.
**Both session-2 blockers are resolved — see "Session 3" at the bottom before
acting on anything above it. Several findings above are now known to be wrong.**

---

## Goal
1. Make `/about` and `/engineering` load fast and reliably. Today images fail to load and the pages break.
2. Restructure `/engineering` into **1. Professional Experience** and **2. Personal Projects**.
3. Redesign the site's look and interaction to match **https://www.poulo.site/**. Rutvij wants to stick closely to it. Build it as original code: no copied code or assets.

## Decisions made by Rutvij
| Topic | Decision |
|---|---|
| Images | **Self-host.** Pull from Supabase, generate smaller AVIF/WebP versions, and commit them to the repo (`public/img/...`) served by GitHub Pages. Stop depending on Supabase for images. |
| Experience | Approved the abstracted copy below. Show it with a **fun UI** in the spirit of poulo.site. |
| Projects | **LaCuriosity + Notebound only.** |
| Animations | Replace GSAP "hidden until JS" reveals. Match poulo.site's interaction style. |

### Approved Professional Experience copy (abstracted, no project details)
- **YouTube (Google)**: Software Engineer · Apr 2020 – Present
  *Backend engineering on the Shorts creation platform: distributed systems at billions-of-requests scale, cross-team launches, and mentoring engineers.*
- **eBay**: Software Engineer · Apr 2018 – Apr 2020
  *Backend services and machine learning for marketplace ranking and listing pricing.*
- **NetApp**: Member of Technical Staff · Feb 2017 – Apr 2018
  *Data-protection features and REST APIs for VMware backup and restore.*

Open: should Education (Penn State M.Eng. 2015–16, PICT B.E. 2011–15) stay on the page? Not answered yet.

---

## Blockers for the next session — BOTH RESOLVED in session 3
1. **Network policy.** These hosts were denied: `www.poulo.site`, `poulo.site`, `knlwzjvuqipjrjpgnovc.supabase.co`, `mskwqqbigtauakojpyhn.supabase.co`, `rutvijdhotey.com`. Rutvij is changing the environment's Network access before starting the new tab. Verify with `curl -sI https://www.poulo.site/` first.
2. **Supabase projects may be gone.** The connected Supabase account lists only `dcejrbyujfcxartywpis` (Travel Diary App). Neither image host is in it, so they may be deleted, paused, or under another account. If they don't respond, ask Rutvij for the original images (Drive, a folder or a zip).

---

## Diagnosis (from source code; not measured live)
### /engineering (`app/engineering/page.tsx`, `engineering.css`)
- **E1.** The architecture diagram is a raw ChatGPT PNG from Supabase. It loads eagerly with no width/height and no AVIF/WebP (`page.tsx:199`).
- **E2.** The whole page is `'use client'` with GSAP + ScrollTrigger, and `gsap.from({opacity:0})` covers nav, hero, sections and footer (`page.tsx:5-120`). Content stays invisible until JS runs, and stays broken if images fail.
- **E3.** The YouTube and Penn State logos are hotlinked from `upload.wikimedia.org` (`page.tsx:315, 351`).
- **E4.** The hero background is a Supabase AVIF/WebP with a CSS filter (`engineering.css:93-98`).
- **E5.** Two Supabase origins are configured (`next.config.ts`).

### /engineering/notebound
- **N1.** Four raw iPhone PNG screenshots: `${SHOTS}/IMG_1352..1355.PNG` (`notebound/page.tsx:79-87`).
- **N2.** Same GSAP opacity-from-0 pattern.
- **N3.** The video (`Videos/movie.mp4`) has no `poster`.

### /about
- No images in `app/about/page.tsx`. Rutvij reports images don't load and the site doesn't render properly. The cause is most likely the failing Supabase hosts (shared CSS/nav and landing background). Verify once network access is open.

### Image pipeline that already exists
- `scripts/photos/config.mjs`: masters at `knlwzj…/storage/v1/object/public/portfolio/Images`; widths `[480, 768, 1200, 1800, 2560]`; AVIF q55, WebP q78.
- `npm run photos:fetch`, then `photos:build`. These write `lib/photo-manifest.json` (dimensions + average colour).
- **Change needed:** the output goes to `public/img/` instead of `photos:upload`. Update `lib/` URL builders and `next.config.ts` to match.
- Engineering assets (diagram, screenshots, hero, video) are **outside** this pipeline today. Add them.

---

## Planned structure
```
/                          landing (restyle to the poulo.site direction)
/about                     text-first, works with zero JS
/engineering               server component
  ├─ 1. Professional Experience   (fun UI: YouTube, eBay, NetApp)
  └─ 2. Personal Projects         (cards → case studies)
/engineering/lacuriosity   NEW: diagram + pipeline details, lazy-loaded
/engineering/notebound     optimized screenshots, video poster, preload="none"
/photography/...           self-hosted derivatives
```

## Planned work, by part
- **Infra / assets:** self-host all images in `/public/img`, drop the Supabase hosts from `next.config.ts`, and inline the logos as SVG (YouTube, eBay, NetApp, Penn State, PICT).
- **Front end:** content visible by default. Use CSS scroll-driven animations (`animation-timeline: view()`) with an IntersectionObserver fallback, the View Transitions API for page transitions, and colour placeholders from the manifest. Remove GSAP if nothing still needs it.
- **Design:** study poulo.site first (layout, type, colour, motion). Write a short design plan and **get Rutvij's approval before coding.**
- **Verification:** Playwright (pre-installed) for page weight + LCP before/after, 375px overflow, reduced motion; `npm test`, `tsc`, `npm run build`. Repo CI runs the same checks.
- **Note:** `AGENTS.md` says this Next.js (16.2.4) has breaking changes. Read `node_modules/next/dist/docs/` before writing code.

## Next steps (in order)
1. Confirm the network is open (poulo.site, Supabase, the live site).
2. Measure the live site's baseline with Playwright.
3. Study poulo.site → design plan → **ask Rutvij to approve.**
4. Fetch the masters, build derivatives into `/public/img`, and repoint the URLs.
5. Rebuild `/engineering` (experience + projects), add `/engineering/lacuriosity`, and fix notebound.
6. Fix `/about` and apply the new design across the site.
7. Measure again, then open a PR from this branch (only when Rutvij asks).

## Local baseline (2026-10-31, session 2, before any changes)
- `npm ci` works (the npm registry bypasses the proxy). `npm test`: 81 pass, 0 fail. `tsc --noEmit`: clean. `npm run build`: 13 static routes, `out/` is 1.9 MB.
- The container runs Node v22.23.4, but `package.json` asks for `>=24`. The build works anyway. CI should use 24.
- `/engineering/into-your-stories` is a "Moved" stub. `/creative` exists too. Neither was mentioned in the plan above.
- The live baseline (Playwright on rutvijdhotey.com) is **not done yet** because of the network block.

## Rutvij's working preferences
- Ask clarifying questions. Ask for text before screenshots.
- Break the work down by part. Keep a progress `.md` (this file). No PDFs.
- Give straight answers and real citations only.
- Remind him to start a new chat when the current one gets long.

## Log
- 2026-10-31: Diagnosis from source. Read the resume. The poulo.site fetch failed (network policy). Found the Supabase image projects are missing from the connected account. Repo attached with push access. Saved this handoff on branch `rebuild/speed-and-engineering`.
- 2026-10-31 (session 2): Network **still closed**. The proxy answers 403 for every external host, including example.com, poulo.site, both Supabase hosts and rutvijdhotey.com. The WebFetch tool also fails (ENOTFOUND). Ran the local baseline (above). Steps 1–3 are blocked: waiting on Rutvij to change Network access, or to describe poulo.site in text.

---

## Session 2 — detail behind the baseline above

### Network: exactly which hosts, and what still works
Every host this rebuild needs is denied at the proxy
(`curl: (56) CONNECT tunnel failed, response 403`):
`www.poulo.site`, `poulo.site`, `rutvijdhotey.com`,
`knlwzjvuqipjrjpgnovc.supabase.co`, `mskwqqbigtauakojpyhn.supabase.co`,
`upload.wikimedia.org`. WebFetch fails separately with DNS `ENOTFOUND` for
both poulo.site hosts, so there is no second route to it.

Reachable: `registry.npmjs.org`, `fonts.googleapis.com`, `github.com`.
That is why `npm install`, the `next/font/google` fonts in
`app/layout.tsx`, and git all work while nothing image-related does.

**poulo.site was never read. No design plan has been written.** Writing one
from an invented description of that site would be worthless, so it is not
in this file.

### Extra baseline numbers
Beyond the section above: the export's `out/_next` is 1.1 MB of the 1.9 MB,
including **852 KB of JavaScript**. Page HTML: `index.html` 10.7 KB,
`about.html` 15.6 KB, `engineering.html` 23.0 KB. Build is Next.js 16.2.4
on Turbopack, 13 static routes, compile ~5.3 s.

### Correction to the previous diagnosis (E2)
The handoff says content "stays invisible until JS runs". That is **not
accurate**, and it changes the fix:
- `app/engineering/page.tsx` has 13 `gsap.from(...)` calls and **no
  `opacity: 0` in `engineering.css`** — the only `opacity` rules there are
  hover transitions (lines 47-49, 689-693). With JS disabled entirely the
  page renders **fully visible**.
- The real hazard is the **five `ScrollTrigger`-driven `from` tweens**:
  `.agent-section` (line 72), `.hero--02` children (82), `.about` (92),
  `.credentials` (102), `footer` (112). A `from` tween renders its start
  state immediately, so once JS runs those five regions are set to
  `opacity: 0` and are only revealed when their trigger fires. If trigger
  positions are computed against a layout that then changes — exactly what
  happens when the Supabase images 404 or load with no declared dimensions —
  those sections can stay at zero.
- So "the page breaks" is most likely **those five sections going blank
  after hydration**, not a blank page from the start. Confirm against the
  live site once the network is open.

### Confirmed external-asset map (everything that must be self-hosted)
Supabase host `knlwzjvuqipjrjpgnovc`:
| Where | What |
|---|---|
| `app/page.tsx:6` | landing hero poster (AVIF) |
| `app/engineering/page.tsx:200` | the raw ChatGPT architecture PNG |
| `app/engineering/engineering.css:93-94` | engineering hero AVIF/WebP |
| `app/engineering/notebound/page.tsx:11` | the four iPhone screenshots |
| `app/engineering/notebound/page.tsx:12` | `Videos/movie.mp4` |
| `lib/gallery-items.ts:19` | base URL for the whole photography gallery |
| `scripts/photos/config.mjs:4` | the pipeline's master host |

Supabase host `mskwqqbigtauakojpyhn`: only
`scripts/photos/build-covers.mjs:27,35`.
Hotlinked from Wikimedia: `app/engineering/page.tsx:315` (YouTube icon),
`:351` (Penn State logo). `next.config.ts:4-11` allows all four hosts.

### `/about` — the reported breakage is not an image on that page
`app/about/page.tsx` references **no images at all**, and the CSS it imports
(`photography.css`, `about.css`) contains no Supabase URLs. Whatever is wrong
on `/about` is therefore something else. Need Rutvij to describe what he
actually sees before guessing.

### Open questions for Rutvij
1. **poulo.site** — open Network access for it, or paste its HTML/CSS as text?
   (Nothing visual can be planned until one of these happens.)
2. **Education** (Penn State M.Eng. 2015-16, PICT B.E. 2011-15) — keep it on
   `/engineering`, drop it, or move it to `/about`? Still unanswered from
   session 1.
3. **`/about`** — what exactly looks wrong?
4. **`/creative` and `/engineering/into-your-stories`** — the stub and the
   extra page noted above are not in the planned structure. Keep, redirect,
   or delete?

### Log
- 2026-10-31 (session 2, cont.): Cloned the repo and checked out this branch,
  installed dependencies, re-verified the network block, ran the local
  baseline, mapped every external asset reference, and corrected diagnosis
  E2. No code changed. No design plan written — poulo.site is unreachable.

---

## Session 3 (2026-10-31) — blockers cleared, and three corrections

Run from Rutvij's own machine in the Claude desktop app, not the sandboxed
container the first two sessions used. That is the whole reason the blockers
lifted: **the network was never going to open in that container.**

### Blocker 1 — network: OPEN
Every host the rebuild needs answers from here:

| Host | Result |
|---|---|
| `rutvijdhotey.com` | 200 |
| `knlwzjvuqipjrjpgnovc.supabase.co` | 200 on real objects |
| `mskwqqbigtauakojpyhn.supabase.co` | host resolves |
| `upload.wikimedia.org` | 301 |
| `www.poulo.site` | 429 to curl (Vercel bot checkpoint), **200 in a real browser** |

poulo.site was read in the built-in browser and inspected with the DOM
inspector. The curl path hits a Vercel Security Checkpoint; that was not
worked around, the page was simply opened in a browser like any reader would.

### Blocker 2 — Supabase: NOT gone
Session 1 guessed the image projects were deleted because they were missing
from the connected Supabase account. They are alive. They are simply under a
different account than the MCP connector is signed in to. Measured:

| Asset | Size |
|---|---|
| `optimized/covers/creative-hero-poster.avif` | 160 KB |
| `optimized/covers/engineering-hero.avif` | 179 KB |
| `optimized/covers/engineering-hero.webp` | 212 KB |
| `Engineering/ChatGPT Image ….png` (architecture diagram) | **1.27 MB** |
| `Engineering/Into Your Stories/IMG_1352.PNG` | **3.54 MB** (one of four) |
| `Videos/movie.mp4` | **11.3 MB** |

So `/engineering/notebound` ships roughly **14 MB of raw iPhone PNGs** plus an
11 MB video with no poster. That, not the Supabase host, is the weight problem.

### Correction 1 — `/about` is not broken
`/about` was loaded live at 1440×900 and at 375×812. It renders correctly at
both, has **no console errors**, and has **no horizontal overflow** at 375px.
The session-1 theory that failing Supabase hosts were breaking it is wrong, and
open question 3 ("what exactly looks wrong?") is answered: on the live site, as
of today, nothing. If Rutvij still sees a problem it is browser- or
device-specific and needs a screenshot from him.

### Correction 2 — `/engineering` does not go blank, it flashes
Session 2 predicted five `ScrollTrigger` sections could stay at `opacity: 0`.
Measured live: **every section reports `opacity: 1`** — `.hero`, `.arch-section`,
`.hero--02`, `.agent-section`, `.about`, `.credentials`, `.contact`, footer. No
section is stuck hidden, and no image fails to load.

The real defect is a **cold-load flash**. A screenshot taken seconds after
navigation on a 375px viewport shows the hero as a full-bleed artwork with *no
text at all*; a later screenshot of the same scroll position shows the
headline, both paragraphs, the stat row and the tech chips. Hit-testing
confirms `.hero-content` sits at `z-index: 2`, `opacity: 1`, above `.hero-bg`.
So the content arrives late rather than never. **That delay is what "the page
doesn't render properly" means**, and it is caused by the GSAP intro plus heavy,
undeclared-dimension images — which is still fixed by the same change: make
content visible by default and stop animating it in.

### Correction 3 — the live page-weight number is misleading
`performance.getEntriesByType('resource')` reports **293 KB over 25 requests**
for `/engineering`. That figure is wrong to quote. The Supabase and Wikimedia
responses carry no `Timing-Allow-Origin` header, so their `transferSize` comes
back as **0**. The 1.27 MB diagram and the 179 KB hero are in that list at
0 KB. Real first-load weight is closer to **1.8 MB**. Any before/after
comparison has to measure bytes at the network layer, not from
`transferSize`.

### Minor, still worth fixing
`.hero-bg` has `transform: scale(1.04)`, so at 375px its right edge lands at
383px — 8px past the viewport. It does not cause document overflow today
(`scrollWidth === clientWidth`) because the parent clips it, but it is fragile.

### Environment notes
- Node **v25.8.1** here, so `engines: >=24` is satisfied. No need to downgrade.
- **Playwright is not installed** in this repo and is not a dependency. The
  session-1 note that it is "pre-installed" was true of the container only.
  Measurements above were taken with the built-in browser instead. If
  before/after numbers need to be reproducible in CI, Playwright has to be
  added deliberately.
- `npm` deps are installed (289 packages). Tests are `node --test` over
  `scripts/**/*.test.mjs` and `lib/**/*.test.ts`.

### What was produced
`docs/rebuild/DESIGN_PLAN.md` — the design plan that was blocked since session
1, now written from a real reading of poulo.site. It ends with five decisions
(D1–D5) that need Rutvij's answer before any code is written, which is the
order he asked for.

### Still not done, deliberately
Steps 4–7 (fetch masters, build derivatives, rebuild the pages). Rutvij's own
sequence puts design approval ahead of them, and D5 — whether 220 derivative
files and an 11 MB video get committed into the repo — changes what step 4
even does.

### Log
- 2026-10-31 (session 3): Ran from the desktop app. Confirmed network open and
  Supabase alive. Read poulo.site in a browser and measured its design system.
  Measured the live site at desktop and mobile. Corrected three findings from
  earlier sessions. Wrote `DESIGN_PLAN.md`. No code changed.

---

## Session 4 (2026-10-31, desktop app) — plan, previews, and design feedback

**Nothing was committed this session.** Rutvij has not asked for commits. Do not
commit until he does.

### Where things stand
| Item | State |
|---|---|
| Implementation plan | Written: `docs/superpowers/plans/2026-10-31-poulo-faithful-engineering-site.md` (Tasks 0-10). **Needs Revision A, see its top section**, before more tasks run. |
| Subagent-driven execution | Chosen by Rutvij. Task 0 (baseline) done. Task 1 (`lib/scene.ts` + `lib/scene.test.ts`) implemented by a subagent, which reported 8/8 tests and a clean `tsc`. **Not yet reviewed** by the spec or quality reviewer. Paused at Rutvij's request: he wants a lightweight preview before any more coding. |
| Preview v2 (all seven feedback points) | Saved: `docs/rebuild/preview/engineering-preview-v2.html`. Tested in the browser: hero scenes, both themes, scroll rail, experience buttons, project filter, stack grid, tour button; console clean. |
| Portrait reference photo | `docs/rebuild/reference/portrait-reference.png` (untracked; the repo may be public, so ask Rutvij before committing it). |
| Portrait | **Approved and built (session 5).** `components/engineering/Portrait.tsx` + pure `lib/gaze.ts` (5 tests). Mounted in `app/engineering_v1/page.tsx` in place of `CursorPortrait`. See "Session 5" below. |
| Uncommitted files | `lib/scene.ts`, `lib/scene.test.ts`, the plan, `docs/rebuild/preview/`, `docs/rebuild/reference/`, and Rutvij's own `components/CursorPortrait.tsx` redraw (**deleted in session 5 at his request**; the original is in git history). `.claude/` and the two `docs/superpowers/*2026-06-2x*` files were already untracked. |

Baseline measured at the start (Task 0): `npm test` 81 pass / 0 fail, `tsc --noEmit` clean,
`npm run lint` has **2 pre-existing errors** (`components/OverlayViewer.tsx:33` and
`components/ThemeToggle.tsx:12`, both `react-hooks/set-state-in-effect`). New code must not add
a third. For a theme reader, use `useSyncExternalStore` on `<html data-theme>` instead of
setState-in-effect.

### What poulo.site does (re-read live this session)
Measured from its CSS/DOM: keyframes `site-loader-failsafe`, `vapor-in`, `vapor-out`,
`hero-cloud-drift`, `hero-sun-breathe`, `theme-reveal`, `hw-wipe`; two full-viewport hero canvases.
Observed in screenshots: a line-art loader with a progress bar; a pinned hero whose background goes
starfield, then clouds, then sun rays as the role headline cycles; a fixed pill nav (5 icons, round
theme button, filled CTA); filter chips with "Showing N of N projects"; project blocks (framed UI
screenshot + chat-bubble pill on the left, text and a "Learn more" pill on the right, four small
feature cards below); a grey monochrome logo grid for the stack; a left-edge scroll rail of dashes.
**Not measured:** the timings and easings of its scroll-linked effects. Ours are tuned by eye.
Not copied: markup, CSS, assets, copy, the lime accent, the avatar, the keyboard art.

### Rutvij's seven feedback points on the first preview, and where each stands
1. **Portrait looks bad.** Make it nicer, keep pupils that follow the cursor, base it on the
   photo. v2 has a sticker-outline cartoon with pupil tracking, but it was drawn *before* he sent
   the photo and has known faults: skin far too pale, beard too heavy, no moustache/stubble
   distinction, hair reads as a helmet. **Redraw from the photo (see below), preview it, get his OK.**
2. **Light and dark must work on everything**, like poulo. Done in v2: one theme switch drives
   hero, nav, cards, mockups. This **overrides** the plan's "hero is always dark".
3. **Experience as buttons** (YouTube, eBay, NetApp) with details on select; the generic
   experience line when none is selected. Done in v2 (buttons newest-first; timeline
   chronological, proportional to months). Logos: Tabler has `ti-brand-youtube` only; eBay and
   NetApp fall back to text marks. Real build needs inline SVGs (open question).
4. **Projects** (Notebound, LaCuriosity) in poulo's block style with UI mockups of the site and
   the app. Done in v2 (browser mock; phone mock; four feature cards each). Copy sticks to facts
   already in the approved text.
5. **Stack as icons**, creative fallback when no icon. Done in v2: tiles, dashed monogram tile
   where no brand icon exists (Claude, Make.com, ElevenLabs).
6. **Left scroller** like poulo's. Done in v2: dashes, active one long and bright, name pill on
   hover/focus only (an always-on label collided with content in a 680px frame).
7. **Similar colour scheme, not many colours.** Done in v2: neutrals plus one clay accent
   `#d98b5a` (still D2-open).

### Portrait: what the reference photo shows (facts, to draw from)
Short dark hair, swept up at the front and to one side; thick dark eyebrows; a moustache plus short
stubble that follows the jaw (not a full thick beard); a wide open smile showing teeth; medium-brown
skin; in the photo he wears a black tuxedo jacket with satin lapels, white shirt, black bow tie and a
white boutonniere. The cartoon style to keep: bold dark outlines, flat fills, a thick sticker-style
outer outline, cut off flat at the chest. **Ask Rutvij** whether the outfit should be the tuxedo and
bow tie, or the camera strap the earlier `CursorPortrait.tsx` used.

### Preview-only simplifications (the real page differs)
The preview scrolls an inner pane and swaps themes instantly. The real page scrolls the window,
reveals the new theme as an expanding circle (View Transitions API), and has the camera intro loader,
which the preview does not show.

### What to do next, in order
1. Read this section, the plan (top section "Revision A"), and open the preview:
   `cd docs/rebuild/preview && python3 -m http.server 8765`, then
   http://localhost:8765/engineering-preview-v2.html (needs internet for the Tabler icon CSS).
2. ~~**Preview-first:** redraw the portrait from the photo and show it to Rutvij *before* touching~~ Done in session 5, see below.
   the repo's components. He asked for lightweight previews before code, and for work to be
   re-checked in a browser before it is shown.
3. Get answers to the open questions below.
4. Run the spec and quality reviewers on Task 1, then resume subagent-driven execution with the
   revised plan. Subagents must not commit.
5. Measure at the end (build, tests, 375px overflow, both themes, reduced motion).

### Open questions for Rutvij
- ~~Portrait outfit~~ Settled in session 5: a plain collared shirt, no tuxedo or camera.
- ~~Keep or delete `CursorPortrait.tsx`~~ Deleted in session 5 at Rutvij's request.
- Deleting `/engineering_v1..v3` and `VersionSwitch` (plan Task 8): fine? Recoverable from `d3f7869`.
- Logos for eBay, NetApp and Claude/Make/ElevenLabs: inline official SVGs, or the monogram fallback?
- Hero role titles (`Agentic AI Engineer` / `Backend Engineer` / `Systems Builder`) are my defaults.
- Still open from before: D2 accent colour, D3 Education, D4 `/creative` and
  `/engineering/into-your-stories`, D5 asset volume (including the 11 MB `movie.mp4`).
- May the reference photo be committed to the repo, or stay local?

### Rutvij's working preferences (additions)
- Show a lightweight preview in chat **before** coding. Re-check and test it in a browser first.
- No commits until he says so.

### Log
- 2026-10-31 (session 4): Re-read poulo.site; wrote the plan; ran Task 0 myself and Task 1 via a subagent;
  paused for a preview; built and browser-tested preview v2 from seven feedback points; saved
  preview, reference photo and this handoff. No commits.

## Session 5 (2026-10-31, desktop app) — portrait approved and built

**Nothing committed.** Rutvij has not asked for commits.

### What Rutvij decided about the portrait
He rejected the detailed cartoon (skin tone, teeth, lips, moustache, tuxedo) and asked for
**"super lightweight, just a simple outline like poulo's"**. Iterated in chat to:
- Monochrome like poulo's avatar: white face, near-black `#111` lines, flat `#2b2b2b` hair with
  one grey sweep line, one pale grey `#e2e2e2` stubble shape. No skin colour.
- Mouth is **one smile line**. No lips, teeth or moustache.
- **Simple round glasses** (two rims, bridge, arms to the ears).
- **A plain white collared shirt** (two collar points, button line, two buttons). No suit.
- Sticker edge in `currentColor`, so the parent's `color` makes it white on dark and black on
  light. No theme reader needed.
- Dot pupils follow the cursor; aimed from the eyes; off under reduced motion; drawn in the
  markup so it shows with JS off.

### What was built
| File | State |
|---|---|
| `lib/gaze.ts`, `lib/gaze.test.ts` | New. `gazeOffset(dx, dy)` -> pupil offset inside a 3.5 x 2.5 ellipse, eases in over 200px. 5 tests, written first. |
| `components/engineering/Portrait.tsx` | New client component, replaces `CursorPortrait` per Revision A. |
| `app/engineering_v1/page.tsx` | Import and one JSX line swapped to `Portrait`. |
| `components/CursorPortrait.tsx` | **Deleted** at Rutvij's request (his uncommitted redraw went with it). `tsc` clean and lint unchanged after. |

Checked: `tsc` clean; `npm test` 94/94; lint still only the 2 pre-existing errors; in the browser
at `/engineering_v1` the drawing renders, the pupils track both corners, the console is clean, a
light-theme colour swap works, the SVG is in the server HTML, and 375px has no overflow.
The final chat preview is also saved outside the repo in the session scratchpad (not needed).

### Next
Back to step 3 of "What to do next" above: open questions, then the Task 1 reviews, then the
revised plan via subagents (no commits).

### Log
- 2026-10-31 (session 5): portrait iterated in chat to a poulo-simple outline; built `Portrait` +
  `lib/gaze.ts`; verified in the browser. No commits.

## Session 5, part 2 (2026-10-31) — /engineering rebuilt, studies deleted

**Nothing committed.** Rutvij asked for the whole UI with his seven feedback points, to see it in
the browser, and said the other versions can go. Built directly (not via subagents); the
Revision A table in the plan was the spec, preview v2 the visual reference.

### Deleted (recoverable from `d3f7869`)
`app/engineering_v1..v3/`, `components/VersionSwitch.tsx`, `components/version-switch.css`, the old
GSAP `app/engineering/page.tsx` and `engineering.css`.

### Built
| File | What |
|---|---|
| `lib/stars.ts` (+test) | Seeded stars and rain (`makeDrops`, `dropY`). |
| `lib/profile.ts` (+test) | Roles, experience (with tag, months, years label), stack (mark or monogram), email, links. |
| `lib/experience.ts` (+test) | `timelineSegments(roles, now)`, `toggleSelection`. |
| `lib/projects.ts` (+test) | Projects with four feature cards and `mock: 'site' \| 'phone'`; filter and count. |
| `lib/sections.ts` (+test) | The five sections, `activeIndex`, `maskOpacity`. |
| `components/engineering/` | `PillNav`, `ThemeOrb` (no React state: both icons rendered, CSS picks), `useActiveSection` (useSyncExternalStore), `ScrollRail`, `HeroScene`, `Sky` (canvas), `EdgeMasks`, `Intro`/`IntroSeen`, `ExperienceSwitcher`, `Works`, `ProjectShowcase` (drawn site and phone mocks), `StackGrid`, `marks.tsx` (all icons inline), `Portrait`. |
| `app/engineering/` | `page.tsx` (server, static), `layout.tsx` (TikTok Sans + IBM Plex Mono), `engineering.css` (all styles, both themes). |

### The hero background (Rutvij asked where poulo's rain is)
Read live from poulo this session: its hero canvas draws **stars in dark mode and short grey rain
streaks under a pale mist in light mode**, and the sky also changes with scroll. Ours: scene one is
stars (dark) or rain + mist (light), then drifting clouds, then the sun with rays; the role headline
changes with each. Two canvases are rendered and CSS hides the wrong one; a hidden canvas stops
animating on its own (IntersectionObserver), so no theme reader exists anywhere.
Pinned (260svh) only at ≥1000×640 with motion allowed; otherwise one static viewport.

### Checked
`npm test` 120/120; `tsc` clean; lint only the 2 pre-existing errors; `npm run build` passes (one
run failed with a transient Turbopack `next/font/google` error while the dev server was running;
the rerun passed). In the browser at 1100×720: all three skies and roles, nav and rail active
states, experience select/overview, filter chips (Mobile app → 1 of 2), rail lights the last dash at
the bottom, light theme via the orb, no console errors after catching an aborted View Transition.
At 375px: no horizontal overflow, hero not pinned, rail hidden, timeline becomes stacked rows.
Static HTML contains every section. **Not checked in a browser:** reduced motion (CSS only),
the circular reveal itself (the emulated pane aborts View Transitions), a real phone.

### Stack: work tools added (same session)
Poulo has one "My Stack" section (one mixed logo grid plus a category text list). Rutvij chose one
section with two labelled groups: **At work** (C++, Python, Spanner, gRPC, REST, GCP — his list)
and **Side projects** (the project tools plus ChatGPT, placed there by me; move it if it was work).
`lib/profile.ts` `STACK` became `STACK_GROUPS`. Spanner, gRPC, REST and GCP use generic glyphs
(database, arrows, braces, cloud), not logos; C++, Python and ChatGPT use monograms. Checked at
1100px (work fits one row of six) and 375px (two columns, no overflow), both themes.

### Quote and credit (same session)
After Stack, as on poulo: Rutvij's quote "Build something that sparks an emotion, only then will it
be real! — Someone wise!", centred, in Caveat (one weight, loaded only on /engineering; poulo's
Reenie Beanie is not used). The footer now reads "Design referenced from poulo.site" with a link.
Postgres was added to Side projects as a "Pg" monogram tile.

### Still open (for Rutvij)
- Hero role titles are defaults. eBay and NetApp use text marks; the stack icons are simple
  sketches, with dashed monograms for Claude, Make.com and ElevenLabs.
- D2 accent, D3 Education, D4 `/creative` and `into-your-stories`, D5 assets, and whether the
  reference photo may be committed.
- Task 1 (`lib/scene.ts`) never had its spec/quality review.

## Session 6 (2026-10-31) — deploy prep, then glass nav, seasons, lake and vapor title

**Nothing committed yet.** Rutvij asked to ship `/engineering`; the deploy plan was ready (below),
then he asked for four poulo details first. All four are built and browser-checked.

### How the site deploys (checked, not guessed)
`origin` is `github.com/rutvijdhotey/portfolio`. GitHub Pages, `build_type: workflow`, custom
domain `rutvijdhotey.com` (HTTPS enforced). `.github/workflows/deploy.yml` runs on every push to
`main`: `npm test`, `tsc`, `npm run build`, upload `out/`. `ci.yml` runs the same on PRs (lint is
advisory). `main` has no branch protection; PRs have been merged with merge commits. PR #17 put
`d3f7869` on `main`, so `/engineering_v1..v3` are live until this lands.

### What poulo actually does (read live)
- **Glass nav**: no gradient. `bg white/35` (dark `white/10`), `border white/50` (dark `/15`),
  `backdrop-filter: blur(40px) saturate(2)`, shadow `0 10px 40px -10px`, inset 1px white top edge.
- **Sky**: changes on a **timer** (~3s), not scroll: clouds, sun, aurora, rain, snow.
- **Lake**: the "About me" button holds a wave-topped liquid layer parked below it, coloured by
  `--hero-liquid` per scene; holding the button fills it ("Keep holding").
- **Role title**: per-letter `vapor-out` (drift up, blur 14px, fade) and `vapor-in` (condense up
  from blur 12px, scale 1.35), staggered, ~6s per role.

### What we built (Rutvij chose: seasons none → rain → snow → sun, on a timer like poulo)
| File | What |
|---|---|
| `lib/seasons.ts` (+test) | `SEASONS`, `SEASON_MS` 3500, `ROLE_MS` 5000, `nextSeason`, `vaporWords` (seeded per text so SSR matches). |
| `lib/stars.ts` (+test) | Stars removed (season one is a clear sky); `makeFlakes`, `flakeAt` added for snow. |
| `lib/scene.ts` | **Deleted** with its test: the hero is no longer pinned or scroll-driven. |
| `HeroScene.tsx` | One viewport. `data-season` on a timer, paused off-screen and under reduced motion. |
| `HeroRoles.tsx` | New. Vapor swap; sr-only full role list; invisible sizers stop layout jumps. |
| `Sky.tsx` | `rain` / `snow`, animates only while its season shows (plus the fade). Colour read per frame. |
| `page.tsx`, `engineering.css` | Lake on "About me" (season colour, drifting wave, fills on press); glass nav and orb; "Skip intro", clouds and the scroll weights removed. |

Our lake sits a little higher than poulo's so a thin water line spans the button and the wave drifts.
Pressing fills it; a click still navigates as a normal link (no forced hold).

### Checked (static export in the browser)
Tests 118/118, `tsc` clean, lint only the 2 pre-existing errors, build passes. 1100px dark and light:
season order none → rain → snow → sun → none at 3.5s, roles every 5s with the vapor swap, lake
colour follows the season, glass nav, eyes still follow the cursor, no console errors. 375px both
themes: no horizontal scroll, seasons and lake work. **Not checked in a browser:** reduced motion
(the timers do not start; CSS stops the wave and vapor), a real phone.

Preview used to agree the design: `docs/rebuild/preview/glass-seasons-preview.html`.
