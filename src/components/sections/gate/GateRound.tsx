"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SectionHeader } from "@/components/hud/SectionHeader";
import { countries, NEPAL, type Country } from "@/data/countryList";
import { relockGate, unlockChapterTwo, useChapter } from "@/lib/chapter";
import { playBlip } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { heatWord, toonHeat } from "@/components/toon/toon";
import { HudGlobe, type HudGuess } from "./HudGlobe";
import { ChapterTransition } from "./ChapterTransition";
import { bearing, compassWord, gateGuesses, HALF_EARTH_KM, km, rememberGuesses, roundKm } from "./gateStore";

type Guess = { code: string; name: string; lat: number; lon: number; dist: number; t: number; deg: number };

const GLOW = "var(--dusk-glow)";

/** A few faint stars over the round (deterministic, so server and client agree). */
const STARS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 37.3 + 11) % 100, y: ((i * 53.7) % 45) + 3, o: 0.2 + ((i * 7) % 5) / 12 }));

// The threshold: dusk light breathing slowly behind a low ridge at the bottom edge, hinting at the
// day sky of chapter 2. Static under reduced motion.
const GATE_ATMOS_CSS = `
@keyframes gate-breathe { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }
.gate-dusk { animation: gate-breathe 7s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .gate-dusk { animation: none; } }
`;
const GATE_RIDGE_LINE =
  "M0 48 L60 40 L110 46 L170 30 L215 38 L260 22 L300 34 L350 28 L410 42 L470 26 L520 12 L560 26 L610 20 L670 36 L720 30 L780 40 L840 24 L900 34 L960 30 L1000 40";
const GATE_RIDGE = `${GATE_RIDGE_LINE} L1000 70 L0 70 Z`;
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();

const INDEX = countries.map((c) => ({ c, keys: [c.name, ...c.aliases].map(norm) }));

function search(q: string): Country[] {
  const n = norm(q);
  if (!n) return [];
  const starts: Country[] = [];
  const contains: Country[] = [];
  for (const { c, keys } of INDEX) {
    if (keys.some((k) => k.startsWith(n))) starts.push(c);
    else if (keys.some((k) => k.includes(n))) contains.push(c);
  }
  return [...starts, ...contains].slice(0, 6);
}

const exact = (q: string) => {
  const n = norm(q);
  return INDEX.find(({ keys }) => keys.includes(n))?.c ?? null;
};

