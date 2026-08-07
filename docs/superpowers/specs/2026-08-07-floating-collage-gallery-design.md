# Floating Collage Gallery — Design Spec
**Date:** 2026-08-07
**Status:** Approved. Supersedes the single-column stagger built in Task 7 of the photo pipeline plan.
**Branch:** `feature/photo-pipeline-floating-gallery`

---

## Problem

Task 7 shipped an editorial stagger: one photo per row, width from a four-step scale, alternating left/center/right. Reviewed in the browser at 1440px, it reads as *one photo at a time, floating* — two photos occupy a full viewport and most of the screen is empty. All 39 photos make the creative page roughly 26,000px tall.

The intent was photographs in conversation with each other. A single column can't do that: no two photos are ever visible together long enough to relate.

## Decision

Group photos into **bands** — two or three sharing a horizontal band at unequal widths and unequal vertical offsets, with periodic solo bands. Nothing aligns to a grid line; the float comes from the offsets and from the band not filling the column.

Considered and rejected:

| Option | Why not |
|---|---|
| Overlapping clusters | Reads most like a physical collage, but hides parts of frames. `object-fit: cover` was just removed specifically so photographs stop being cropped by the layout. Available later as a per-band opt-in; not in this scope. |
| Free canvas (hand-placed x/y) | Total control, total authorship. 39 photos of coordinates, re-derived per breakpoint, and every new photo becomes a layout puzzle rather than a line in a map. |

Bands are derived from **shape**, with per-band **subject overrides**. Aspect ratio produces the whole first pass; the author overrides only where specific photographs belong together.

---

## Architecture

Two modules, split so the grouping logic can be tested without a DOM.

### `lib/gallery-bands.ts` — new, pure

```ts
export type Shape = 'pano' | 'wide' | 'square' | 'tall'

export interface BandPhoto {
  item: GalleryItem
  index: number      // position in the chapter's item array; the overlay depends on it
  share: number      // percentage of the content column
  drop: number       // downward offset as a percentage of the photo's own height
}

export interface Band {
  photos: BandPhoto[]
  align: 'left' | 'right'   // which side of the column the band sits toward
}

export function buildBands(items: GalleryItem[], overrides: BandOverrides): Band[]
```

`buildBands` is a pure function over the manifest. No React, no CSS, no network.

### `lib/gallery-layout.ts` — reshaped

Stays the art-direction layer. `PLACEMENTS` (`{ size, align }` per photo) is replaced by `BAND_OVERRIDES`, plus the tuning constants below. `SIZE_WIDTH`, `PhotoSize` and `PhotoAlign` are removed — nothing else imports them.

```ts
export const BAND_OVERRIDES: BandOverrides = {
  // The two Dotonbori street frames belong together.
  'RJ405690': { with: 'RJ405760', shares: [50, 30] },
}
```

An override names the lead photo, the photo(s) joining it, and optionally explicit shares and drops. Anything unnamed is derived.

---

## Grouping rules

Shape is classified from the manifest's `width`/`height`:

| Shape | Aspect ratio |
|---|---|
| `pano` | ≥ 2.2 |
| `wide` | 1.3 – 2.2 |
| `square` | 0.85 – 1.3 |
| `tall` | < 0.85 |

The chapter is walked in order and grouped greedily:

1. **Overrides are consumed first.** A photo named in an override is placed with its partner regardless of shape, and neither is available to the derived pass.
2. **Panoramas go solo** at 88–96% of the column. Pairing a 3:1 frame with anything makes both too small to read.
3. **Wide + tall is the preferred pair.** The height difference is what makes a band read as a collage rather than a row.
4. **Two talls never pair.** Side-by-side portraits of similar height read as a grid cell — the exact thing being avoided.
5. **Wide + wide pairs only at a strong size difference** (roughly 52/28), never near-equal.
6. **Every fourth or fifth band is a solo** at 62–78%, as a breath. Relentless pairing is as monotonous as relentless solos, only denser.

**Order is never changed.** Grouping is a partition of the chapter's sequence, so chapter narrative and the overlay's flat index both survive untouched.

Every photo appears in exactly one band. A chapter with an odd count ends on a solo.

---

## What makes a band float

Three rules, all inside the band:

- **Unequal shares.** Two photos never split the band evenly. Equal halves is the strongest grid signal available; the default split is roughly 50/30 of the column, with a gap between.
- **Vertical drop.** One photo is offset downward by 8–20% of its own height, so top edges never align. Bottom edges already can't, since aspect ratios differ.
- **The band does not fill the column.** Shares plus gap total 75–85%, and the band sits toward the left or right, alternating band to band. The leftover margin is what reads as floating.

Vertical rhythm between bands drops from `clamp(64px, 9vw, 140px)` to roughly `clamp(48px, 6vw, 96px)` — air now lives inside the bands as well as between them. 39 photos becomes roughly 22 bands; the page should lose on the order of 40% of its height.

### Rendering

`GalleryFlow` maps bands to `.photo-band` elements — flex rows, `align-items: flex-start`, each photo's `share` as `flex-basis` and its `drop` as `margin-top`. `Photo` is unchanged.

GSAP reveals **per band** rather than per photo, so a pair rises together. The existing `ScrollTrigger` start (`top 90%`) and easing carry over.

### Mobile

Below 768px, bands collapse: one photo per row, 100% width, drops zeroed, alternation dropped. This is the current behaviour and needs no new decisions.

---

## Correctness risks

**`sizes` must be recomputed.** The current `SIZES` map assumes the old four-step scale (`50vw` for `md`, and so on). The content column is 1296px at a 1440 viewport, so a photo at a 30% share renders about 390px wide — the 480 rung, not the 1200 the old values would select. Leaving them in place makes the browser over-fetch and quietly gives back part of the 211.7 MB → 6.9 MB win. `sizes` is derived from each photo's `share`.

Verified after implementation the same way Task 6 was: load `/creative` at 1440px and confirm the selected rungs, the eager/lazy split, and that no `-2560` derivative is fetched on load.

**Bend, Oregon masters are 2048px wide.** They have no 2560 rung. Nothing here changes overlay behaviour, but band shares must not assume a rung exists — `availableWidths()` and `overlayWidth()` remain the only sources of truth.

---

## Testing

`node --test`, matching the pipeline scripts. No new dependencies.

`buildBands` covers:
- every photo appears exactly once
- input order is preserved
- no band contains two `tall` photos
- `pano` photos are always solo
- an override always wins over the derived pairing, and consumes both photos
- shares within a band never split evenly
- a chapter with an odd photo count still places every photo

---

## Consequences

**The photo review pass is deferred, not cancelled.** Every `size`/`align` value currently in `gallery-layout.ts` becomes obsolete when `PLACEMENTS` is replaced, so reviewing them now is discarded work. Build this, then review once against the real layout. The dev-only `id · placement` badge added on 2026-08-07 stays until that review is done, then comes out.

**Task 7 is reopened** in the photo pipeline plan. Tasks 1–6 and 8 are unaffected. Task 9 remains blocked on ffmpeg.

## Out of scope

- Overlapping bands (the rejected option B) — a later opt-in, if wanted.
- Theming, which remains a separate second branch.
- Hero video and cover re-encoding (Task 9).
