# Next.js Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the three approved HTML demos (homepage, engineering portal, creative portal) into a production Next.js app and deploy to Vercel.

**Architecture:** App Router with one `page.tsx` per route (`/`, `/engineering`, `/creative`). Shared components (`GalleryGrid`, `OverlayViewer`) live in `components/`. All GSAP animations are client-side via `'use client'` + `useEffect`. Photos are served statically from `public/creative/`.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, GSAP 3, Vercel

---

## File Map

| File | Purpose |
|---|---|
| `app/globals.css` | CSS variables (`--bg`, `--text`, `--muted`, etc.) and base reset |
| `app/layout.tsx` | Root `<html>/<body>`, metadata, font links |
| `app/page.tsx` | Homepage split-screen — CSS `:has()` hover, GSAP entrance + click transition |
| `app/engineering/page.tsx` | Engineering portal — hero, about strip, credentials, GSAP scroll reveals |
| `app/creative/page.tsx` | Creative portal — page header, mounts GalleryGrid + OverlayViewer |
| `components/GalleryGrid.tsx` | Renders editorial grid rows; fires `onItemClick(globalIndex)` |
| `components/OverlayViewer.tsx` | Full-screen photo takeover with GSAP, arrow nav, keyboard shortcuts |
| `lib/gallery-items.ts` | Typed gallery data — row layout + photo paths |
| `public/creative/` | Static photo assets copied from Edited Photos folder |
| `next.config.ts` | Remote image hostname allow-list |
| `tailwind.config.ts` | Tailwind content paths |

---

## Task 1: Scaffold Next.js + Install Dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json` (via scaffold)

- [ ] **Step 1: Scaffold Next.js app**

Run from `/Users/rutvijdhotey/Documents/Personal Projects/Photo Video Website/`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```
Expected: scaffold completes, creates `app/`, `public/`, `package.json`, etc.

- [ ] **Step 2: Install GSAP**

```bash
npm install gsap
```
Expected: `gsap` appears in `package.json` dependencies.

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```
Open `http://localhost:3000` — should show Next.js default page. Stop with Ctrl+C.

- [ ] **Step 4: Commit scaffold**

```bash
git add package.json package-lock.json next.config.ts tailwind.config.ts tsconfig.json .eslintrc.json .gitignore
git commit -m "feat: scaffold Next.js 15 app with Tailwind + GSAP"
```

---

## Task 2: Global CSS + Root Layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/globals.css`**

```css
/* app/globals.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0a0a0a;
  --bg-eng: #0e0e0e;
  --text: #f0ede8;
  --muted: rgba(240,237,232,0.35);
  --faint: rgba(240,237,232,0.10);
  --accent: rgba(240,237,232,0.06);
  --serif: 'Georgia', 'Times New Roman', serif;
  --sans: 'Helvetica Neue', Arial, sans-serif;
  --gap: 4px;
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--serif);
  overflow-x: hidden;
}

a { color: inherit; text-decoration: none; }
```

- [ ] **Step 2: Replace `app/layout.tsx`**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rutvij Dhotey',
  description: 'Software engineer at YouTube and travel photographer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Run type check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: global CSS variables and root layout"
```

---

## Task 3: Homepage — Split-Screen

**Files:**
- Create: `app/page.tsx`
- Create: `app/home.css`

The homepage uses CSS `:has()` for hover (no GSAP needed for hover), and GSAP only for entrance animations and the click transition.

- [ ] **Step 1: Create `app/home.css`**

```css
/* app/home.css */
.split {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  cursor: default;
}

.panel {
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: width 0.7s cubic-bezier(0.76, 0, 0.24, 1);
  cursor: pointer;
}

.split:has(.panel:hover) .panel { width: 40%; }
.split:has(.panel:hover) .panel:hover { width: 60%; }

/* Engineering panel */
.panel--eng { background: var(--bg-eng); }

.panel--eng .bg-img {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80');
  background-size: cover;
  background-position: center;
  opacity: 0.18;
  transition: transform 0.9s cubic-bezier(0.76,0,0.24,1), opacity 0.7s ease;
}
.panel--eng:hover .bg-img { transform: scale(1.03); opacity: 0.25; }

.panel--eng .panel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to left, rgba(14,14,14,0.5) 0%, rgba(14,14,14,0.2) 50%, rgba(14,14,14,0.4) 100%);
}

/* Creative panel */
.panel--creative .bg-img {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80');
  background-size: cover;
  background-position: center;
  transition: transform 0.9s cubic-bezier(0.76,0,0.24,1);
}
.panel--creative:hover .bg-img { transform: scale(1.03); }

.panel--creative .panel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.2) 100%);
  transition: background 0.7s ease;
}
.panel--creative:hover .panel-overlay {
  background: linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.15) 100%);
}

/* Divider */
.divider {
  position: fixed;
  left: 50%;
  top: 0; bottom: 0;
  width: 1px;
  background: rgba(255,255,255,0.12);
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
  transition: left 0.7s cubic-bezier(0.76,0,0.24,1), opacity 0.4s;
}
.split:has(.panel--eng:hover) .divider { left: 60%; opacity: 0.06; }
.split:has(.panel--creative:hover) .divider { left: 40%; opacity: 0.06; }

