# Rebuild: Speed + Engineering Restructure (handoff)

**Last updated:** 2026-10-31
**Branch:** `rebuild/speed-and-engineering`. No code has changed yet. This file is the only commit.
**Read this first in a new session.**

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

## Blockers for the next session
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

## Rutvij's working preferences
- Ask clarifying questions. Ask for text before screenshots.
- Break the work down by part. Keep a progress `.md` (this file). No PDFs.
- Give straight answers and real citations only.
- Remind him to start a new chat when the current one gets long.

## Log
- 2026-10-31: Diagnosis from source. Read the resume. The poulo.site fetch failed (network policy). Found the Supabase image projects are missing from the connected account. Repo attached with push access. Saved this handoff on branch `rebuild/speed-and-engineering`.
