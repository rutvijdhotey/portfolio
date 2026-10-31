# Design plan: the poulo.site direction, translated

**Date:** 2026-10-31 (session 3)
**Status:** awaiting Rutvij's approval. No design code written yet.
**Method:** poulo.site was read in a real browser and inspected with the DOM
inspector. Everything in "What the site actually is" below is measured from
the live page, not remembered or guessed.

---

## 1. What poulo.site actually is

| Aspect | Measured |
|---|---|
| Stack | Next.js on Turbopack, Tailwind, shadcn/ui tokens, `dark` class on `<html>` |
| Default theme | **Dark.** `color-scheme: dark`, body background ≈ `#070707` |
| Token set | shadcn neutral scale (`--background`, `--muted-foreground: #737373`, `--border: #e5e5e5`), `--radius: 0.625rem` |
| Accent | One only: `--brand: #adfa1d` (lime), on near-black |
| Type | **TikTok Sans** (display + body), **IBM Plex Mono** (labels), **Reenie Beanie** (handwritten accent) |
| Tracking | Uniformly **-0.04em** at every size (16px → -0.64px, 48px → -1.92px) |
| Weights | 400, 500, 600 only. No 700+ |
| Scale seen | 14 / 15 / 16 / 18 / 31.5 / 32 / 48px |
| Nav | Fixed **pill** at `top-6`, centred, icon buttons + one filled CTA |
| Edges | Fixed gradient masks pinned top and bottom, `pointer-events-none` |
| Hero | **Pinned**: ~3.4 viewports of scroll with the headline cycling roles ("Technical Product Designer" → "AI Product Builder"); a hold-to-skip control ("Keep holding") |
| Motion | JS transforms (motion/framer style) on 78 elements; **no** CSS `animation-timeline`/`view()` |
| Accessibility | 4 `prefers-reduced-motion` blocks |
| Length | 16,268px document at 900px viewport — roughly 18 screens |

All three fonts are on Google Fonts and fetch successfully, so `next/font/google`
can serve them with no new vendor.

## 2. What to take, and what not to

**Take**
- Dark-first, near-black ground with a single accent.
- One typeface doing display and body, with tight uniform tracking.
- Mono for small structural labels (eyebrows, meta, counts).
- The fixed pill nav and the top/bottom gradient masks — they are what make it feel like an app.
- Generous vertical rhythm; sections that breathe.
- Filter chips over a project grid.

**Do not take**
- **The pinned, scroll-jacked hero.** 3.4 viewports of scroll before any content
  is the single biggest reason that site is 16,000px long. It fights the browser,
  it is hostile on a phone, and it is the opposite of goal #1 (fast and reliable).
- The cycling role headline. Rutvij has one role, not four.
- Reenie Beanie. The handwriting accent is Pouya's personality, not Rutvij's.
- Lime `#adfa1d`. Borrowing the exact accent is the one thing that would read as a copy.
- Any markup, CSS or asset from the site. All of this gets written from scratch.

## 3. Proposed system

### Colour
Keep the existing warm near-black already on the site (`#f0ede8` text on dark)
rather than importing Pouya's neutral grey. It suits photography, which is the
reason the site exists. Accent: pull a single colour from Rutvij's own
photographs via the manifest `tint` values (22 frames already carry an average
colour) instead of inventing one.

Both themes stay — the site already has a working three-tier token layer and a
light/dark toggle. Dark becomes the default.

### Type
- **Display + body:** TikTok Sans, weights 400/500/600, tracking -0.04em.
- **Labels/meta:** IBM Plex Mono, uppercase, letter-spaced positive.
- Drop the current serif display face **only if** Rutvij wants the poulo feel;
  the serif ("LaCuriosity", "About", "Notebound") is currently a real part of
  the site's character. **This is decision D1 below.**

### Layout
- Fixed pill nav, centre-top, with the theme toggle inside it.
- Max content width ~1100px, 24px gutters, 16px at 375px.
- Section rhythm on an 8px scale.
- Gradient masks top and bottom.

### Motion — the important part
Replace GSAP entirely with this order of preference:
1. **Content is visible by default.** No `from({opacity: 0})` anywhere. This is
   non-negotiable and is what fixes the reported breakage.
2. CSS `animation-timeline: view()` for scroll reveals, wrapped in
   `@supports`, so it costs zero JavaScript where it works.
3. A tiny IntersectionObserver fallback that only ever *adds* a class — if it
   never runs, the page is still complete.
4. View Transitions API for page-to-page.
5. A real `prefers-reduced-motion: reduce` branch that disables all of it.

GSAP (`gsap` + ScrollTrigger) comes out of `package.json` once nothing uses it.

## 4. Page by page

| Page | Change |
|---|---|
| `/` | Restyle to the system above. Keep the single-statement landing. |
| `/about` | Text-first, works with JS disabled. It already renders correctly — see the correction in REBUILD_PROGRESS. |
| `/engineering` | Server component. Two numbered parts: **1. Professional Experience** (YouTube, eBay, NetApp) and **2. Personal Projects** (LaCuriosity, Notebound). Filter chips if the list ever grows. |
| `/engineering/lacuriosity` | New. The architecture diagram moves here, lazy, with width/height. |
| `/engineering/notebound` | Optimised screenshots, `poster` on the video, `preload="none"`. |
| `/photography/...` | Unchanged in structure; served from self-hosted derivatives. |

### Professional Experience UI
The approved copy is three roles with dates and one sentence each. Proposal: a
vertical timeline rail with the company mark inline as SVG, the sentence as body
copy, and the dates in mono. It reveals on scroll via `view()`. No logos
hotlinked from Wikimedia — YouTube, eBay, NetApp, Penn State and PICT all get
inlined SVG marks.

## 5. Decisions needed before any code

- **D1 — Typeface.** Adopt TikTok Sans throughout (closest to poulo.site), or
  keep the current serif for display and use TikTok Sans only for body?
- **D2 — Accent colour.** Derive from a photograph's tint, or pick one?
- **D3 — Education.** Penn State M.Eng. and PICT B.E.: keep on `/engineering`,
  move to `/about`, or drop? (Open since session 1.)
- **D4 — `/creative` and `/engineering/into-your-stories`.** Keep, redirect or
  delete? Neither is in the planned structure.
- **D5 — Asset volume.** Self-hosting means committing 22 photos × 5 widths ×
  2 formats (220 files) plus the engineering assets into the repo. The 11 MB
  `movie.mp4` is the question: commit it, re-encode it smaller, or leave the
  video on Supabase while everything else moves?