/* Name */
.site-name {
  position: fixed;
  top: 36px;
  left: 0; right: 0;
  text-align: center;
  z-index: 20;
  pointer-events: none;
  letter-spacing: 0.25em;
  font-size: 11px;
  font-family: var(--sans);
  font-weight: 400;
  color: rgba(255,255,255,0.9);
  text-transform: uppercase;
  mix-blend-mode: difference;
}

/* Panel content */
.panel__content {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
  opacity: 0; /* GSAP animates in */
}

.panel__heading {
  font-size: clamp(28px, 3.5vw, 52px);
  font-weight: 400;
  line-height: 1.1;
  color: rgba(255,255,255,0.9);
  margin-bottom: 20px;
  transition: opacity 0.4s;
}

.panel__sub {
  font-family: var(--sans);
  font-size: 12px;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.3);
  transition: color 0.4s, transform 0.4s;
  transform: translateY(4px);
}
.panel:hover .panel__sub { color: rgba(255,255,255,0.55); transform: translateY(0); }

.panel__enter {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  transition: color 0.4s, transform 0.5s;
  white-space: nowrap;
}
.panel:hover .panel__enter {
  color: rgba(255,255,255,0.6);
  transform: translateX(-50%) translateY(-4px);
}

/* Mobile */
@media (max-width: 768px) {
  .split { flex-direction: column; }
  .panel { width: 100% !important; height: 50vh; }
  .divider { display: none; }
  .split:has(.panel:hover) .panel { width: 100%; }
  .site-name { mix-blend-mode: normal; }
}
```

- [ ] **Step 2: Create `app/page.tsx`**

```tsx
// app/page.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import './home.css'

export default function Home() {
  const engRef = useRef<HTMLDivElement>(null)
  const creativeRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.panel__content', {
        opacity: 1,
        duration: 1.4,
        ease: 'power3.out',
        stagger: 0.2,
        delay: 0.3,
      })
      gsap.from('.site-name', {
        opacity: 0,
        y: -10,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.6,
      })
      gsap.from('.divider', {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 1.4,
        ease: 'power3.inOut',
        delay: 0.2,
      })
    })
    return () => ctx.revert()
  }, [])

  function navigate(dest: 'engineering' | 'creative') {
    const panel = dest === 'engineering' ? engRef.current : creativeRef.current
    const other = dest === 'engineering' ? creativeRef.current : engRef.current
    gsap.to(other, { opacity: 0, duration: 0.4, ease: 'power2.in' })
    gsap.to(panel, {
      width: '100vw',
      duration: 0.7,
      ease: 'power3.inOut',
      onComplete: () => router.push(`/${dest}`),
    })
  }

  return (
    <>
      <div className="site-name">Rutvij Dhotey</div>
      <div className="divider" />
      <div className="split">
        <div ref={engRef} className="panel panel--eng" onClick={() => navigate('engineering')}>
          <div className="bg-img" />
          <div className="panel-overlay" />
          <div className="panel__content">
            <h2 className="panel__heading">Engineering</h2>
            <p className="panel__sub">Work experience &amp; projects</p>
          </div>
          <div className="panel__enter">Enter →</div>
        </div>

        <div ref={creativeRef} className="panel panel--creative" onClick={() => navigate('creative')}>
          <div className="bg-img" />
          <div className="panel-overlay" />
          <div className="panel__content">
            <h2 className="panel__heading">Creative</h2>
            <p className="panel__sub">Travel &amp; photography</p>
          </div>
          <div className="panel__enter">Enter →</div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Run type check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Start dev server and verify homepage**

```bash
npm run dev
```
Open `http://localhost:3000`. Verify:
- Split-screen renders, both panels visible
- Hovering expands one side to ~60%
- GSAP entrance animation plays (panels fade in, name slides down, divider scales up)
- Clicking Engineering → expands + navigates to `/engineering` (404 is expected, page not built yet)
- Clicking Creative → same for `/creative`

Stop server with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/home.css
git commit -m "feat: homepage split-screen with GSAP entrance and click transition"
```

---

## Task 4: Engineering Portal

**Files:**
- Create: `app/engineering/page.tsx`
- Create: `app/engineering/engineering.css`

Port `engineering-demo.html` to React. GSAP scroll animations use `ScrollTrigger`.

- [ ] **Step 1: Create `app/engineering/engineering.css`**

Copy all styles from `engineering-demo.html` between `<style>` tags, removing the `:root` block (already in globals.css) and the `html`/`body` rules. Save as `app/engineering/engineering.css`.

The full CSS (paste verbatim from `engineering-demo.html` lines 10–473, minus `:root`, `html`, `body`):

```css
/* app/engineering/engineering.css */

/* ── NAV ── */
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 48px;
  background: linear-gradient(to bottom, rgba(14,14,14,0.95) 0%, transparent 100%);
}
.nav-back {
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.3s, transform 0.3s;
  cursor: pointer;
}
.nav-back:hover { color: var(--text); transform: translateX(-3px); }
.nav-name {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.75);
  mix-blend-mode: difference;
}
.nav-section {
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--muted);
}

