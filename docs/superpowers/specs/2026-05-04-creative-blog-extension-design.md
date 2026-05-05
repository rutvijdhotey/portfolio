# Creative Blog Extension — Design Spec

*Date: 2026-05-04*

---

## Summary

Add a travel blog to the Creative portal (`/creative`). The page is restructured from sequential photo chapters into an editorial feed — each destination shows its photo grid and its story together. Full posts live at `/creative/stories/[slug]`. Content is authored in Notion and fetched at build time. The site remains a static export deployed to GitHub Pages.

---

## Decisions Made

| Question | Decision |
|---|---|
| Page structure | Option C — Editorial Feed (photos + story card per destination) |
| Post routing | Option A — full post page at `/creative/stories/[slug]` |
| Content source | Notion database, fetched at build time via Notion API |
| Image hosting | Supabase (existing bucket) — Notion-hosted images are not used (URLs expire) |
| Deploy target | GitHub Pages static export — unchanged |
| Publish workflow | Write in Notion → trigger GitHub Actions `workflow_dispatch` → deploy |
| Publish cadence | Infrequent (monthly or less) — static build is acceptable |

---

## Notion Database Schema

Database name: **Travel Stories**

| Field | Type | Notes |
|---|---|---|
| Title | Title | Post headline |
| Slug | Rich Text | URL-safe, e.g. `japan-tokyo`, `hike-halfdome` |
| Location | Rich Text | Matches chapter location key, e.g. `Japan`, `Oregon` |
| Cover Image URL | URL | Supabase public URL for hero image |
| Read Time | Number | Minutes, e.g. `12` |
| Published | Checkbox | Draft control — only checked posts are fetched |
| Published Date | Date | Display date |
| Excerpt | Rich Text | 1–2 sentence teaser shown on the StoryCard |

Post body is authored as Notion page content (blocks). Images inside posts must use Supabase URLs — paste the public URL into Notion as an image block, do not upload images directly to Notion.

---

## Architecture

### Data Layer

**`lib/notion.ts`**
- Notion API client (using `@notionhq/client`)
- `getPublishedPosts()` — queries Travel Stories database, filters `Published = true`, returns post metadata array
- `getPostBySlug(slug)` — fetches a single post's metadata + full block content
- Build-time warning: if any image block contains a non-Supabase URL (i.e. a Notion-hosted image), log a warning so it's caught before deploy

**`lib/blog-types.ts`**
- TypeScript types: `BlogPost`, `BlogPostMeta`, `NotionBlock`

### Routes

| Route | File | Description |
|---|---|---|
| `/creative` | `app/creative/page.tsx` | Restructured editorial feed (modified) |
| `/creative/stories/[slug]` | `app/creative/stories/[slug]/page.tsx` | Full post page (new) |

### Components

| Component | File | Description |
|---|---|---|
| `StoryCard` | `components/StoryCard.tsx` | Teaser card shown below each photo chapter |
| `NotionRenderer` | `components/NotionRenderer.tsx` | Renders Notion blocks as React elements |

---

## Creative Page Restructure (`/creative`)

### Before
Sequential chapters: 01 City → 02 Nature → 03 Random

### After
Editorial blocks — each block = chapter header + GalleryGrid + optional StoryCard

```
Video Hero (unchanged)

Editorial Block 01 — Japan
  chapter header  (01 · City · Japan · Street & Architecture)
  GalleryGrid     (unchanged)
  StoryCard       (rendered if a published post has location: "Japan")

Editorial Block 02 — Oregon
  chapter header  (02 · Nature · Oregon · Landscape)
  GalleryGrid     (unchanged)
  StoryCard       (rendered if a published post has location: "Oregon")

Editorial Block 03 — Random
  chapter header  (03 · Random · Various · Aerial & Candid)
  GalleryGrid     (unchanged)
  [no StoryCard — no narrative post for this chapter]

Contact + Footer (unchanged)
```

The `chapters` array in `page.tsx` gains an optional `locationKey` field. If no published post matches the locationKey, `StoryCard` is not rendered — the chapter works without a post.

### StoryCard layout
- Cover image (left, fixed aspect ratio)
- Location tag + title (Fraunces 300) + excerpt + read time
- "Read →" link to `/creative/stories/[slug]`

---

## Post Page (`/creative/stories/[slug]`)

### Layout (top to bottom)

```
Nav (creative nav, unchanged)

Post Hero
  Full-width cover image (Supabase URL)
  Overlay: location tag · title (Fraunces, large) · date · read time

Post Body (max-width ~680px, centered)
  Notion blocks rendered as:
    paragraph          → <p>, DM Sans
    heading_1/2/3      → Fraunces 300, scaled sizes
    image              → full content-column width, Supabase URL
    bulleted_list_item → <ul> styled
    numbered_list_item → <ol> styled
    quote              → left border, italic Fraunces

Post Footer
  ← Back to Creative
  Next post →  (if one exists)
```

### Unsupported blocks
Any Notion block type not in the list above renders nothing — no crash, no visible gap.

### Static generation
`generateStaticParams` fetches all published post slugs at build time. Each slug becomes a static HTML page in the export.

---

## Notion Image Discipline

All images in post bodies must be hosted on Supabase.

Workflow:
1. Upload image to Supabase `portfolio` bucket (new folder: `Blog/[slug]/`)
2. Copy the public URL
3. In Notion, insert an Image block → paste URL as external link

The build will log a warning if it detects a `notion.so` or `amazonaws.com` image URL in any post block, catching accidental direct uploads before they reach production.

---

## Navigation

No changes to the creative nav at launch. Stories are discovered organically through the editorial feed on `/creative`. A nav link can be added later once there are enough posts to warrant it.

---

## Deploy Workflow

1. Author post in Notion, check Published when ready
2. Go to GitHub → Actions → `Deploy` → Run workflow
3. Build fetches Notion, generates static pages, deploys to GitHub Pages

Optional future: Notion webhook → GitHub API to trigger the workflow automatically on database change.

---

## Out of Scope (not in this build)

- Comments or likes
- Tag/category pages
- Post search
- Notion Templates storefront
- Automatic Notion webhook trigger
- Nav link to Stories section

---

## New Files

```
lib/notion.ts
lib/blog-types.ts
components/StoryCard.tsx
components/NotionRenderer.tsx
app/creative/stories/[slug]/page.tsx
app/creative/stories/[slug]/story.css
```

## Modified Files

```
app/creative/page.tsx
app/creative/creative.css
```
