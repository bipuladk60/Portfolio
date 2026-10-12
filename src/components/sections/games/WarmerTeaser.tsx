"use client";

import { useEffect, useMemo, useState } from "react";
import { playBlip } from "@/lib/sound";
import { heatRGB, WarmerGlobe, type GlobeGuess, type LatLon } from "./WarmerGlobe";

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

function word(t: number) {
  if (t === 0) return "Found it";
  if (t < 0.1) return "Hot";
  if (t < 0.22) return "Warm";
  if (t < 0.42) return "Cool";
  return "Cold";
}

type Guess = { name: string; dist: number; t: number };

type Round = { choices: number[]; target: number };

// Deterministic first render (no target shown until hydrated); a random round is dealt on mount.
const FIRST: Round = { choices: [0, 1, 2, 3, 4, 5], target: -1 };

function deal(): Round {
  const idx = POOL.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, CHOICES);
  return { choices: idx, target: idx[Math.floor(Math.random() * CHOICES)] };
}

export function WarmerTeaser({ href }: { href: string }) {
  const [round, setRound] = useState<Round>(FIRST);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    // pick the hidden country after hydration so server and client markup match
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
        : `${c.name}: ${word(t).toLowerCase()}, about ${Math.round(dist / 100) * 100} kilometres away.`,
    );
  };

  const reset = () => {
    setRound(deal());
    setGuesses([]);
    setAnnounce("New round. A new country is hidden.");
  };

  return (
    <div>
      <WarmerGlobe guesses={globeGuesses} reveal={solved && target ? target : null} focus={solved && target ? target : lastGuess} />

      <div className="mx-auto mt-3 flex max-w-[360px] items-center gap-3" aria-hidden>
        <span className="hud-label !text-[10px]">Hot</span>
        <span className="h-1 flex-1" style={{ background: "linear-gradient(to right, #ff5c5c, #ff9a3c, #f2b418, #8a97a6, #4c8dff)" }} />
        <span className="hud-label !text-[10px]">Cold</span>
      </div>

      <fieldset className="mx-auto mt-5 max-w-[420px]">
        <legend className="hud-label mb-2 !text-[10px]" style={{ color: "var(--dusk-glow)" }}>
          Mini round · which country is hidden? (distances in km)
        </legend>
        <ul className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3">
          {round.choices.map((i) => {
            const c = POOL[i];
            const g = guesses.find((x) => x.name === c.name);
            const color = g ? `rgb(${heatRGB(g.t)})` : undefined;
            return (
              <li key={c.name}>
                <button
                  type="button"
                  onClick={() => guess(i)}
                  disabled={!target}
                  aria-disabled={Boolean(g) || solved}
                  aria-label={g ? `${c.name}, guessed: ${word(g.t)}` : `Guess ${c.name}`}
                  className={`flex h-full min-h-[3.25rem] w-full cursor-pointer flex-col items-start justify-center border px-3 py-1.5 text-left transition-colors duration-200 ${
                    g ? "" : "border-line-hi hover:border-[var(--dusk-glow)]"
                  } ${solved && !g ? "opacity-50" : ""}`}
                  style={
                    g
                      ? { borderColor: color, background: `color-mix(in oklab, ${color} 14%, transparent)` }
                      : { background: "color-mix(in oklab, #140d0a 70%, transparent)" }
                  }
                >
                  <span className="text-sm text-text">{c.name}</span>
                  {g && (
                    <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.08em]" style={{ color }}>
                      {word(g.t)}
                      {g.t > 0 && ` ~${(Math.round(g.dist / 100) * 100).toLocaleString("en-US")}`}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mx-auto mt-4 flex min-h-11 max-w-[420px] flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
          {solved ? (
            <span className="text-[var(--dusk-glow)]">
              Found in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}
            </span>
          ) : guesses.length ? (
            `Guesses ${guesses.length}`
          ) : (
            "Pick a country"
          )}
        </p>
        {solved && (
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-8 cursor-pointer items-center py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-dim hover:text-text"
            >
              New round
            </button>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-8 items-center py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--dusk-glow)] underline decoration-[color-mix(in_oklab,var(--dusk-glow)_45%,transparent)] underline-offset-4"
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