/* ── HERO ── */
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: flex-end;
  padding: 80px 48px;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background-image: url('https://mskwqqbigtauakojpyhn.supabase.co/storage/v1/object/public/covers/2026-04-19T07:02:20.360Z.png');
  background-size: cover;
  background-position: center;
  filter: brightness(0.62) saturate(0.85);
  transform: scale(1.04);
  transition: transform 8s ease;
}
.hero:hover .hero-bg { transform: scale(1.0); }
.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(14,14,14,0.92) 0%, rgba(14,14,14,0.4) 50%, rgba(14,14,14,0.6) 100%),
    linear-gradient(to right, rgba(14,14,14,0.5) 0%, transparent 60%);
}
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(240,237,232,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(240,237,232,0.02) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 760px;
}
.hero-eyebrow {
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 20px;
}
.hero-title {
  font-size: clamp(52px, 8vw, 120px);
  font-weight: 400;
  line-height: 0.95;
  color: var(--text);
  margin-bottom: 28px;
  letter-spacing: -0.02em;
}
.hero-desc {
  font-family: var(--sans);
  font-size: 14px;
  line-height: 1.7;
  color: rgba(240,237,232,0.55);
  max-width: 480px;
  margin-bottom: 36px;
}
.hero-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; }
.tag {
  font-family: var(--sans);
  font-size: 9px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--muted);
  border: 1px solid var(--faint);
  padding: 6px 14px;
  transition: color 0.3s, border-color 0.3s;
}
.tag:hover { color: var(--text); border-color: rgba(240,237,232,0.3); }
.hero-cta {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: gap 0.3s;
}
.hero-cta:hover { gap: 16px; }
.hero-scroll-hint {
  position: absolute;
  bottom: 40px; right: 48px;
  z-index: 2;
  font-family: var(--sans);
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.2);
  writing-mode: vertical-rl;
}

/* ── DIVIDER ── */
.rule { width: 100%; height: 1px; background: var(--faint); }

/* ── ABOUT ── */
.about {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 40px;
  align-items: center;
  padding: 64px 48px;
  border-bottom: 1px solid var(--faint);
}
.about-role {
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--muted);
  line-height: 1.8;
}
.about-bio {
  font-size: clamp(16px, 1.5vw, 20px);
  font-weight: 400;
  line-height: 1.55;
  color: rgba(240,237,232,0.8);
  text-align: center;
}
.about-location {
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--muted);
  text-align: right;
  line-height: 1.8;
}

/* ── CREDENTIALS ── */
.credentials { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.cred-col { padding: 72px 48px; border-bottom: 1px solid var(--faint); }
.cred-col:first-child { border-right: 1px solid var(--faint); }
.cred-section { margin-bottom: 56px; }
.cred-section:last-child { margin-bottom: 0; }
.cred-label {
  font-family: var(--sans);
  font-size: 9px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.25);
  margin-bottom: 28px;
}
.exp-item {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--accent);
}
.exp-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.entry-logo { flex-shrink: 0; width: 40px; height: 40px; margin-top: 2px; }
.entry-info { flex: 1; }
.exp-company { font-size: 18px; font-weight: 400; color: var(--text); margin-bottom: 4px; }
.exp-role { font-family: var(--sans); font-size: 11px; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 4px; }
.exp-date { font-family: var(--sans); font-size: 10px; letter-spacing: 0.15em; color: rgba(240,237,232,0.2); }
.edu-item { display: flex; gap: 18px; align-items: flex-start; margin-bottom: 28px; }
.edu-item:last-child { margin-bottom: 0; }
.edu-school { font-size: 18px; font-weight: 400; color: var(--text); margin-bottom: 4px; }
.edu-degree { font-family: var(--sans); font-size: 11px; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 3px; }
.edu-date { font-family: var(--sans); font-size: 10px; letter-spacing: 0.15em; color: rgba(240,237,232,0.2); }
.skills-group { margin-bottom: 28px; }
.skills-group:last-child { margin-bottom: 0; }
.skills-group-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sans);
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.2);
  margin-bottom: 12px;
}
.skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-chip {
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.15em;
  color: rgba(240,237,232,0.55);
  border: 1px solid var(--faint);
  padding: 5px 12px;
  transition: color 0.3s, border-color 0.3s;
}
.skill-chip:hover { color: var(--text); border-color: rgba(240,237,232,0.25); }
.achievement-item { display: flex; gap: 20px; margin-bottom: 24px; align-items: flex-start; }
.achievement-item:last-child { margin-bottom: 0; }
.achievement-mark { font-family: var(--sans); font-size: 9px; color: rgba(240,237,232,0.2); margin-top: 3px; flex-shrink: 0; }
.achievement-text { font-family: var(--sans); font-size: 12px; line-height: 1.6; color: var(--muted); }
.achievement-text strong { color: rgba(240,237,232,0.75); font-weight: 500; }

/* ── FOOTER ── */
footer {
  padding: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer-name { font-family: var(--sans); font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(240,237,232,0.2); }
.footer-links { display: flex; gap: 32px; }
.footer-link {
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.25);
  text-decoration: none;
  transition: color 0.3s;
  cursor: pointer;
}
.footer-link:hover { color: rgba(240,237,232,0.7); }

