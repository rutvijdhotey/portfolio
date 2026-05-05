# Creative Blog Extension — Plan & Ideas

*Logged: 2026-05-05*

---

## Concept

Add a **Blog** section inside the Creative portal (`/creative`). The initial focus is a travel blog, with a potential secondary track for selling Notion templates.

---

## Travel Blog

- A dedicated section (e.g. `/creative/blog` or `/creative/travel`) housing long-form travel posts.
- Posts are **AI-generated** from two inputs provided by Rutvij:
  - Travel **photos** (the raw visual material)
  - Personal **notes / voice memos** from the trip
- The AI synthesizes these into a narrative — the writing reflects the trip through Rutvij's lens, not a generic travel recap.
- Posts should feel editorial and consistent with the existing portfolio aesthetic (dark, moody, Fraunces-led typography).

---

## Notion Templates

- Alongside the travel blog, a subsection for **Notion templates for sale**.
- Templates are likely travel-related (packing lists, itinerary planners, travel journals, etc.) but could expand to other categories.
- Potential integration points:
  - Embed a Gumroad / Lemon Squeezy storefront, or link out to a Notion marketplace listing.
  - Each blog post could reference or recommend a relevant template ("Plan your own trip with this template →").
- Travel tidbits and quick tips could live here too — shorter-form content alongside the full blog posts.

---

## Key Questions to Resolve

- **URL structure:** `/creative/blog`, `/creative/travel`, or a top-level `/blog`?
- **CMS / data source:** Where do posts live? Options: MDX files in the repo, Notion as a CMS (fits the Notion template angle), a headless CMS (Sanity, Contentful), or a simple JSON/markdown approach.
- **AI generation workflow:** What model and pipeline generates the posts? Does Rutvij review/edit before publishing, or is it fully automated?
- **Template sales platform:** Gumroad, Lemon Squeezy, Notion marketplace, or a custom checkout?
- **Navigation:** Does the Creative nav gain a "Blog" link, or is it discoverable only through the Creative portal gallery?

---

## Notes

- The travel blog and the Notion template store are complementary but independent — either can ship first.
- The AI-generation pipeline for posts is the most novel part and will need its own spec when the time comes.
- Keep the design system consistent with the rest of the Creative portal: same fonts, same dark palette, same scroll-reveal animation patterns.
