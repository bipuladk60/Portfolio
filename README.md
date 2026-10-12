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
- **Type:** Chakra Petch for headings, IBM Plex Sans for body text, JetBrains Mono for telemetry and the small `.hud-label` captions.
- **Look:** clean first. Fewer boxes, hairlines over bracketed panels, generous whitespace, and no decorative stamps that carry no information.
- **Signature visuals:** a zoomable route map with real Nepal and USA outlines (Natural Earth), live dual clocks for Nepal and Central time, a hackathon ridge line, and a live in-browser re-run of a stochastic disease transmission model.

### The Checkpoint

Between the chapters there's a full round of Warmer drawn in the HUD style. You type a country, and each guess shows its distance, a warm-to-cold heat colour and a direction arrow. Hints escalate so nobody gets stuck: a clue after 2 guesses, "highest point on Earth" after 4, and a Reveal button after 6. The answer is always Nepal.

Solving it plays a single eased transition of about 2.5 s. The night deepens, a warm light rises from the globe and becomes the day sun, the sky slides from night through dawn to day, and clouds settle where chapter 2's clouds sit. Escape, a click or the Skip pill skips it, and reduced motion gets a quick cross-fade.

### Chapter 2: Warmer's world

This is a cartoon day sky with ink outlines and sticker cards, based on the real game at warmergames.com.

- **Tokens** (`src/components/toon/toon.ts`): ink `#1D2340`, sky `#BFE5FF` to `#E9F7FF`, paper `#FFFFFF`, and the game's heat scale: yellow `#FFD23F` (far), orange `#FF9F1C`, red `#EF3B2C` (close), green `#2ED3A0` (found).
- **Type:** Fredoka for display text, Nunito for body text.
- **Components:** the `.wr-sticker` card (3 px ink border, hard 6 px offset shadow), `.wr-pill`, `.wr-press` (the card presses into its shadow on click) and `.wr-wobble`.

## How it works

- **Chapter state** (`src/lib/chapter.ts`): `html[data-chapter]` is `"1"` (locked) or `"2"`. It's set before paint from localStorage so the page never flashes. `useChapter()`, `unlockChapterTwo()` and `relockGate()` drive it, and with JavaScript disabled everything is visible.
- **Chrome** (`src/components/chrome/`): the altimeter, a crosshair cursor, a ⌘K command palette (go to a section, skip or replay the checkpoint, copy email, themes, sound, achievements), toasts, boot sequence and easter eggs.
- **Cursor:** a small dot with faint ticks. It locks onto an element only when that element opts in with `data-cursor-box="lock"`. Only top-level visuals do, such as the route map, ridge, disease sim and Warmer globe. The lock shows thin corner ticks with soft easing, and links and buttons get a light hug. It turns ink-coloured in chapter 2 and is off on touch screens and under reduced motion.
- **Content** (`src/data/content.ts`): every fact on the page comes from this one file. Components never invent numbers, awards or metrics.

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
