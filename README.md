# Portfolio

The personal site of Bipul Adhikari (CS & Math, from Nepal). It's a single page that you scroll like a climb. You start in a dark expedition control room, solve one round of my geography game Warmer at a checkpoint, and then the page turns into Warmer's cartoon day-sky world.

Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 and `motion`. There's no WebGL and no three.js. Everything is SVG, Canvas 2D or CSS.

## Running it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
pnpm lint
pnpm exec tsc --noEmit
```

## The idea: scroll is altitude

The page is one ascent from 1,400 m to 8,849 m. Each section is a "camp" at a fixed altitude (`src/data/camps.ts`), and an altimeter on the right edge stands in for the scrollbar.

| Altitude | Section | Chapter |
|---|---|---|
| 1,400 m | Ground Station (hero) | 1 |
| 2,000 m | About | 1 |
| 3,500 m | Experience | 1 |
| 5,300 m | Hackathons | 1 |
| 6,100 m | Research & ML | 1 |
| 6,400 m | Checkpoint (the Warmer gate) | 1 |
| 6,800 m | Warmer | 2 |
| 7,400 m | Projects | 2 |
| 8,000 m | Skills | 2 |
| 8,849 m | Contact | 2 |

## Two chapters, two themes

### Chapter 1: the expedition HUD

This is a dark mission-control look with Himalayan cartography and prayer-flag colours.

- **Palette** (`src/app/globals.css`, exposed as Tailwind colours): bg `#0A0D12`, panel `#10151C`, line `#1F2B38`, text `#E9E5DA`, dim `#8A97A6`. Each accent maps to a prayer-flag meaning: signal amber `#F2B418` (wins), sky blue `#4C8DFF` (links), fire red `#FF5C5C` (projects), water green `#34C98A` (research), air `#EDEDE6` (contact).
- **Type:** Saira Condensed for headings (tall, squared, like expedition signage), Barlow for body text (a warm grotesk drawn from highway signs) and Martian Mono for telemetry and the small `.hud-label` captions (a wide, instrument-panel mono).
- **Look:** clean, but still an instrument. There's generous whitespace and no box-in-box nesting. HUD details carry information: every section opens on a quiet strip (camp number, altitude and the climb from the previous camp), and key visuals sit in framed instruments with corner brackets, a figure number and a live status light.
- **Signature visuals:** a zoomable route map with real Nepal and USA outlines (Natural Earth), live dual clocks for Nepal and Central time, a hackathon ridge line, and a live degree-progress dial.
- **Research & ML:** all three entries share one layout (`lab/LabEntry.tsx`): text on the left and a framed figure on the right.
  - PFAS and COPD: the study's findings plus a model comparison.
  - Stochastic disease transmission: the notebook's agent-based model re-run in the browser. It loops forever, starting a new outbreak after each run.
  - RNN music generation: the model's real generated tune, replayed one sampled character at a time onto a piano roll, with opt-in sound.

### The Checkpoint

Between the chapters there's a full round of Warmer drawn in the HUD style. The globe is a 1-degree equal-area dot lattice (`src/data/globeDots.ts`, about 41k dots, generated from Natural Earth 1:50m) in which every land dot knows its country. A guess fills its whole country in heat colour, and each guess also shows its distance and a direction arrow. Hints escalate so nobody gets stuck: a clue after 2 guesses, "highest point on Earth" after 4, and a Reveal button after 6. The answer is always Nepal.

Solving it plays a single eased transition of about 2.5 s. The night deepens, a warm light rises from the globe and becomes the day sun, the sky slides from night through dawn to day, and clouds settle where chapter 2's clouds sit. Escape, a click or the Skip pill skips it, and reduced motion gets a quick cross-fade.

### Chapter 2: Warmer's world

This is a cartoon day sky with ink outlines and sticker cards, based on the real game at warmergames.com.

- **Tokens** (`src/components/toon/toon.ts`): ink `#1D2340`, sky `#BFE5FF` to `#E9F7FF`, paper `#FFFFFF`, and the game's heat scale: yellow `#FFD23F` (far), orange `#FF9F1C`, red `#EF3B2C` (close), green `#2ED3A0` (found).
- **Type:** Fredoka for display text, Nunito for body text.
- **Components:** the `.wr-sticker` card (3 px ink border, hard 6 px offset shadow), `.wr-pill`, `.wr-press` (the card presses into its shadow on click) and `.wr-wobble`.

## How it works

