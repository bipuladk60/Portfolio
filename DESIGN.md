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

Fonts: `font-display` (Chakra Petch 500-700) headings/HUD; `font-sans` (IBM Plex Sans) body;
`font-mono` (JetBrains Mono) telemetry and labels. `.hud-label` = 11px mono uppercase tracked label.
Utilities: `.hud-grid` background grid, `.led` blinking dot.

## Shared primitives (use them, do not re-invent)
- `Panel` (`@/components/hud/Panel`): hairline box with corner brackets, `label`, `accent`. Also `Chip`, `Brackets`.
- `DecodeText`: scramble-to-final text on scroll-in; real text stays in DOM.
- `CampSection` + `SectionHeader` (`@/components/hud/SectionHeader`): every section must use these.
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
