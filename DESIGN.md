# Expedition Control — design spec

The portfolio of Bipul Adhikari (CS & Math, USM, from Nepal). One page, one ascent.

## Concept
A dark sci-fi mission-control HUD, warmed by Himalayan cartography and prayer-flag colour semantics.
Scroll position is altitude. The visitor starts at the ground station (Nepal, 1,400 m) and climbs
through camps to the 8,849 m summit, which is Contact. A persistent altimeter replaces the scrollbar.
Telemetry tracks a route from Nepal (28.39 N, 84.12 E, labelled NEPAL/NP, never a city) to Hattiesburg, Mississippi (31.33 N, 89.29 W).

## Camps (see `src/data/camps.ts`)
| Alt | id | Section | Metaphor |
|---|---|---|---|
| 1,400 | base | Hero — Ground Station | Signal acquired. Name in display font, live dual clocks NPT (UTC+5:45) and CST/CDT (America/Chicago), great-circle route arc KTM → MS on a dotted world grid, radar sweep. |
| 2,000 | telemetry | About — Telemetry | Count-up stat gauges (from `stats`), pilot dossier panel with bio, education. |
| 3,500 | route | Experience — Route Log | Vertical ascent route line that draws itself on scroll; each role a camp marker, expandable detail. |
| 5,300 | summits | Hackathons — Summit Attempts | Ridge-line of 6 attempts. 4 wins = gold planted flags; 2 participations = blue "turned back, data gathered" markers. Scoreboard `SUMMITS 4 / ATTEMPTS 6`. Selecting a marker opens a detail panel. |
| 6,100 | lab | Research & ML — Atmospheric Lab | PFAS → COPD study as an air-quality station: animated pipeline, real metrics, model bar chart, findings; other ML work as lab notes. |
| 6,800 | chautari | Games — The Chautari | The one deliberate break: HUD dims, dusk warmth, SVG peepal tree with swaying leaves. Chautari Ludo featured (indie game) with a playable dice-roll teaser. Warmer alongside with a spinning dotted globe. |
| 7,400 | payload | Projects — Payload Bay | Bento grid of mission cards; openbook card runs a live JS bid/ask ladder mini-sim. |
| 8,000 | systems | Skills — Systems Check | Go/no-go checklist; groups flip STANDBY → GO in sequence. No percentage bars. Honors listed too. |
| 8,849 | uplink | Contact — Summit Uplink | Summit reached; prayer flags flutter; transmit console: copy email (pulse + "TRANSMITTED" toast), GitHub, LinkedIn. |

## Tokens (in `globals.css`, use Tailwind names)
bg `#0A0D12`, panel `#10151C`, panel-2 `#151C25`, line `#1F2B38`, line-hi `#2E4052`, text `#E9E5DA`,
dim `#8A97A6`, signal `#F2B418` (amber/wins), sky `#4C8DFF` (participations/links), fire `#FF5C5C`
(projects), water `#34C98A` (research/GO), air `#EDEDE6` (contact), dusk `#2A1A14`, dusk-glow `#FF9A3C`.
Tailwind classes: `bg-bg bg-panel text-text text-dim text-signal border-line` etc.

Fonts (chapter 1, set in `layout.tsx`): `font-display` (Saira Condensed 500-800, `--font-display-face`) headings;
`font-sans` (Barlow 400-600, `--font-body-face`) body; `font-mono` (Martian Mono 400-500, `--font-mono-face`)
telemetry and labels. `.hud-label` = 11px mono uppercase tracked label. Chapter 2 uses Fredoka + Nunito (see Revision 5).
Utilities: `.hud-grid` background grid, `.led` blinking dot.

## Shared primitives (use them, do not re-invent)
- `Panel` (`@/components/hud/Panel`): hairline box with corner brackets, `label`, `accent`. Also `Chip`, `Brackets`.
- `DecodeText`: scramble-to-final text on scroll-in; real text stays in DOM.
- `CampSection` (every section) + `SectionHeader` (`@/components/hud/SectionHeader`, chapter 1 only): a quiet strip
  over the title, "01 — 2,000 m  ▲ +600 m" (camp number, altitude, climb from the previous camp). No tick ruler, no stamps.
  Chapter-2 sections use `ToonHeader` (`sections/shared/ToonHeader.tsx`): a sticker pill "Chapter 2 · 01 · Warmer" over a
  Fredoka title. Never put the dark HUD strip on the sky.
- Research & ML: every entry uses `lab/LabEntry.tsx`, text left and a framed figure right with a caption strip
  "Fig. 0N · label" plus a live status; the caption wraps on narrow screens instead of truncating.
