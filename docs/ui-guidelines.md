# UI Guidelines — Rutvij Dhotey Portfolio

*Last updated: 2026-05-05*

---

## 1. Design Strategy

The portfolio is built around a **dark, editorial, cinematic** aesthetic — high contrast, generous whitespace, and deliberate restraint. Every visual decision earns its place.

**Core principles**

- **Moody minimalism.** Near-black backgrounds with warm off-white text create depth without decoration. Nothing is added for its own sake.
- **Editorial hierarchy.** Large, variable-size typography does the heavy lifting. Uppercase labels with wide letter-spacing establish structure without relying on ruled lines or boxes.
- **Cinematic motion.** Scroll-driven reveals, staggered entrances, and slow image drifts borrow from film — motion underscores content rather than decorating the page.
- **Dual identity.** Engineering and Creative are distinct portals with their own visual weight, but share the same underlying system: same fonts, same spacing scale, same color base.
- **Content-first.** Layouts expand to hold content, not the other way around. No placeholder cards, no skeleton states, no filler.

**Inspirations.** Danik Bartolini (minimal, moody, editorial); Shopify Editions (cinematic scroll storytelling).

---

## 2. Color

### Base palette

```
--bg:       #0a0a0a                       Near-black — primary page background
--bg-eng:   #0e0e0e                       Engineering portal background (fractionally lighter)
--text:     #f0ede8                       Warm off-white — all body and heading text
--muted:    rgba(240, 237, 232, 0.35)     Secondary text, captions, muted labels
--faint:    rgba(240, 237, 232, 0.10)     Borders, dividers, hairlines
--accent:   rgba(240, 237, 232, 0.06)     Subtle fills, hover backgrounds
```

Use opacity on `--text` rather than separate color tokens for hierarchy: 60% for secondary, 35% for muted, 20% for placeholder, 10% for structural lines.

### Accent colors (LaCuriosity pipeline nodes)

These appear only in the pipeline diagram component. Do not use them as general UI colors.

| Node | Color |
|---|---|
| Trigger | `#F5C842` (golden yellow) |
| Search | `#4BA3D4` (sky blue) |
| Claude | `#D4834B` (warm orange) |
| Gemini | `#4B8BD4` (cool blue) |
| Tools | `#6A7A7A` (slate gray) |
| Storage | `#3ECF8E` (teal green) |
| Publish | `#FF6B35` (vibrant orange) |
| Router | `#C44BD4` (magenta) |

Fill versions use the same hex at 7% opacity (e.g. `#F5C84212`).

### Accent colors (Creative chapter pillars)

Used for editorial color-coding in the Creative portal chapter headings only.

| Pillar | Color |
|---|---|
| Physical World | `#E8935A` (terracotta) |
| Human Mind | `#9B7FD4` (violet) |
| The Construct | `#5B9BD4` (bright blue) |
| The Abstract | `#D45B9B` (magenta) |
| The Planet | `#5BD47A` (teal) |

---

## 3. Typography

### Font families

| Role | Family | Source | CSS variable |
|---|---|---|---|
| Headings, body prose | **Fraunces** | Google Fonts via `next/font` | `--font-serif` |
| UI, navigation, labels, tags | **DM Sans** | Google Fonts via `next/font` | `--font-sans` |

**Fraunces** is a variable optical-size serif. It reads as literary and authoritative at large sizes, legible at body sizes. Use it for anything the reader is meant to dwell on.

**DM Sans** is a geometric grotesque. Use it for navigation, section labels, tags, captions — any UI chrome where clarity and neutrality matter more than personality.

**CSS loading** (`app/layout.tsx`):
```typescript
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
```

`display: 'swap'` is intentional — a system fallback shows immediately while the custom fonts load, preventing invisible text.

### Type scale

All fluid sizes use `clamp(min, preferred, max)` so type scales continuously across viewports without hard breakpoints.

| Context | Size | Family | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Home panel heading | `clamp(28px, 3.5vw, 52px)` | Serif | 400 | 0.15em | 1.1 |
| Creative hero title | `clamp(56px, 9vw, 108px)` | Serif | 400 | −0.02em | 1.0 |
| Chapter title | `clamp(72px, 12vw, 140px)` | Serif | 400 | −0.03em | 0.88 |
| Engineering hero title | `clamp(52px, 8vw, 120px)` | Serif | 400 | −0.02em | 0.95 |
| Contact email link | `clamp(24px, 4vw, 48px)` | Serif | 400 | −0.01em | — |
| About bio (Engineering) | `clamp(16px, 1.5vw, 20px)` | Serif | 400 | — | 1.55 |
| Navigation labels | 10–11px | Sans | 500 | 0.25–0.35em | — |
| Section labels | 9–10px | Sans | 500 | 0.3–0.4em | — |
| Hero subheadings | 11–14px | Sans | 400 | 0.1–0.22em | — |
| Body / descriptions | 12–14px | Sans | 400 | — | 1.6–1.7 |
| Tags / chips | 9–10px | Sans | 500 | 0.15–0.25em | — |