/* ── MOBILE ── */
@media (max-width: 768px) {
  nav { padding: 20px 24px; }
  .nav-section { display: none; }
  .hero { padding: 100px 24px 60px; height: auto; min-height: 100vh; }
  .hero-scroll-hint { display: none; }
  .about { grid-template-columns: 1fr; padding: 48px 24px; gap: 20px; }
  .about-location { text-align: left; }
  .credentials { grid-template-columns: 1fr; }
  .cred-col { padding: 48px 24px; border-right: none !important; }
  footer { padding: 32px 24px; flex-direction: column; gap: 20px; text-align: center; }
}
```

- [ ] **Step 2: Create `app/engineering/page.tsx`**

```tsx
// app/engineering/page.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './engineering.css'

gsap.registerPlugin(ScrollTrigger)

export default function Engineering() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-eyebrow', { opacity: 0, y: 20, duration: 1, ease: 'power3.out', delay: 0.3 })
      gsap.from('.hero-title',   { opacity: 0, y: 40, duration: 1.3, ease: 'power3.out', delay: 0.5 })
      gsap.from('.hero-desc',    { opacity: 0, y: 20, duration: 1, ease: 'power3.out', delay: 0.75 })
      gsap.from('.hero-tags',    { opacity: 0, y: 16, duration: 0.9, ease: 'power3.out', delay: 0.9 })
      gsap.from('.hero-cta',     { opacity: 0, y: 12, duration: 0.9, ease: 'power3.out', delay: 1.05 })
      gsap.from('nav > *',       { opacity: 0, y: -10, duration: 1, ease: 'power3.out', delay: 0.2, stagger: 0.08 })

      gsap.from('.about > *', {
        scrollTrigger: { trigger: '.about', start: 'top 80%' },
        opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.15,
      })
      gsap.from('.cred-section', {
        scrollTrigger: { trigger: '.credentials', start: 'top 75%' },
        opacity: 0, y: 30, duration: 1, ease: 'power3.out', stagger: 0.12,
      })
      gsap.from('footer > *', {
        scrollTrigger: { trigger: 'footer', start: 'top 90%' },
        opacity: 0, y: 16, duration: 0.8, ease: 'power3.out', stagger: 0.1,
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <>
      <nav>
        <Link href="/" className="nav-back">← Home</Link>
        <span className="nav-name">Rutvij Dhotey</span>
        <span className="nav-section">Engineering</span>
      </nav>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-grid" />
        <div className="hero-content">
          <p className="hero-eyebrow">Featured Project · 01</p>
          <h1 className="hero-title">La<br />Curiosity</h1>
          <p className="hero-desc">
            An AI-powered editorial platform with a fully automated content pipeline.
            Orchestrates Claude and Gemini to research, write, and publish —
            with Supabase as the backbone.
          </p>
          <div className="hero-tags">
            {['Claude API','Gemini API','Supabase','React','Python','Prompt Engineering'].map(t => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
          <a href="https://lacuriosity.com" className="hero-cta" target="_blank" rel="noopener">
            View Project <span>→</span>
          </a>
        </div>
        <span className="hero-scroll-hint">Scroll to explore</span>
      </section>

      <div className="rule" />

      <section className="about">
        <div className="about-role">
          Software Engineer<br />
          YouTube · Google<br />
          Sunnyvale, CA
        </div>
        <p className="about-bio">
          Building systems that scale to billions at YouTube —
          and shipping AI products from scratch on the side.
        </p>
        <div className="about-location">
          rutvij.dhotey<br />
          @gmail.com<br />
          <a href="https://github.com/rutvijdhotey" target="_blank" rel="noopener">github ↗</a>
        </div>
      </section>

      <section className="credentials">
        <div className="cred-col">
          <div className="cred-section">
            <p className="cred-label">Experience</p>
            <div className="exp-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="entry-logo" src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube" style={{objectFit:'contain',background:'rgba(240,237,232,0.07)',borderRadius:'6px',padding:'10px'}} />
              <div className="entry-info">
                <div className="exp-company">YouTube</div>
                <div className="exp-role">Software Engineer</div>
                <div className="exp-date">Current · Sunnyvale, CA</div>
              </div>
            </div>
            <div className="exp-item">
              <svg className="entry-logo" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="6" fill="rgba(240,237,232,0.07)"/><circle cx="20" cy="19" r="9" stroke="rgba(240,237,232,0.55)" strokeWidth="1.2"/><circle cx="20" cy="19" r="4.5" stroke="rgba(240,237,232,0.35)" strokeWidth="1"/><line x1="20" y1="10" x2="20" y2="14" stroke="rgba(240,237,232,0.4)" strokeWidth="1.2" strokeLinecap="round"/><line x1="20" y1="24" x2="20" y2="28" stroke="rgba(240,237,232,0.4)" strokeWidth="1.2" strokeLinecap="round"/><line x1="11" y1="19" x2="15" y2="19" stroke="rgba(240,237,232,0.4)" strokeWidth="1.2" strokeLinecap="round"/><line x1="25" y1="19" x2="29" y2="19" stroke="rgba(240,237,232,0.4)" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <div className="entry-info">
                <div className="exp-company">LaCuriosity</div>
                <div className="exp-role">Founder &amp; Engineer</div>
                <div className="exp-date">Side Project</div>
              </div>
            </div>
          </div>

          <div className="cred-section">
            <p className="cred-label">Education</p>
            <div className="edu-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="entry-logo" src="https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Penn_State_Nittany_Lions_logo.svg/250px-Penn_State_Nittany_Lions_logo.svg.png" alt="Penn State" style={{objectFit:'contain',background:'rgba(240,237,232,0.07)',borderRadius:'6px',padding:'4px'}} />
              <div className="entry-info">
                <div className="edu-school">Penn State University</div>
                <div className="edu-degree">M.Eng. Computer Science &amp; Engineering</div>
                <div className="edu-date">2015 – 2016 · GPA 3.45 · ML &amp; Computer Vision</div>
              </div>
            </div>
            <div className="edu-item">
              <svg className="entry-logo" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="6" fill="rgba(240,237,232,0.07)"/><circle cx="20" cy="20" r="16" stroke="#8a9bb5" strokeWidth="0.9"/><circle cx="20" cy="20" r="13.8" stroke="#6b7e9a" strokeWidth="0.5"/><circle cx="20" cy="20" r="10" stroke="#7a9fc4" strokeWidth="0.9"/><ellipse cx="20" cy="20" rx="5.5" ry="10" stroke="#6b8fb5" strokeWidth="0.7"/><ellipse cx="20" cy="20" rx="10" ry="5.5" stroke="#6b8fb5" strokeWidth="0.7"/><text x="20" y="22.5" fontFamily="Helvetica Neue, Arial, sans-serif" fontSize="5.5" fontWeight="700" fill="#a8bdd4" textAnchor="middle" letterSpacing="1">PICT</text></svg>
              <div className="entry-info">
                <div className="edu-school">Pune Institute of Computer Technology</div>
                <div className="edu-degree">B.E. Electrical, Electronics &amp; Communications Engineering</div>
                <div className="edu-date">2011 – 2015 · Grade A+ · Embedded Systems &amp; RTOS</div>
              </div>
            </div>
          </div>
        </div>

        <div className="cred-col">
          <div className="cred-section">
            <p className="cred-label">Skills</p>
            {[
              { label: 'AI / ML', chips: ['Claude API','Gemini API','Prompt Engineering','LLM Orchestration','Deep Learning','Computer Vision','Neural Networks'] },
              { label: 'Languages', chips: ['Python','JavaScript','C++'] },
              { label: 'Web & Data', chips: ['React.js','Django','Supabase','REST APIs','Tailwind CSS'] },
            ].map(group => (
              <div key={group.label} className="skills-group">
                <div className="skills-group-label">{group.label}</div>
                <div className="skills-list">
                  {group.chips.map(c => <span key={c} className="skill-chip">{c}</span>)}
                </div>
              </div>
            ))}
          </div>

          <div className="cred-section">
            <p className="cred-label">Recognition</p>
            {[
              { n: '01', text: <><strong>US Patent</strong> — "Verified Video Reviews" (US 20210158371), filed 2019</> },
              { n: '02', text: <><strong>Google Developer Challenge Scholarship</strong> — selected from 100,000+ applicants, 2018</> },
              { n: '03', text: <><strong>Robotics National Winner</strong> — IISC Bangalore, 2015</> },
            ].map(a => (
              <div key={a.n} className="achievement-item">
                <span className="achievement-mark">{a.n}</span>
                <span className="achievement-text">{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <span className="footer-name">© 2026 Rutvij Dhotey</span>
        <nav className="footer-links">
          <a href="https://linkedin.com/in/rutvij-dhotey" className="footer-link" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://github.com/rutvijdhotey" className="footer-link" target="_blank" rel="noopener">GitHub</a>
          <Link href="/" className="footer-link">← Home</Link>
        </nav>
      </footer>
    </>
  )
}
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```
Open `http://localhost:3000/engineering`. Verify:
- Hero with LaCuriosity background image renders
- GSAP entrance animations play for eyebrow, title, desc, tags, cta
- Scrolling reveals about strip and credentials sections
- Back link routes to homepage
- Stop server.

- [ ] **Step 5: Commit**

```bash
git add app/engineering/page.tsx app/engineering/engineering.css
git commit -m "feat: engineering portal with GSAP scroll reveals"
```

---

## Task 5: Copy Photos + Define Gallery Data

**Files:**
- Create: `lib/gallery-items.ts`
- Create: `public/creative/` (photo assets)
- Modify: `.gitignore`

- [ ] **Step 1: Copy photos to public**

```bash
mkdir -p public/creative/Japan public/creative/Switzerland
cp "/Users/rutvijdhotey/Documents/Edited Photos/Photos for Website/Japan/"*.jpg public/creative/Japan/
cp "/Users/rutvijdhotey/Documents/Edited Photos/Photos for Website/Switzerland/"*.jpg public/creative/Switzerland/
cp "/Users/rutvijdhotey/Documents/Edited Photos/Photos for Website/"*.jpg public/creative/
```
Expected: 32 photos land in `public/creative/`.

- [ ] **Step 2: Gitignore large photo files**

Add to `.gitignore`:
```
# Large photo assets — served from public but not committed
public/creative/
```

- [ ] **Step 3: Create `lib/gallery-items.ts`**

```typescript
// lib/gallery-items.ts

export type GalleryLayout = 'full' | 'halves' | 'large-small' | 'small-large' | 'thirds'
export type MediaType = 'photo' | 'video'

export interface GalleryItem {
  src: string
  alt: string
  type: MediaType
}

export interface GalleryRow {
  layout: GalleryLayout
  items: GalleryItem[]
}

export const galleryRows: GalleryRow[] = [
  {
    layout: 'full',
    items: [
      { src: '/creative/dji_fly_20230512_173012_662_1684010304506_photo_optimized.jpg', alt: 'Aerial', type: 'photo' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: '/creative/Japan/RJ405649.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/Japan/RJ405760.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'large-small',
    items: [
      { src: '/creative/Switzerland/RJ400991.jpg', alt: 'Switzerland', type: 'photo' },
      { src: '/creative/Japan/RJ405651.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'thirds',
    items: [
      { src: '/creative/Japan/RJ405690.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/Japan/RJ405702.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/DSC04641.jpg', alt: 'Photo', type: 'photo' },
    ],
  },
  {
    layout: 'small-large',
    items: [
      { src: '/creative/IMG_8880.jpg', alt: 'Photo', type: 'photo' },
      { src: '/creative/Japan/RJ405720.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'full',
    items: [
      { src: '/creative/Japan/RJ405757.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: '/creative/Switzerland/RJ401212.jpg', alt: 'Switzerland', type: 'photo' },
      { src: '/creative/Japan/RJ405808.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
  {
    layout: 'thirds',
    items: [
      { src: '/creative/Japan/RJ405817.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/Japan/RJ405829.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/Switzerland/RJ401219.jpg', alt: 'Switzerland', type: 'photo' },
    ],
  },
  {
    layout: 'large-small',
    items: [
      { src: '/creative/Japan/RJ405850.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/DSC07277.jpg', alt: 'Photo', type: 'photo' },
    ],
  },
  {
    layout: 'halves',
    items: [
      { src: '/creative/Japan/RJ405873.jpg', alt: 'Japan', type: 'photo' },
      { src: '/creative/Japan/RJ405894.jpg', alt: 'Japan', type: 'photo' },
    ],
  },
]

export const allItems: GalleryItem[] = galleryRows.flatMap(r => r.items)
```

- [ ] **Step 4: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/gallery-items.ts .gitignore
git commit -m "feat: gallery data types and row layout config"
```

---

## Task 6: GalleryGrid Component

**Files:**
- Create: `components/GalleryGrid.tsx`
- Create: `components/gallery.css`

- [ ] **Step 1: Create `components/gallery.css`**

```css
/* components/gallery.css */

/* ── GALLERY ── */
.gallery { padding: var(--gap); padding-top: 0; }

.gallery-row {
  display: grid;
  gap: var(--gap);
  margin-bottom: var(--gap);
}

.gallery-row.r-full       { grid-template-columns: 1fr; }
.gallery-row.r-halves     { grid-template-columns: 1fr 1fr; }
.gallery-row.r-large-small { grid-template-columns: 2fr 1fr; }
.gallery-row.r-small-large { grid-template-columns: 1fr 2fr; }
.gallery-row.r-thirds     { grid-template-columns: 1fr 1fr 1fr; }

.gallery-row.r-full        .gallery-cell { height: 65vh; }
.gallery-row.r-halves      .gallery-cell { height: 48vh; }
.gallery-row.r-large-small .gallery-cell { height: 52vh; }
.gallery-row.r-small-large .gallery-cell { height: 52vh; }
.gallery-row.r-thirds      .gallery-cell { height: 40vh; }

.gallery-cell {
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: #111;
}

.gallery-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.85s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease;
  filter: brightness(0.9);
}

.gallery-cell:hover img { transform: scale(1.04); filter: brightness(1); }

/* ── MOBILE ── */
@media (max-width: 768px) {
  .gallery-row.r-halves,
  .gallery-row.r-large-small,
  .gallery-row.r-small-large,
  .gallery-row.r-thirds { grid-template-columns: 1fr; }

  .gallery-row.r-full        .gallery-cell { height: 55vw; }
  .gallery-row.r-halves      .gallery-cell,
  .gallery-row.r-large-small .gallery-cell,
  .gallery-row.r-small-large .gallery-cell,
  .gallery-row.r-thirds      .gallery-cell { height: 65vw; }
}
```

- [ ] **Step 2: Create `components/GalleryGrid.tsx`**

```tsx
// components/GalleryGrid.tsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GalleryRow, allItems } from '@/lib/gallery-items'
import './gallery.css'

gsap.registerPlugin(ScrollTrigger)

const layoutClass: Record<GalleryRow['layout'], string> = {
  'full': 'r-full',
  'halves': 'r-halves',
  'large-small': 'r-large-small',
  'small-large': 'r-small-large',
  'thirds': 'r-thirds',
}

interface Props {
  rows: GalleryRow[]
  onItemClick: (globalIndex: number) => void
}

export default function GalleryGrid({ rows, onItemClick }: Props) {
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rowEls = galleryRef.current?.querySelectorAll<HTMLElement>('.gallery-row')
      rowEls?.forEach(row => {
        gsap.from(row.querySelectorAll('.gallery-cell'), {
          scrollTrigger: { trigger: row, start: 'top 88%' },
          opacity: 0,
          y: 28,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.1,
        })
      })
    }, galleryRef)
    return () => ctx.revert()
  }, [])

  // Compute per-row start offsets so globalIndex is stable across renders
  const rowOffsets = rows.reduce<number[]>((acc, row) => {
    acc.push((acc[acc.length - 1] ?? 0) + (rows[acc.length - 1]?.items.length ?? 0))
    return acc
  }, [])

  return (
    <main className="gallery" ref={galleryRef}>
      {rows.map((row, ri) => (
        <div key={ri} className={`gallery-row ${layoutClass[row.layout]}`}>
          {row.items.map((item, ii) => (
            <div key={ii} className="gallery-cell" onClick={() => onItemClick(rowOffsets[ri] + ii)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.alt} />
            </div>
          ))}
        </div>
      ))}
    </main>
  )
}
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/GalleryGrid.tsx components/gallery.css
git commit -m "feat: GalleryGrid component with GSAP scroll reveals"
```

---

## Task 7: OverlayViewer Component

**Files:**
- Create: `components/OverlayViewer.tsx`
- Create: `components/overlay.css`

- [ ] **Step 1: Create `components/overlay.css`**

```css
/* components/overlay.css */

.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(10,10,10,0.97);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
}

