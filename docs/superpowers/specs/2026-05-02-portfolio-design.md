# Portfolio Website Design Spec
**Date:** 2026-05-02  
**Status:** In Progress — Engineering portal content pending

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

## Engineering Portal (`/engineering`) — DESIGN IN PROGRESS

**Approach:** Lead with featured projects (hero), bio is secondary.

**Content needed from user:**
- List of featured projects (name, description, live link if any)
- Work experience details
- Personal bio / tagline

---

## Creative Portal (`/creative`) — DESIGN PENDING

**Approach:** Start with pure gallery (Phase 1), evolve to theme → destination structure (Phase 2).

**Phase 1 (launch):** Pure flowing gallery — photos and videos mixed, no categories  
**Phase 2 (future):** Theme-first (People / Nature / Culture) with destinations inside each theme

**Content:** Some photos/videos already available, more coming after future trips.

---

## Open Questions

- [ ] Engineering portal: list of featured projects + work experience
- [ ] Engineering portal: personal bio / tagline
- [ ] Homepage: final engineering-side image (user to provide)
- [ ] Homepage: final creative-side travel photo (user to provide)
- [ ] Creative portal: full design (pending next session)
