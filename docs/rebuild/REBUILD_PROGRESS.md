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