.overlay.overlay--open {
  pointer-events: auto;
}

.overlay-img {
  max-width: 90vw;
  max-height: 88vh;
  object-fit: contain;
  display: block;
}

.overlay-close {
  position: fixed;
  top: 32px; right: 48px;
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.3s;
  z-index: 1001;
  background: none;
  border: none;
}
.overlay-close:hover { color: var(--text); }

.overlay-arrow {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--sans);
  font-size: 22px;
  color: rgba(240,237,232,0.25);
  cursor: pointer;
  transition: color 0.3s;
  z-index: 1001;
  padding: 24px 20px;
  user-select: none;
  background: none;
  border: none;
}
.overlay-arrow:hover { color: var(--text); }
.overlay-arrow--prev { left: 16px; }
.overlay-arrow--next { right: 16px; }

.overlay-counter {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.3em;
  color: rgba(240,237,232,0.2);
  z-index: 1001;
}
```

- [ ] **Step 2: Create `components/OverlayViewer.tsx`**

```tsx
// components/OverlayViewer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { GalleryItem } from '@/lib/gallery-items'
import './overlay.css'

interface Props {
  items: GalleryItem[]
  open: boolean
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function OverlayViewer({ items, open, currentIndex, onClose, onNavigate }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [displayIndex, setDisplayIndex] = useState(currentIndex)

  // Sync displayIndex when overlay opens or parent changes currentIndex
  useEffect(() => {
    if (open) setDisplayIndex(currentIndex)
  }, [open, currentIndex])

  // Open/close animation — only reacts to `open`, never re-triggers on navigation
  useEffect(() => {
    const el = overlayRef.current
    if (!el) return
    if (open) {
      gsap.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' })
      gsap.fromTo(imgRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' })
      document.body.style.overflow = 'hidden'
    } else {
      gsap.to(el, { opacity: 0, duration: 0.3, ease: 'power2.in' })
      document.body.style.overflow = ''
    }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function navigate(dir: number) {
    const next = (displayIndex + dir + items.length) % items.length
    const sign = dir > 0 ? 1 : -1
    gsap.to(imgRef.current, {
      opacity: 0, x: sign * -40, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setDisplayIndex(next)
        onNavigate(next)
        gsap.fromTo(imgRef.current, { opacity: 0, x: sign * 40 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' })
      },
    })
  }

  const item = items[displayIndex]

  return (
    <div ref={overlayRef} className={`overlay${open ? ' overlay--open' : ''}`}>
      <button className="overlay-close" onClick={onClose}>✕ Close</button>
      <button className="overlay-arrow overlay-arrow--prev" onClick={() => navigate(-1)}>←</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} className="overlay-img" src={item?.src ?? ''} alt={item?.alt ?? ''} />
      <button className="overlay-arrow overlay-arrow--next" onClick={() => navigate(1)}>→</button>
      <span className="overlay-counter">{displayIndex + 1} / {items.length}</span>
    </div>
  )
}
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/OverlayViewer.tsx components/overlay.css
git commit -m "feat: OverlayViewer with GSAP open/close and keyboard nav"
```

---

## Task 8: Creative Portal Page

**Files:**
- Create: `app/creative/page.tsx`
- Create: `app/creative/creative.css`

- [ ] **Step 1: Create `app/creative/creative.css`**

```css
/* app/creative/creative.css */

/* ── NAV ── */
.creative-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 48px;
  background: linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, transparent 100%);
}

/* ── PAGE HEADER ── */
.creative-header {
  padding: 140px 48px 60px;
  border-bottom: 1px solid var(--faint);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.creative-title {
  font-size: clamp(56px, 9vw, 108px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--text);
}
.creative-sub {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--muted);
  text-align: right;
  line-height: 2;
}

/* ── FOOTER ── */
.creative-footer {
  padding: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--faint);
  margin-top: var(--gap);
}
.creative-footer-name {
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.2);
}
.creative-footer-links { display: flex; gap: 32px; }
.creative-footer-link {
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.25);
  text-decoration: none;
  transition: color 0.3s;
  cursor: pointer;
  background: none;
  border: none;
}
.creative-footer-link:hover { color: rgba(240,237,232,0.7); }

