# Brand Beacon — Design Handoff Spec

This package is a static HTML/CSS/JS mockup meant as an exact visual and interaction reference for implementation in the real app (React/Tailwind + Inertia stack). It is not production code — no real data, auth, or API calls — but every pixel value, color, spacing, and interaction state is final and can be read directly out of the HTML/CSS.

## What's in this package

- `brand-beacon-homepage.html` — marketing/landing page (hero, features, pricing, social proof, footer).
- `brand-beacon-app.html` — the full logged-in app: sidebar shell, search wizard flow, library, analytics/search-detail screen, settings, plans, login. Includes a built-in screen switcher bar (fixed to the top, dark bar with buttons) so your dev can click through every screen/state without navigating a real flow — **that switcher bar is dev-only scaffolding and should not ship**; everything below `.app` in the DOM is the real UI.
- This spec.

## Design tokens (from `:root` in the `<style>` block)

Colors:
- `--yellow: #FFC629` — primary brand/CTA color. `--yellow-hot: #FFD84D` (hover state).
- `--amber-ink: #9A6B00` — text/icon color used on top of yellow-wash backgrounds.
- `--ink: #0B0B0B` — headings, primary text.
- `--body: #34332F` — body copy.
- `--muted: #5C5A54`, `--faint: #74716A` — secondary/tertiary text.
- `--line: #E7E5DF`, `--line-2: #D9D6CF` — borders (default / hover-darker).
- `--white: #fff`, `--paper: #FAF9F6`, `--canvas: #F5F4F0` — surface layers, lightest to base background.
- `--ok: #1F7A4D` / `--ok-bg: #E9F6EF` — success state.
- `--warn: #9A3412` / `--warn-bg: #FEF0E7` — warning state.
- `--wash: #FFF8E6` — tinted yellow background used behind badges, active nav items, "optional" callouts.

Radii: `--r: 11px` (default controls/cards), `--r-lg: 16px`, `--r-xl: 22px` (large cards/modals).

Motion: `--ease: cubic-bezier(.22,.61,.36,1)` — used on all hover/transition states, ~0.15–0.2s.

Layout: `--sidebar: 252px` fixed sidebar width in the app shell.

Typography: Figtree (400/500/600/700/800/900) for UI text, loaded from Google Fonts. Base body size 15px, line-height 1.6. Headings are weight 800, tight letter-spacing (-0.024em to -0.032em).

## App shell structure

- Two-column grid: fixed `252px` sidebar + fluid content (`.app{grid-template-columns:var(--sidebar) minmax(0,1fr)}`).
- Sidebar: logo/wordmark, nav list (dashboard, search wizard entry points, library, settings — locked items get a lock icon and are non-interactive), an affiliate/referral card pinned above the account switcher, account switcher (avatar, name, email, sign-out) pinned to the bottom via `.side__sp{flex:1}` spacer.
- Active nav item gets `.is-on`: `--wash` background, amber-ink icon/text.

## Screens implemented (11 total + 2 settings sub-screens + 1 library sub-screen)

| Screen key | Purpose |
|---|---|
| `login` | Sign-in screen |
| `dashboard` | Home/overview after login |
| `keywords` | Search wizard — step: keyword selection |
| `sources` | Search wizard — step: connect brand's TikTok handle / website (brand flow only, last step, optional) |
| `brands` | Brand search list/entry |
| `products` | Product search list/entry |
| `library` | Saved/completed searches list |
| `library-videos` | Library — video grid sub-view |
| `analytics` | Search detail — full analytics/tracker view (charts, top videos, outliers) |
| `results` | Search detail — simplified results view |
| `settings` | Account settings |
| `settings-appearance` | Settings sub-screen |
| `settings-subscription` | Settings sub-screen |
| `plans` | Pricing/plan picker (in-app) |

## Search wizard flow logic (important — this is stateful, not just visual)

The wizard branches by search type, driven by a `FLOW.kind` value of `'brand'` or `'product'`:

- **Product flow**: 2 steps only — Subject → Keywords → run. No Sources step (there's nothing to connect for a product search).
- **Brand flow**: 3 steps — Subject → Keywords → Sources → run. Sources is last and explicitly optional (skippable), asking for the brand's TikTok handle and/or website to improve match accuracy.
- There is **no separate "Results" step** in the stepper — the wizard stepper only shows steps up to Sources/Keywords; the run/loading screen that follows has no stepper at all (it's a transitional loading state, not a wizard step), since the user is already authenticated and this isn't part of the guided flow.
- Entry points into the flow (from `brands` and `products` list screens) land on `keywords` first, not `sources`.
- The "Back" button target and step count (`Step X of Y`) both depend on `FLOW.kind` — copy this branching logic exactly; it's implemented via a small `cfg()` / `FLOWCFG` lookup object keyed by `brand`/`product` in the mockup's JS (search `FLOWCFG` in the HTML `<script>` block).

## Sources screen (brand flow) — component notes

- Two source cards: TikTok handle (`.src`, shows a "Found" success badge with follower count / median views once matched) and Website (optional, no validation shown).
- Each source card has a header row (icon + label + optional status badge), an input row styled as a borderless field inside a bordered container (`.src__f`), and a meta line below (`.src__m`) for supporting copy — "Optional" in faint text, or the matched-account stats in normal muted text.
- Footer actions: Back (ghost button, `.btn--g`) on the left; Skip (ghost) + primary yellow "Run the search" (`.btn--y`) grouped on the right.

## Component/button variants used throughout

- `.btn--y` — primary yellow CTA.
- `.btn--g` — ghost/secondary (bordered, transparent).
- `.btn--sm` — small size modifier, combinable with the above.
- `.card` — the main white rounded container (`--r-xl` radius) used to wrap each screen's primary content.
- `.sect` — a padded section within a card, often with a `.sect__h` header row and `.sect__n` eyebrow/step-number label.

## What your dev needs to do

1. Port the design tokens into your Tailwind config / CSS variables — they're a 1:1 drop-in.
2. Rebuild each screen as a component using your existing data-fetching/props patterns; the mockup's dummy data (arrays in the `<script>` block, e.g. keyword lists, source match stats) should be replaced with real props — only the markup/class structure and copy are meant to be reused.
3. Preserve the `FLOW.kind` branching behavior described above exactly — it's easy to accidentally show a Sources step for product searches or an extra stepper step on the loading screen.
4. The screen-switcher bar at the top of `brand-beacon-app.html` (`.mock` class) is scaffolding only — strip it entirely; do not port `.mock*` styles.
5. All copy in cards/tooltips (e.g. the "Optional, but it sharpens every number on the report" helper text) is final copy, not placeholder — carry it over verbatim unless product wants changes.
