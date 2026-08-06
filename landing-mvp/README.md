# VVF Landing MVP

> **This is now a reference copy.** The landing page has been ported into the Laravel app — it serves at `/` from
> `resources/js/Pages/Landing.jsx` + `resources/js/landing/`, using Tailwind v4 tokens in `resources/css/app.css`.
> Edit there. This folder is kept for the standalone `preview.html` and as the original prototype.

Frontend-only React prototype of the VVF marketing site, using the 1of10 landing page as a design reference and the
`vvf-flow-prototype` custom search flow. **All data is dummy data** (`src/data/dummy.js`) — nothing calls an API.

## Quick look, no install

Open `preview.html` directly in a browser. It is a prebuilt single-file bundle of this exact app (compiled CSS
inline, React from CDN) — handy for sharing the design without a toolchain. It is a build output, not the source;
edit `src/` and re-run the dev server for real work.

## Run it

```bash
cd landing-mvp
npm install
npm run dev      # http://localhost:5180
npm run build    # production bundle in dist/
npm run preview  # serve the build
```

## Stack

- React 18 + Vite 6
- Tailwind CSS 4 via `@tailwindcss/vite` — no `tailwind.config.js`, the theme lives in `@theme` inside
  `src/index.css`, and `@custom-variant dark` makes dark mode class-driven
- No router, no state library — hash paths and local state only

## Structure

```
src/
  App.jsx                 page composition
  data/dummy.js           ALL placeholder copy, pricing, videos, FAQs
  components/
    Icons.jsx             inline SVG set
    ThemeToggle.jsx       animated light/dark switch
    useTheme.js           theme state + localStorage persistence
  flow/
    flowState.js          useSearchFlow() — the search flow state machine
    SearchFlow.jsx        modal shell + screens 2–5
    VideoCard.jsx         featured + grid result cards
  sections/               Nav, Hero, BrandMarquee, Features, HowItWorks,
                          Testimonials, Pricing, Faq, FinalCta, Footer
```

## The search flow

Ported from `vvf-flow-prototype_11.html`. Screen 1 lives inline in the hero (type toggle + subject input); screens
2–5 open in a modal.

| Step | Screen | What happens |
| --- | --- | --- |
| — | Hero | Pick Brand / Competitor / Product, type a subject |
| `keywords` | Modal | Suggested keywords, first two preselected, toggle any |
| `running` | Modal | Spinner + sign-in gate (Google or email) |
| `results` | Modal | Featured video + grid, load more, upsell CTA |
| `trial` | Modal | Three tiers, Starter flagged as the trial |

Subject and type flow through: the searched handle overrides `@glossier` on matching result cards, and selected
keywords render as chips on the results header. Leaving the subject blank falls back to a sample per type.

## Theming

`darkMode: 'class'` on `<html>`. An inline script in `index.html` applies the stored or system preference before
first paint to avoid a flash. Preference persists in `localStorage` under `vvf-theme`.

## Responsive

Breakpoints follow Tailwind defaults: single column under `sm` (640px), two-to-three columns at `sm`/`md`, full
layout at `lg` (1024px). Result grid goes 2 → 3 → 4 columns. Nav collapses to a sheet under `lg`.

## Swapping in real data

Everything renderable lives in `src/data/dummy.js`. Replace those exports with API responses of the same shape and
the UI needs no changes. `useSearchFlow` is where a real search request would be fired — currently `setStep('running')`
just advances the screen.