/* ── MOBILE ── */
@media (max-width: 768px) {
  .creative-nav { padding: 20px 24px; }
  .creative-nav .nav-section { display: none; }
  .creative-header { padding: 100px 24px 40px; flex-direction: column; align-items: flex-start; gap: 16px; }
  .creative-sub { text-align: left; }
  .creative-footer { padding: 32px 24px; flex-direction: column; gap: 20px; text-align: center; }
}
```

- [ ] **Step 2: Create `app/creative/page.tsx`**

```tsx
// app/creative/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import GalleryGrid from '@/components/GalleryGrid'
import OverlayViewer from '@/components/OverlayViewer'
import { galleryRows, allItems } from '@/lib/gallery-items'
import './creative.css'

export default function Creative() {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayIndex, setOverlayIndex] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('nav > *', { opacity: 0, y: -10, duration: 1, ease: 'power3.out', delay: 0.2, stagger: 0.08 })
      gsap.from('.creative-title', { opacity: 0, y: 30, duration: 1.2, ease: 'power3.out', delay: 0.3 })
      gsap.from('.creative-sub', { opacity: 0, y: 20, duration: 1, ease: 'power3.out', delay: 0.5 })
    })
    return () => ctx.revert()
  }, [])

  return (
    <>
      <nav className="creative-nav">
        <Link href="/" className="nav-back">← Home</Link>
        <span className="nav-name">Rutvij Dhotey</span>
        <span className="nav-section">Creative</span>
      </nav>

      <header className="creative-header">
        <h1 className="creative-title">Creative</h1>
        <div className="creative-sub">
          Travel Photography &amp; Film<br />
          Japan · Switzerland · California
        </div>
      </header>

      <GalleryGrid
        rows={galleryRows}
        onItemClick={i => { setOverlayIndex(i); setOverlayOpen(true) }}
      />

      <OverlayViewer
        items={allItems}
        open={overlayOpen}
        currentIndex={overlayIndex}
        onClose={() => setOverlayOpen(false)}
        onNavigate={i => setOverlayIndex(i)}
      />

      <footer className="creative-footer">
        <span className="creative-footer-name">© 2026 Rutvij Dhotey</span>
        <nav className="creative-footer-links">
          <a href="https://linkedin.com/in/rutvij-dhotey" className="creative-footer-link" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://github.com/rutvijdhotey" className="creative-footer-link" target="_blank" rel="noopener">GitHub</a>
          <Link href="/" className="creative-footer-link">← Home</Link>
        </nav>
      </footer>
    </>
  )
}
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```
Open `http://localhost:3000/creative`. Verify:
- Page header renders with "Creative" title and subtitle
- Gallery grid shows all rows with photos
- Hovering a photo scales it + lifts brightness
- Rows animate in as you scroll
- Clicking a photo opens the full-screen overlay
- Arrow keys (← →) navigate between photos
- ESC closes the overlay
- Back link routes to homepage
Stop server.