**Rules of thumb**
- Large display type (hero/chapter titles) always uses negative tracking to tighten optical space at large sizes.
- Small uppercase labels always carry positive tracking (≥ 0.2em) for legibility.
- No font size should drop below 9px in any context.
- Fraunces weight 300 is used sparingly — only when a deliberately delicate feel is needed.

---

## 4. Spacing

One universal micro-unit drives the grid:

```css
--gap: 4px
```

All gallery gutters, grid gaps, and pixel-precise spacing derive from this. Larger values use multiples or follow the scale below.

### Spacing scale

| Value | Common use |
|---|---|
| 4px (`--gap`) | Gallery gutters, icon offsets |
| 8px | Tight component padding |
| 12–16px | Tag padding, small gaps |
| 18–20px | Entry row gaps |
| 24–28px | Mobile section padding |
| 32–36px | Medium section gaps |
| 40–48px | Standard desktop section padding, nav padding |
| 56–64px | Section vertical separation |
| 72–80px | Large section padding |
| 88–108px | Hero vertical rhythm |

### Layout measurements

| Element | Desktop | Mobile |
|---|---|---|
| Gallery gutter | 4px (`--gap`) | 4px |
| Gallery full-width cell height | 65vh | 55vw |
| Gallery half-cell height | 48vh | 65vw |
| Gallery third-cell height | 40vh | 65vw |
| Section horizontal padding | 48px | 24px |
| Navigation padding | 28px 48px | 20px 24px |

---

## 5. Website Structure

```
/                     Homepage gateway
├── /engineering      Engineering portal
└── /creative         Creative portal
```

### Homepage (`/`)

A full-viewport split screen with no scroll. Two panels at 50% / 50% occupy the entire viewport.

- **Left (Engineering):** `--bg-eng` background, text-driven, stat highlights.
- **Right (Creative):** Full-bleed background image, more expressive.
- Site name centered at the very top, straddling both panels. Uses `mix-blend-mode: difference` so it remains legible against both backgrounds.
- A 1px vertical divider separates the panels; its opacity animates on hover.
- Each panel is a link to its respective portal.
- **Mobile:** Panels stack vertically at 50vh each; the vertical divider is hidden.

### Engineering portal (`/engineering`)

Structured, information-dense, professional.

- Fixed navigation bar at top (z-index 100), gradient-faded to transparent below.
- **Hero section (100vh):** Large typographic title, role subtitle, brief bio, key stats.
- **About strip:** 3-column layout (1fr 2fr 1fr) with bio, links, and a "thinking about" column.
- **Credentials:** 2-column grid with border-right divider — work experience left, education/awards right.
- **Projects:** Full-width entry list with tags and descriptions.
- **Contact footer:** Large email link, social handles.

### Creative portal (`/creative`)

Scroll-driven, immersive, gallery-forward.

- Fixed navigation bar at top.
- **Hero section (100vh):** Looping video background with title overlay and scroll hint.
- **Gallery grid:** Full-width CSS Grid with 4px gutters. Rows use a variety of cell configurations (full-width, halves, thirds, large-small) to break monotony.
- **Chapter sections:** Each creative discipline (e.g. Photography, Film) opens with a large chapter title and an intro paragraph before its gallery rows.
- **Contact footer:** Same structure as Engineering portal for consistency.

### Navigation

Shared across both portals.

- Fixed, full-width, z-index 100.
- Background is a gradient from `--bg` to transparent so content scrolls under it naturally.
- Links: uppercase, DM Sans 500, 10–11px, 0.25–0.3em tracking.
- Back-to-home link animates with a −3px translateX on hover.
- On mobile: section labels hidden, spacing reduced.

---

## 6. Components

### Tags / chips

```
font-size: 9–10px  |  font-family: --font-sans  |  font-weight: 500
text-transform: uppercase  |  letter-spacing: 0.15–0.25em
padding: 5px 12px  |  border: 1px solid var(--faint)  |  border-radius: 5–6px
```

Hover state: border color lifts from `--faint` to `rgba(240,237,232,0.25)`, text color lifts from `--muted` to `--text`.

### Dividers / hairlines

Always `1px solid var(--faint)`. No heavier borders anywhere. Structural separation is done by spacing, not thick lines.

### Gallery cells

Images use `object-fit: cover` on their container. On hover:
- Image scales to 1.04× (`transform: scale(1.04)`)
- Brightness lifts from 0.9 to 1.0
- Both transitions use `cubic-bezier(0.25, 0.46, 0.45, 0.94)` at 0.85s

Cells may carry an overlay for text legibility — `rgba(10,10,10,0.97)` for near-opaque overlays.

### Credential / entry rows

```
display: flex  |  gap: 18px  |  border-bottom: 1px solid var(--faint)
```

Title in Fraunces 400, metadata in DM Sans at `--muted`, tags inline after description.

---

## 7. Animation

### Libraries