- Animation library: `motion` (import from `"motion/react"`). No GSAP, no three.js, no WebGL
  (the reviewer's headless browser has no WebGL; use SVG / Canvas 2D / CSS).

## Motion language
- Entry: panels assemble, not fade. Brackets/lines draw first, then fill, then text decodes.
  Ease `[0.2, 0.8, 0.2, 1]`, 250–600 ms, 40–80 ms stagger. Use `whileInView` with `viewport={{ once: true }}`.
- Hover: hairline → section colour, small bracket expansion, mono readout. Cards may tilt ≤ 4°.
- Ambient: slow and quiet (10–20% visual weight). Pause canvases offscreen.
- Native scroll stays intact. No scroll-jacking. Pin at most one thing.

## Content rules (non-negotiable)
- ALL facts come from `src/data/content.ts`. Never invent numbers, awards, users, metrics, employers or stack.
  If a component needs text that isn't there, use plain descriptive copy without numbers.
- No emoji. No "passionate developer" copy. No skill percentage bars.
- Plain, confident language. Bipul's voice: direct, specific, not salesy.

## Accessibility & performance
- `useReducedMotion()` from motion: disable decorative motion, show final states.
- Body text always `text-text` or `text-dim` on dark; flag colours for accents/large text only.
- Real semantic structure (`section`, `h2`, `h3`, lists, buttons are `<button>`), decorative SVG `aria-hidden`.
- Everything readable on mobile at 375px wide: no horizontal overflow, no hover-only information
  (anything revealed on hover must also be reachable by tap/focus).
- `"use client"` only on components that need it. Keep each canvas DPR ≤ 1.5 and pause when offscreen.

## Anti-patterns
Purple/blue aurora blobs, glassmorphism, gradient-mesh heroes, generic blue-on-black HUD, Orbitron,
matrix rain, gibberish that hides real content, autoplay sound, unskippable intros, effects on every element,
cultural kitsch (prayer flags and peepal tree are specific, respectful motifs, not wallpaper).

## Revision 2 rules (owner feedback)
- Say "Nepal", never "Kathmandu" or "KTM", in any visible text (labels, boot lines, clocks, themes, toasts, hints).
  The IANA zone id "Asia/Kathmandu" may stay in code only.
- Modest claims: no "led a team", no commit counts, no dollar savings. Copy must come from content.ts.
- Shorter page: the full scroll should feel quick. Prefer one strong visual + 2-3 lines over long lists.
  Avoid tall sections, repeated info, and anything that makes the visitor wait.
- Experience is chronological, oldest at the bottom of the climb: Gulf South (Aug 2024, continues alongside
  everything as a parallel rope), then CadenceAI internship (Mar–Aug 2025), then Illumibot (Sept 2025–May 2026).
- Games: Warmer (live at warmergames.com) is the featured game. Chautari Ludo is secondary and clearly
  marked "In development · not deployed yet".
- Cursor box-lock: the crosshair locks onto any element with `[data-cursor-box]` (every Panel has it) as well as
  links/buttons — reticle brackets expand to hug the box. Add `data-cursor-box` to any other large card/visual
  (e.g. hero map, ridge, globe, project cards).

## Revision 3 rules (owner feedback)
- No "Chautari" anywhere: no Chautari Ludo, no peepal tree / chautari scene, no "chautari" ids or file names.
  The games camp is now id `games`, name "Game Room"; section component `Games` in `sections/Games.tsx`.
  Warmer is the only game.
- Projects: only openbook, MHD Connect and TypeTrie (clipfinder, PartySync and jobradar were removed: not the owner's work).
- Hackathons: 6 hackathons, 4 wins (Hatchathon 2023, HackPrinceton 2024, Hatchathon 2025, ShellHacks 2026 3rd place GridLock),
  2 competed (HackNYU 2025 SwipedIn, Hacklytics 2025). Golden Eagle Idea Pitch moved to honors (pitch, not a hackathon).
- Contact must read plainly as contact. No "SUMMIT REACHED" headline and no summit achievement/toast; the altitude can
  stay as a small label only.
- Hero: no tick-ruler scales on the sides. The route map shows real outlines of the USA and Nepal
  (`src/data/countries.ts`, Natural Earth 1:50m) and is zoomable/pannable while the map box is active.

## Revision 4 rules (owner feedback)
- Hero is clean: no viewport corner brackets / frame and no corner coordinate stamps.
- Game Room gets its own immersive world, the way the old dusk scene broke the HUD, but themed on Warmer itself
  (warmergames.com: cartoon sky, clouds, sticker-style cards, warm→cold heat colours, globe). Feature Warmer's real
  analytics from `games[0].analytics` (2,224 visitors / 4,693 page views in the last 30 days, growth chips, daily sparkline
  labelled approximate). No bounce rate.

## Revision 5: two chapters and the Warmer gate (owner idea)
- Chapter 1 = the dark expedition HUD: base → telemetry → route → summits → lab.
- `gate` (Checkpoint, `sections/Gate.tsx`): a full Warmer round in the HUD style that the visitor must solve to continue.
  The answer is ALWAYS Nepal. Type-ahead country input over `src/data/countryList.ts` (215 countries, label points),
  each guess shows distance + warm/cold heat colour + direction arrow; escalating hints (after 2 guesses: a clue; after 4: "highest point on Earth";
  after 6: a "reveal" button) so nobody gets stuck. On solve call `unlockChapterTwo()` from `@/lib/chapter` and play a
  big transition: the dark HUD world transforms into Warmer's day-sky world (e.g. heat bloom from Nepal floods the
  screen into sky + clouds), then scroll continues into chapter 2.
- Chapter 2 (`<div data-chapter2-root>` in page.tsx: games, payload, systems, uplink) is Warmer's cartoon world:
  day sky, ink outlines, sticker cards, Fredoka (`--font-fredoka`) + Nunito (`--font-nunito`), heat colours.
  Shared tokens/CSS in `@/components/toon/toon` (INK, SKY_*, YELLOW, ORANGE, RED, GREEN, PAPER, WARMER_CSS with
  `.wr-world .wr-display .wr-sticker .wr-pill .wr-press .wr-wobble`). All chapter-2 sections use this theme.
- `html[data-chapter]` is "1" (locked, chapter 2 hidden) or "2"; set pre-paint from localStorage. No JS → everything
  visible. `useChapter()` / `unlockChapterTwo()` / `relockGate()` in `@/lib/chapter`.

## Revision 6 rules (owner feedback)
- Clean first. Chapter 1 especially: fewer boxes, fewer labels, more whitespace. No box inside a box inside a box.
  Prefer one hairline or none over a bracketed Panel; drop decorative mono stamps (coordinates, "LOCK", serials) that
  carry no information. Each section: a heading, one strong visual or list, and plain text. Generous spacing.
- Plain section names: About, Experience, Hackathons, Research & ML, Projects, Skills (see `camps.ts`). No "Summit
  Attempts", "Atmospheric Lab", "Route Log", "Payload Bay", "Systems Check". Hackathon wording: "Win" / "Competed"
  (no "summit", "flag planted", "data gathered", "expedition report", "attempts").
- Cursor: subtle. The box-lock must NOT fire on nested containers. Only explicit top-level visuals opt in
  (`data-cursor-box`, e.g. hero map, hackathon ridge, disease sim, Warmer globe), never every Panel. The lock
  is quiet: thin corner ticks with soft easing, no size readout, low opacity. Links/buttons keep a light hug.
- Stats: "2,600+ Users · MHD Connect + Warmer" replaces conference attendees.
- Research: PFAS study was done at Gulf South (`research.where`). Add the stochastic disease transmission model
  (`diseaseSim` in content.ts) with a live, faithful browser re-run of the notebook's model.
- Links: only links verified working (swipedin.co and the openbook repo were removed).
- Chapter transition: smooth and professional. One continuous, eased move from night HUD to day sky
  (no flashes, no jumpy stages, no long text cards), about 2–2.5 s, Escape/skip still works, reduced motion = quick fade.

## Revision 7: in between (owner feedback)
"I wanted it clean but not this clean, it's boring now, make something in between."
Rev 6 stripped too much: About and Experience are floating text on a flat background with large dead gaps.
Target: rich but calm. Keep the Rev 6 bans (no box inside a box inside a box, no meaningless serial/coordinate
stamps, quiet cursor, plain section names, facts only from content.ts), but bring back character:
- Surfaces: ONE level of containment is fine and wanted. Use soft tinted surfaces (panel fill, faint gradient, a
  hairline, small corner accents in the section colour) to group content. Cards may hover-lift / tilt ≤ 3°.
- Depth and atmosphere: section-colour glows behind headings or key visuals, layered ridge silhouettes / contour
  parallax between sections, subtle grain. Each section should have one signature visual, not just text.
- Meaningful decoration: small data-driven visuals that encode real facts (e.g. 4 flags for 4 wins, 6 pips for 6
  hackathons, Warmer's daily sparkline for users, a timeline with year ticks) rather than generic stamps.
- Motion: purposeful entry choreography (draw, stagger, count-up), hover micro-interactions; nothing loops loudly.
- Density: no empty bands taller than ~25% of the viewport inside a section on desktop.
- Rev 7 primitives (`@/components/hud`): `Surface` (one tinted surface; `accent`, `corners`, `lift`) plus `Ticks` and
  `Glow` in `Surface.tsx`; `.surface` / `.surface-lift` / `.surface-tick` in `globals.css`; `Assemble` + `AssembleItem`
  (clip-draw then content rise, once in view); `Ridgeline` (layered Himalayan silhouettes with scroll + pointer parallax);
  `SectionHeader` takes optional `glow` and `className`.