- [ ] **Step 5: Commit**

```bash
git add app/creative/page.tsx app/creative/creative.css
git commit -m "feat: creative portal — editorial gallery with full-screen overlay"
```

---

## Task 9: Production Build + Deploy to Vercel

**Files:**
- Modify: `next.config.ts` (remote image hostnames)

- [ ] **Step 1: Update `next.config.ts` for remote images**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'mskwqqbigtauakojpyhn.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: Production build**

```bash
npm run build
```
Expected: build completes with no errors. Three routes shown: `/`, `/engineering`, `/creative`.

- [ ] **Step 3: Smoke test production build locally**

```bash
npm run start
```
Open `http://localhost:3000`. Walk through all three pages. Stop server.

- [ ] **Step 4: Commit config**

```bash
git add next.config.ts
git commit -m "feat: configure remote image hostnames for production"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 6: Deploy on Vercel**

Go to [vercel.com](https://vercel.com), import `rutvijdhotey/portfolio`. Accept default Next.js settings. Click Deploy.

Expected: build completes, site live at `https://portfolio-rutvijdhotey.vercel.app` (or custom domain).

- [ ] **Step 7: Verify live site**

Open the Vercel URL. Check all three pages, gallery clicks, overlay viewer, and nav routing work in production.

---

## Open Items (post-launch)

- Swap homepage panel backgrounds from Unsplash placeholders to final personal photos
- Add video files to `public/creative/videos/` and add entries to `galleryRows` with `type: 'video'`
- Move `public/creative/` photos to Supabase storage for scalability (removes the gitignore workaround)