/** The checkpoint: one Warmer round in the HUD style. The answer is always Nepal. */
export function GateRound() {
  const reduce = useReducedMotion();
  const stored = useStore(gateGuesses);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [announce, setAnnounce] = useState("");
  const [solved, setSolved] = useState(false);
  const [transition, setTransition] = useState<{ x: number; y: number } | null>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const startTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(startTimer.current), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const optId = (i: number) => `${listId}-opt-${i}`;

  const results = useMemo(() => search(query), [query]);
  const wrong = guesses.filter((g) => g.t > 0).length;
  const globeGuesses: HudGuess[] = guesses.map((g) => ({ code: g.code, lat: g.lat, lon: g.lon, t: g.t }));
  const latest = guesses[guesses.length - 1];

  const finish = (count: number | null) => {
    setSolved(true);
    setOpen(false);
    rememberGuesses(count);
    playBlip("unlock");
    // Let the winning row land and the globe start turning to Nepal before the sky moves.
    window.clearTimeout(startTimer.current);
    startTimer.current = window.setTimeout(() => {
      const r = globeRef.current?.getBoundingClientRect();
      setTransition(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }, reduce ? 0 : 180);
  };

  const submit = (c: Country) => {
    if (solved) return;
    setQuery("");
    setOpen(false);
    if (guesses.some((g) => g.code === c.code)) {
      setAnnounce(`${c.name} was already guessed. Try another country.`);
      return;
    }
    const hit = c.code === NEPAL.code;
    const dist = hit ? 0 : km(c, NEPAL);
    const t = hit ? 0 : Math.max(0.01, dist / HALF_EARTH_KM);
    const deg = hit ? 0 : bearing(c, NEPAL);
    const next = [...guesses, { code: c.code, name: c.name, lat: c.lat, lon: c.lon, dist, t, deg }];
    setGuesses(next);
    if (hit) {
      setAnnounce(`Nepal is correct. Found it in ${next.length} ${next.length === 1 ? "guess" : "guesses"}. Opening chapter two.`);
      finish(next.length);
    } else {
      playBlip("click");
      setAnnounce(`${c.name}: ${heatWord(t).toLowerCase()}, ${roundKm(dist)} kilometres away. Head ${compassWord(deg)}.`);
    }
  };

  const reveal = () => {
    const next = [...guesses, { code: NEPAL.code, name: NEPAL.name, lat: NEPAL.lat, lon: NEPAL.lon, dist: 0, t: 0, deg: 0 }];
    setGuesses(next);
    setAnnounce("The answer was Nepal. Opening chapter two.");
    finish(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = (open && results[active]) || exact(query) || (results.length === 1 ? results[0] : null);
      if (pick) submit(pick);
      else if (query.trim()) setAnnounce(`No country matches "${query.trim()}".`);
    }
  };

  const reset = useCallback(() => {
    window.clearTimeout(startTimer.current);
    rememberGuesses(null);
    setGuesses([]);
    setSolved(false);
    setQuery("");
    setOpen(false);
    setTransition(null);
    setAnnounce("");
  }, []);

  const playAgain = () => {
    relockGate();
    reset();
    requestAnimationFrame(() => {
      document.getElementById("gate")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      inputRef.current?.focus({ preventScroll: true });
    });
  };

  // Relocked from elsewhere (e.g. the command palette): make the round playable again.
  const chapter = useChapter();
  const wasTwo = useRef(false);
  useEffect(() => {
    if (chapter === 2) wasTwo.current = true;
    else if (wasTwo.current) {
      wasTwo.current = false;
      reset();
    }
  }, [chapter, reset]);
  useEffect(() => {
    const onChapter = (e: Event) => {
      if ((e as CustomEvent<number>).detail === 1) reset();
    };
    window.addEventListener("xc:chapter", onChapter);
    return () => window.removeEventListener("xc:chapter", onChapter);
  }, [reset]);

  const [lift, setLift] = useState(false);
  const focusInput = () => {
    setOpen(true);
    // On phones, lift the input near the top so suggestions stay above the keyboard. The gate is the
    // last thing on the page in chapter 1, so add temporary room below it to make that scroll possible.
    if (window.innerWidth < 768 && inputRef.current) {
      setLift(true);
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 56;
        window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      });
    }
  };

  const count = solved ? guesses.length : stored;
  const expanded = open && results.length > 0 && !solved;

  return (
    <>
      {/* compact strip, shown in chapter 2 (CSS-gated on html[data-chapter] so it is right before hydration) */}
      <div className="gate-strip">
        <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-panel/70 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em]">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#2ed3a0" }} aria-hidden />
            <span className="text-text">Checkpoint cleared</span>
            <span className="text-dim">· Nepal</span>
            {count ? <span className="text-dim">· in {count} {count === 1 ? "guess" : "guesses"}</span> : null}
          </p>
          <button type="button" onClick={playAgain} className="min-h-8 cursor-pointer py-1 text-dim underline-offset-4 hover:text-text hover:underline">
            Play again
          </button>
        </div>
      </div>

      {/* the round, shown in chapter 1 */}
      <div className="gate-full">
        <SectionHeader
          campId="gate"
          title="Checkpoint"
          kicker="Find the country to continue. One round of Warmer stands between you and the next chapter."
        />
        <style>{GATE_ATMOS_CSS}</style>
        <div
          className="relative overflow-hidden border px-4 pb-16 pt-5 md:px-8 md:pb-24 md:pt-8"
          style={{
            borderColor: "color-mix(in oklab, var(--dusk-glow) 22%, var(--line))",
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--panel) 75%, transparent) 0%, color-mix(in oklab, var(--panel) 85%, var(--dusk)) 55%, color-mix(in oklab, var(--dusk) 85%, var(--panel)) 100%)",
          }}
        >
          {/* atmosphere: faint stars up top, dusk light rising behind a low ridge at the bottom edge */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {STARS.map((st, i) => (
              <span
                key={i}
                className="absolute h-px w-px rounded-full bg-text"
                style={{ left: `${st.x}%`, top: `${st.y}%`, opacity: st.o }}
              />
            ))}
            <div
              className="gate-dusk absolute inset-x-0 bottom-0 h-[70%]"
              style={{
                background:
                  "radial-gradient(ellipse 65% 70% at 50% 100%, color-mix(in oklab, var(--dusk-glow) 26%, transparent), color-mix(in oklab, var(--dusk-glow) 6%, transparent) 55%, transparent 80%)",
              }}
            />
            <svg viewBox="0 0 1000 70" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full md:h-16">
              <path d={GATE_RIDGE} fill="var(--bg)" opacity="0.92" />
              <path
                d={GATE_RIDGE_LINE}
                fill="none"
                stroke="var(--dusk-glow)"
                strokeOpacity="0.45"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2" style={{ borderColor: GLOW }} />
            <span className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2" style={{ borderColor: GLOW }} />
          </div>

          <div className="relative grid items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10">
            <div ref={globeRef} className="order-2 md:order-1">
              <div
                className="mx-auto w-[160px] md:w-auto"
                style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--dusk-glow) 10%, transparent) 70%, transparent)" }}
              >
                <HudGlobe guesses={globeGuesses} focus={latest ? { lat: latest.lat, lon: latest.lon } : null} bloom={solved ? NEPAL : null} />
              </div>
              <div className="mx-auto mt-3 hidden max-w-[380px] items-center gap-3 md:flex" aria-hidden>
                <span className="hud-label !text-[10px]">Close</span>
                <span className="h-1 flex-1" style={{ background: "linear-gradient(to right, #ef3b2c, #ff9f1c, #ffd23f)" }} />
                <span className="hud-label !text-[10px]">Far</span>
              </div>
            </div>

            <div className="order-1 min-w-0 md:order-2">
              <label htmlFor={`${listId}-input`} className="hud-label" style={{ color: GLOW }}>
                Type a country
              </label>
              <div className="relative mt-2">
                <div className="flex items-center gap-3 border-b-2 border-line-hi transition-[border-color,box-shadow] duration-300 focus-within:border-[var(--dusk-glow)] focus-within:shadow-[0_10px_18px_-14px_var(--dusk-glow)]">
                <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-dim" aria-hidden>
                  <circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10.6 10.6 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  id={`${listId}-input`}
                  type="text"
                  role="combobox"
                  aria-expanded={expanded}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={expanded ? optId(active) : undefined}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={solved}
                  value={query}
                  placeholder={guesses.length ? "Another guess…" : "e.g. Brazil"}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                    setOpen(true);
                  }}
                  onFocus={focusInput}
                  onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                  onKeyDown={onKeyDown}
                  className="w-full bg-transparent py-3 pr-2 font-mono text-base text-text outline-none placeholder:text-dim/60 md:text-lg"
                  // focus shows as the underline turning dusk-orange (focus-within above), not a second box
                  style={{ outline: "none" }}
                />
                </div>
                {expanded && (
                  <ul
                    id={listId}
                    role="listbox"
                    aria-label="Matching countries"
                    className="absolute inset-x-0 top-full z-20 mt-1 border border-line-hi bg-panel shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
                  >
                    {results.map((c, i) => {
                      const done = guesses.some((g) => g.code === c.code);
                      return (
                        <li
                          key={c.code}
                          id={optId(i)}
                          role="option"
                          aria-selected={i === active}
                          data-cursor=""
                          onMouseDown={(e) => {
                            e.preventDefault();
                            submit(c);
                          }}
                          onMouseEnter={() => setActive(i)}
                          className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm ${i === active ? "bg-line text-text" : "text-dim"}`}
                        >
                          <span>{c.name}</span>
                          {done && <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim/70">guessed</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* guesses, closest first (like Warmer); the newest is highlighted */}
              <ol
                className={`mt-5 divide-y divide-line/80 ${guesses.length ? "border-y border-line/80" : ""}`}
                aria-label="Your guesses, closest first"
              >
                <AnimatePresence initial={false}>
                  {[...guesses].sort((a, b) => a.dist - b.dist).map((g) => {
                    const found = g.t === 0;
                    const col = toonHeat(g.t, found);
                    const isNew = g.code === latest?.code;
                    return (
                      <motion.li
                        key={g.code}
                        // The winning row lands at the top in place: it fades in without sliding, and the
                        // rows below jump down instantly, so nothing slides over anything.
                        initial={{ opacity: 0, y: found ? 0 : -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduce ? 0 : found ? 0.2 : 0.3 }}
                        className="relative grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 py-2.5 pl-4 pr-1 font-mono text-[12px] sm:gap-3"
                        layout={!reduce && !solved}
                        style={{
                          background: isNew ? `linear-gradient(90deg, color-mix(in oklab, ${col} 16%, transparent), transparent 85%)` : undefined,
                        }}
                      >
                        <span aria-hidden className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full" style={{ background: col }} />
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-sans text-sm text-text">{g.name}</span>
                          {isNew && guesses.length > 1 && (
                            <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: col }}>
                              latest
                            </span>
                          )}
                        </span>
                        <span className="tabular-nums text-dim">{found ? "0 km" : `${roundKm(g.dist)} km`}</span>
                        <span
                          className="min-w-14 rounded-full px-2 py-0.5 text-center text-[11px] uppercase tracking-[0.1em]"
                          style={{ color: col, background: `color-mix(in oklab, ${col} 16%, transparent)` }}
                        >
                          {heatWord(g.t, found)}
                        </span>
                        <span
                          aria-label={found ? "here" : `head ${compassWord(g.deg)}`}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-[13px]"
                          style={{ borderColor: col, color: col }}
                        >
                          {found ? "●" : <span style={{ display: "inline-block", transform: `rotate(${Math.round(g.deg)}deg)` }}>↑</span>}
                        </span>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ol>
              {guesses.length === 0 && (
                <p className="mt-4 text-sm text-dim">
                  Each guess shows how far you are, glows from yellow (far) to red (close), and points the way.
                </p>
              )}

              {/* hints */}
              <div className="mt-4 space-y-2 text-sm">
                {wrong >= 2 && !solved && <p className="text-text">Hint: the answer is a country Bipul knows well.</p>}
                {wrong >= 4 && !solved && <p className="text-text">Hint: home of the highest point on Earth.</p>}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {wrong >= 6 && !solved && (
                    <button
                      type="button"
                      onClick={reveal}
                      className="min-h-9 cursor-pointer rounded-full bg-[color-mix(in_oklab,var(--dusk-glow)_16%,transparent)] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--dusk-glow)] transition-colors duration-300 hover:bg-[var(--dusk-glow)] hover:text-bg"
                    >
                      Reveal it
                    </button>
                  )}
                  {wrong >= 1 && !solved && (
                    <button
                      type="button"
                      onClick={reveal}
                      className="min-h-8 cursor-pointer py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-dim/80 underline-offset-4 hover:text-text hover:underline"
                    >
                      Skip puzzle
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {lift && !solved && <div aria-hidden className="h-[60vh] md:hidden" />}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>

      {transition && (
        <ChapterTransition
          origin={transition}
          onCovered={() => {
            unlockChapterTwo();
            const el = document.getElementById("games");
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
          }}
          onDone={() => setTransition(null)}
        />
      )}
    </>
  );
}