- **Chapter state** (`src/lib/chapter.ts`): `html[data-chapter]` is `"1"` (locked) or `"2"`. It's set before paint from localStorage so the page never flashes. `useChapter()`, `unlockChapterTwo()` and `relockGate()` drive it, and with JavaScript disabled everything is visible.
- **Chrome** (`src/components/chrome/`): the altimeter, a crosshair cursor, a ⌘K command palette (go to a section, skip or replay the checkpoint, copy email, themes, sound, achievements), toasts and easter eggs. No intro screen: the page opens straight on the hero.
- **Cursor:** a small dot with faint ticks. It locks onto an element only when that element opts in with `data-cursor-box="lock"`. Only top-level visuals do, such as the route map, ridge, disease sim and Warmer globe. The lock shows thin corner ticks with soft easing, and links and buttons get a light hug. It turns ink-coloured in chapter 2 and is off on touch screens and under reduced motion.
- **Content** (`src/data/content.ts`): every fact on the page comes from this one file. Components never invent numbers, awards or metrics.

## Live Warmer search data

The "Found on Google" tab in the Warmer section can show live Google Search Console numbers instead of the dated snapshot in `content.ts`. The scope is the same as the snapshot: web search, the homepage `https://warmergames.com/` only, since launch (2026-07-21). Both values live in `games[0].search` (`scopePage`, `launchDate`).

**Setup (once):**

1. In Google Cloud, pick or create a project and enable the **Google Search Console API**.
2. Create a service account (no roles needed), then add a **JSON key** and download it.
3. In Search Console, open the Domain property `sc-domain:warmergames.com`, go to Settings → Users and permissions, and add the service account's email as a **Restricted** user.
4. For local builds, copy `.env.example` to `.env.local` and fill in `GSC_CLIENT_EMAIL` (the JSON's `client_email`) and `GSC_PRIVATE_KEY` (the JSON's `private_key`, kept on one line with its `\n` escapes, in double quotes). `GSC_SITE_URL` is optional and defaults to `sc-domain:warmergames.com`.
5. For the deployed site, add `GSC_CLIENT_EMAIL` and `GSC_PRIVATE_KEY` as **GitHub Actions secrets** (repo Settings → Secrets and variables → Actions) and pass them as `env` to the build step. They are only needed at build time; never commit them.

**How it works:** the site is a static export (GitHub Pages), so there is no server at runtime. During `next build`, the Warmer section (a server component) calls `src/lib/server/searchConsole.ts`, which signs a service-account JWT with Node `crypto` (no Google SDK), swaps it for a read-only access token and queries `searchAnalytics/query` by date. The numbers are baked into the static HTML, so they stay crawlable. Totals are summed. CTR is clicks / impressions, and the average position is the impression-weighted mean of the daily positions, so it can differ from the Search Console UI by a tenth or so. Freshness comes from a scheduled GitHub Action that rebuilds about every 6 hours; the pill shows the build date ("Updated {date}") and the scope line shows the last day Search Console has data for. In `pnpm dev`, a successful result is memoised in-process for 6 hours so reloads don't call Google each time.

**Fallback:** with no credentials, or on any error or a 5 s timeout, the tab shows the `content.ts` snapshot labelled "Snapshot" with its illustrative curve, exactly as before. Builds never fail because of it. Failures log one line without any credentials. The Traffic tab (Vercel Analytics) is always the static snapshot.

## Motion language

- **Library:** `motion` (`motion/react`) only, with no GSAP.
- **Entrances:** panels assemble rather than fade. Lines draw first, then fills, then text. The ease is `[0.2, 0.8, 0.2, 1]`, durations run 250 to 600 ms, and items stagger by 40 to 80 ms.
- **Ambient motion** stays slow and quiet, and canvases pause when they're offscreen. Native scroll is never hijacked.
- **Keyframes:** when keyframing with `times`, end every track at 1 and set easing per segment. Otherwise motion 14 drifts values back to their base style.

## Accessibility and performance

- `useReducedMotion()` turns off decorative motion and shows final states.
- Markup is semantic (`section`, headings, real `<button>`s), and decorative SVG is `aria-hidden`.
- Everything works at 375 px wide with no horizontal scroll, and anything shown on hover is also reachable by tap or focus.
- Canvas DPR is capped at 1.5, and `"use client"` is only used where it's needed.

## Layout

```
src/
  app/                 layout, page, globals.css (chapter 1 tokens)
  components/
    chrome/            altimeter, cursor, palette, toasts, boot
    hud/               Panel, SectionHeader, DecodeText
    sections/          one file per section + a folder of its parts
      gate/            Warmer round, HUD globe, chapter transition
    toon/              chapter 2 tokens and sticker CSS
  data/                content.ts, camps.ts, country outlines and list
  lib/                 chapter state, scroll, store, sound, theme
```

The full design spec and the history of owner feedback rounds live in [DESIGN.md](DESIGN.md).