- **GSAP 3** (`^3.15.0`) for all JavaScript-driven animation.
- **GSAP ScrollTrigger** for scroll-driven reveals.
- CSS transitions for hover states only.

Always clean up GSAP contexts on component unmount to prevent memory leaks:
```typescript
const ctx = gsap.context(() => { /* animations */ }, containerRef)
return () => ctx.revert()
```

### Easing presets

| Name | Use |
|---|---|
| `power3.out` | Default — most entrance animations |
| `power2.in` | Exit / out animations |
| `power3.inOut` | Panel/overlay transitions |
| `cubic-bezier(0.76, 0, 0.24, 1)` | Home panel expansion |
| `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Gallery image scale on hover |

### Duration scale

| Duration | Context |
|---|---|
| 0.2–0.3s | Micro-interactions: close buttons, small transforms, CSS hover |
| 0.4–0.5s | Overlay fades, media swaps |
| 0.7–0.9s | Section reveals, gallery row entrances |
| 1.0–1.4s | Page entrance animations: hero titles, panel content |
| 8s | Slow background drift on hero image hover |

### Page entrance sequence

Elements animate in on page load with this general stagger order:

1. Navigation items — `opacity 0→1`, `y: -10→0`, 1s, stagger 0.08s per item
2. Hero title — `opacity 0→1`, `y: 30–40→0`, 1.2–1.3s, delay 0.4–0.5s
3. Hero subheading / description — `opacity 0→1`, `y: 20→0`, 1s, delay 0.65–0.75s
4. Stats / tags — `opacity 0→1`, `y: 12–16→0`, 0.9s, stagger 0.08–0.1s
5. Home panel divider — `scaleY: 0→1`, 1.4s, delay 0.2s
6. Home panel content — `opacity 0→1`, 1.4s, stagger 0.2s, delay 0.3s

### Scroll reveal pattern

```javascript
gsap.from(elements, {
  opacity: 0,
  y: 28,
  duration: 0.9,
  stagger: 0.1,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: container,
    start: 'top 80%',
  },
})
```

Trigger point is consistently `top 80%`–`top 88%` — just before the element is fully in view, not on entry.

### Scroll indicator

A pulsing "scroll" hint below the hero uses:
```css
@keyframes heroScrollPulse {
  0%, 100% { transform: translateY(0);  opacity: 0.35; }
  50%       { transform: translateY(5px); opacity: 0.65; }
}
animation: heroScrollPulse 2.4s ease-in-out infinite;
```

---

## 8. Responsive Design

One breakpoint — `768px` — divides mobile from desktop.

```css
@media (max-width: 768px) { … }
```

**Mobile adaptations**

| Element | Desktop | Mobile |
|---|---|---|
| Homepage panels | Side by side (50% each) | Stacked (50vh each) |
| Homepage divider | Vertical, visible | Hidden |
| Navigation labels | Visible | Hidden |
| Credentials grid | 2 columns | 1 column |
| About strip | 3 columns | 1 column |
| Section padding | 48px | 24px |
| Gallery heights | Viewport-height (`vh`) | Viewport-width (`vw`) |

Fluid typography handles most size reduction via `clamp()` without needing breakpoint overrides.

---

## 9. Technical Conventions

### CSS reset (global)

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

### Layout primitives

CSS Grid and Flexbox exclusively. No floats, no absolute-positioned layout. Absolute/fixed positioning is reserved for overlays, navigation, and scroll-pinned elements.

### Units

| Unit | When to use |
|---|---|
| `px` | Fixed sizes: borders (always 1px), small spacing, breakpoints |
| `em` | Letter-spacing (relative to local font size) |
| `vh` / `vw` | Hero heights, gallery cell heights |
| `%` | Proportional widths in grid/flex contexts |
| `clamp()` | All fluid typography |

Avoid `rem` for spacing — the `--gap` (4px) system keeps spacing explicit and reviewable.

### Image handling

- All images: `object-fit: cover` within fixed-height containers
- No CLS: containers have explicit `height` set before image loads
- Hero video: `autoPlay muted loop playsInline` — never autoplays with audio

### z-index layers

| Layer | Value | Element |
|---|---|---|
| Navigation | 100 | Fixed nav bar |
| Overlays | 200 | Gallery lightbox, full-screen overlays |
| Above overlays | 300 | Close buttons on overlays |

---

## 10. What Not to Do

- **Don't add color.** All colors outside the base palette and the two approved accent sets are off-brand.
- **Don't use box shadows.** Depth comes from color opacity and spacing, not shadows.
- **Don't add borders heavier than 1px.** Use spacing to separate, not thick lines.
- **Don't introduce new fonts.** Fraunces + DM Sans is the complete system.
- **Don't animate on scroll trigger before `top 80%`.** Earlier triggers break the intended reveal timing.
- **Don't use `font-weight: 700` or bold.** The palette uses 300–500 only; bold reads as a different typeface in Fraunces.
- **Don't add border-radius larger than 6px.** This is not a rounded-corners design system.
