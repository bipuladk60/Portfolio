"use client";

import { useEffect, useMemo, useState } from "react";
import { playBlip } from "@/lib/sound";
import { WarmerGlobe, type GlobeGuess, type LatLon } from "./WarmerGlobe";
import { GREEN, INK, RED, YELLOW, heatWord, toonHeat } from "@/components/toon/toon";

// Approximate country centroids (lat, lon) for the teaser round.
const POOL: (LatLon & { name: string })[] = [
  { name: "Nepal", lat: 28.4, lon: 84.1 },
  { name: "Brazil", lat: -10.8, lon: -52.9 },
  { name: "Kenya", lat: 0.2, lon: 37.9 },
  { name: "Japan", lat: 36.2, lon: 138.3 },
  { name: "Canada", lat: 56.1, lon: -106.3 },
  { name: "Australia", lat: -25.3, lon: 133.8 },
  { name: "France", lat: 46.2, lon: 2.2 },
  { name: "Mexico", lat: 23.6, lon: -102.6 },
  { name: "Egypt", lat: 26.8, lon: 30.8 },
  { name: "Argentina", lat: -38.4, lon: -63.6 },
  { name: "Norway", lat: 64.5, lon: 11.5 },
  { name: "Indonesia", lat: -2.5, lon: 118 },
];

const CHOICES = 6;
const HALF_EARTH_KM = 20015;

function km(a: LatLon, b: LatLon) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

type Guess = { name: string; dist: number; t: number };
type Round = { choices: number[]; target: number };

// Deterministic first render; the hidden country is picked after hydration.
const FIRST: Round = { choices: [0, 1, 2, 3, 4, 5], target: -1 };

function deal(): Round {
  const idx = POOL.map((_, i) => i)
    .sort(() => Math.random() - 0.5)
    .slice(0, CHOICES);
  return { choices: idx, target: idx[Math.floor(Math.random() * CHOICES)] };
}

const roundKm = (d: number) => (Math.round(d / 100) * 100).toLocaleString("en-US");

/** The globe sticker: a six-country warmer/colder round on the cartoon globe. */
export function WarmerTeaser({ href }: { href: string }) {
  const [round, setRound] = useState<Round>(FIRST);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    setRound((r) => ({ ...r, target: r.choices[Math.floor(Math.random() * r.choices.length)] }));
  }, []);

  const solved = guesses.some((g) => g.t === 0);
  const target = round.target >= 0 ? POOL[round.target] : null;

  const globeGuesses: GlobeGuess[] = useMemo(
    () =>
      guesses.map((g) => {
        const c = POOL.find((p) => p.name === g.name)!;
        return { lat: c.lat, lon: c.lon, t: g.t };
      }),
    [guesses],
  );
  const lastGuess = globeGuesses[globeGuesses.length - 1] ?? null;
  const last = guesses[guesses.length - 1];
  const bleed = last ? toonHeat(last.t, last.t === 0) : null;

  const guess = (i: number) => {
    if (!target || solved) return;
    const c = POOL[i];
    if (guesses.some((g) => g.name === c.name)) return;
    const isHit = i === round.target;
    const dist = isHit ? 0 : km(c, target);
    const t = isHit ? 0 : Math.max(0.02, dist / HALF_EARTH_KM);
    const next = [...guesses, { name: c.name, dist, t }];
    setGuesses(next);
    playBlip(isHit ? "unlock" : "click");
    setAnnounce(
      isHit
        ? `${c.name} is correct. Found it in ${next.length} ${next.length === 1 ? "guess" : "guesses"}.`
        : `${c.name}: ${heatWord(t).toLowerCase()}, about ${roundKm(dist)} kilometres away.`,
    );
  };

  const reset = () => {
    setRound(deal());
    setGuesses([]);
    setAnnounce("New round. A new country is hidden.");
  };

  return (
    <div
      data-cursor-box=""
      className="wr-sticker wr-wobble p-4 transition-[background-color] duration-700 md:p-6"
      style={{ background: bleed ? `color-mix(in oklab, ${bleed} 16%, #ffffff)` : "#ffffff" }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="wr-display text-lg font-semibold">Try a mini round</p>
        <p className="text-xs font-bold opacity-70">{guesses.length} {guesses.length === 1 ? "guess" : "guesses"}</p>
      </div>

      <div className="mt-2">
        <WarmerGlobe guesses={globeGuesses} reveal={solved && target ? target : null} focus={solved && target ? target : lastGuess} />
      </div>

      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-bold" aria-hidden>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2" style={{ background: YELLOW, borderColor: INK }} /> far
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2" style={{ background: RED, borderColor: INK }} /> close
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2" style={{ background: GREEN, borderColor: INK }} /> got it
        </span>
      </p>

      <fieldset className="mt-3">
        <legend className="mb-2 text-[13px] font-bold">Which country is hidden? Distances in km.</legend>
        <ul className="grid auto-rows-fr grid-cols-3 gap-2">
          {round.choices.map((i) => {
            const c = POOL[i];
            const g = guesses.find((x) => x.name === c.name);
            const color = g ? toonHeat(g.t, g.t === 0) : undefined;
            return (
              <li key={c.name}>
                <button
                  type="button"
                  onClick={() => guess(i)}
                  disabled={!target}
                  aria-disabled={Boolean(g) || solved}
                  aria-label={g ? `${c.name}, guessed: ${heatWord(g.t, g.t === 0)}` : `Guess ${c.name}`}
                  className={`wr-pill wr-press flex h-full min-h-[3.1rem] w-full cursor-pointer flex-col items-center justify-center !rounded-2xl px-2 py-1.5 text-center ${
                    solved && !g ? "opacity-45" : ""
                  }`}
                  style={{ background: color ?? "#ffffff" }}
                >
                  <span className="text-[13px] font-extrabold leading-tight sm:text-sm">{c.name}</span>
                  {g && (
                    <span className="whitespace-nowrap text-[10px] font-bold leading-tight sm:text-[11px]">
                      {heatWord(g.t, g.t === 0)}
                      {g.t > 0 && ` · ${roundKm(g.dist)}`}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mt-3 flex min-h-10 flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold">
          {solved
            ? `Found it in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}!`
            : guesses.length
              ? "Warmer or colder? Keep going."
              : "Pick a country to start."}
        </p>
        {solved && (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={reset} className="min-h-8 cursor-pointer py-2 text-sm font-bold underline underline-offset-4">
              New round
            </button>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="wr-pill wr-press inline-flex min-h-10 items-center px-4 py-1.5 text-sm font-extrabold"
              style={{ background: GREEN }}
            >
              Play the real one daily →
            </a>
          </div>
        )}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
