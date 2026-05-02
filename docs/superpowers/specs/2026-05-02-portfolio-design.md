# Portfolio Website Design Spec
**Date:** 2026-05-02  
**Status:** All three portals demoed and approved — ready for Next.js conversion

---

## Overview

A personal brand portfolio website for Rutvij Dhotey. Primary goal: personal brand, with two distinct portals for professional (engineering) and creative (travel photography/videography) work.

**Inspiration:**
- Visual aesthetic: [Danik Bartolini](https://www.danikbartolini.com/) — minimal, moody, editorial
- Scroll experience: [Shopify Editions Winter 2026](https://www.shopify.com/editions/winter2026) — cinematic, scroll-driven storytelling

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js |
| Styling | Tailwind CSS |
| Animation | GSAP + ScrollTrigger |
| Deployment | Vercel |
| Repo | [github.com/rutvijdhotey/portfolio](https://github.com/rutvijdhotey/portfolio) |

---

## Site Architecture

```
/              → Split-screen homepage (gateway)
/engineering   → Professional portal (bio + projects)
/engineering/[slug] → Individual project pages
/creative      → Creative gallery portal
```

---

## Homepage (`/`)

**Concept:** Full-viewport split screen — left is Engineering, right is Creative. No scroll, no clutter. Two worlds, one choice.

**Left panel (Engineering):**
- Dark muted background with a minimalistic placeholder image at low opacity (user will provide final image)
- Text: "Engineering" heading + "Work experience & projects" subline
- "Enter →" CTA appears subtly at bottom

**Right panel (Creative):**
- Full-bleed travel photograph as background
- Minimal dark overlay so image breathes
- Text: "Creative" heading + "Travel & photography" subline
- "Enter →" CTA appears subtly at bottom

**Interactions:**
- Hovered side expands to 60%, other contracts to 40% — magnetic pull via GSAP CSS transition
- Background image scales subtly (1.03) on hover
- Clicking a panel: selected side expands to fill full viewport, other fades out — cinematic transition before routing
- Name "Rutvij Dhotey" centered at top, spans both panels, uses `mix-blend-mode: difference` so it reads on both dark and light backgrounds

**Mobile:** Stacked vertically — Engineering top (50vh), Creative bottom (50vh)

**Demo file:** `homepage-demo.html` (committed to repo)

---

## Engineering Portal (`/engineering`) — DEMO APPROVED

**Approach:** Hero = LaCuriosity project card, slim about strip, 2-col credentials below.

**Demo file:** `engineering-demo.html`

**Content:**
- Project: LaCuriosity — AI editorial platform (Claude + Gemini + Supabase), live at lacuriosity.com
- Hero image: Supabase cover `mskwqqbigtauakojpyhn.supabase.co/storage/v1/object/public/covers/2026-04-19T07:02:20.360Z.png`
- Bio: "Building systems that scale to billions at YouTube — and shipping AI products from scratch on the side."
- Experience: YouTube (SWE, current, Sunnyvale) · LaCuriosity (Founder & Engineer, side project)
- Education: Penn State M.Eng. CS&E 2015–2016 GPA 3.45 · PICT B.E. EE/ECE 2011–2015 Grade A+
- Skills: Claude API, Gemini API, Prompt Engineering, LLM Orchestration, Deep Learning, Computer Vision, Python, JS, C++, React, Django, Supabase
- Achievements: US Patent (Verified Video Reviews US20210158371) · Google Dev Scholarship (100k+) · Robotics National Winner IISC 2015
- Logos: YouTube (Wikimedia SVG) · Penn State Nittany Lion (Wikimedia PNG) · PICT (custom SVG seal)

---

## Creative Portal (`/creative`) — DEMO APPROVED

**Approach:** Curated editorial grid (Option B). Intentional layout where photos occupy hero or supporting slots — like a magazine spread. Phase 2 adds theme/destination structure.

**Demo file:** `creative-demo.html`

**Phase 1 (launch):** Pure flowing gallery — photos and videos mixed, no categories  
**Phase 2 (future):** Theme-first (People / Nature / Culture) with destinations inside each theme

**Content:** ~32 photos (Japan: 20, Switzerland: 5, loose: 7 incl. drone). Videos: local files, to be added.

### Layout

**Background:** Near-black `#0a0a0a` — gallery/museum wall feel, photos pop against dark.

**Header:** Slim fixed nav (`← Home` · `Rutvij Dhotey` · `Creative`). Page header section with large serif "Creative" title + right-aligned `Travel Photography & Film` subtitle.

**Grid:** Full-width, 4px gutter. Repeating row pattern:

| Row type | Columns | Cell height |
|---|---|---|
| Full-width hero | 1 | 65vh |
| Two halves | 1fr 1fr | 48vh |
| Large + small | 2fr 1fr | 52vh |
| Three thirds | 1fr 1fr 1fr | 40vh |
| Small + large | 1fr 2fr | 52vh |

Best shots (drone aerial, wide Japan landscapes) occupy full-width and 2fr hero slots. Detail/supporting shots fill 1fr cells. Videos use identical grid sizing with a subtle play icon on hover.

### Interactions

**Hover:** Photo scales to 1.04× + brightness lifts to 1.0. 0.85s cubic-bezier ease.

**Click → Full-screen takeover:**
1. Dark overlay fades in (`rgba(10,10,10,0.97)`)
2. Clicked photo animates in: `scale 0.95→1 + opacity 0→1`, 0.5s ease-out
3. Left/right arrow controls (← →) to navigate through all gallery images in sequence
4. ESC or `✕ Close` button exits — overlay fades out in 0.3s
5. Keyboard: `ArrowLeft`, `ArrowRight`, `Escape`
6. Counter shown at bottom: `3 / 20`
7. Videos: same takeover, native controls visible, autoplay on open

**No caption text** in full-screen view — photos speak for themselves. Phase 2 can add destination labels.

### Scroll Animations (GSAP ScrollTrigger)

- Page load: nav + header title fade up (staggered, 0.2–0.5s delay)
- Each gallery row: `opacity 0→1 + translateY 28px→0`, 0.9s ease-out, cells stagger 0.1s
- Trigger: `top 88%` — rows reveal just before fully in view

### Mobile

- All multi-column rows collapse to single column
- Full-width cells: 55vw height; other cells: 65vw height
- Full-screen takeover and keyboard/arrow nav unchanged
- Nav section label hidden to reduce clutter

---

## Build Order

All three portals designed as HTML demos first, then single conversion pass to Next.js.

## Open Questions

- [ ] Homepage: final engineering-side image (user to provide)
- [ ] Homepage: final creative-side travel photo (user to provide)
- [x] Creative portal: full design — DONE
- [ ] Creative portal: video hosting strategy for production (local files in demo; Supabase storage or Vercel Blob for Next.js build)
