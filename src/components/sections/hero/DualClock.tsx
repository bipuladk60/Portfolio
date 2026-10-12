"use client";

import { useEffect, useState } from "react";

type Station = { code: string; city: string; zone: string; fallbackAbbr: string };

const STATIONS: Station[] = [
  { code: "NP", city: "Nepal", zone: "Asia/Kathmandu", fallbackAbbr: "NPT" },
  { code: "MS", city: "Hattiesburg, MS", zone: "America/Chicago", fallbackAbbr: "CT" },
];

type Reading = { time: string; abbr: string; offset: string; minutes: number };

/** "UTC+5:45" -> 345, "UTC-5" -> -300. */
function offsetMinutes(o: string) {
  const m = o.match(/([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

function read(now: Date, s: Station): Reading {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: s.zone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const part = (opt: "short" | "shortOffset") =>
    new Intl.DateTimeFormat("en-US", { timeZone: s.zone, timeZoneName: opt })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  const short = part("short");
  const offset = part("shortOffset").replace("GMT", "UTC") || "UTC";
  // en-US gives CST/CDT for Chicago but only "GMT+5:45" for Nepal, so fall back to NPT there.
  const abbr = /^[A-Z]{2,5}$/.test(short) ? short : s.fallbackAbbr;
  const clean = offset === "UTC" ? "UTC+0" : offset;
  return { time, abbr, offset: clean, minutes: offsetMinutes(clean) };
}

/**
 * Live dual clocks for the two ends of the route. Renders "--:--:--" on the server and
 * until the first client tick, so markup never mismatches during hydration.
 */
export function DualClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    // Align ticks to the wall-clock second.
    let interval = 0;
    const timeout = window.setTimeout(() => {
      setNow(new Date());
      interval = window.setInterval(() => setNow(new Date()), 1000);
    }, 1000 - (Date.now() % 1000));
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const readings = STATIONS.map((s) => (now ? read(now, s) : null));
  const gap = readings[0] && readings[1] ? readings[0].minutes - readings[1].minutes : null;
  const gapLabel = gap === null ? "--:--" : `${Math.floor(gap / 60)}:${String(gap % 60).padStart(2, "0")}`;

  const cell = (s: Station, i: number) => {
    const r = readings[i];
    const accent = i === 0 ? "text-signal" : "text-sky";
    return (
      <div key={s.code} className={`min-w-0 ${i === 1 ? "text-right" : ""}`}>
        <dt className={`hud-label flex items-center gap-2 ${i === 1 ? "justify-end" : ""}`}>
          <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${i === 0 ? "bg-signal" : "bg-sky"}`} aria-hidden />
          <span className={`truncate ${accent}`}>{s.city}</span>
        </dt>
        <dd className="mt-1.5">
          <time className="block font-mono text-lg tabular-nums tracking-tight text-text sm:text-2xl" suppressHydrationWarning>
            {r ? r.time : "--:--:--"}
          </time>
          <span className="mt-0.5 block font-mono text-[10px] tracking-widest text-dim">
            {r ? `${r.abbr} · ${r.offset}` : `${s.fallbackAbbr} · UTC`}
          </span>
        </dd>
      </div>
    );
  };

  return (
    <dl className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-5">
      {cell(STATIONS[0], 0)}
      {/* Time difference, computed from the two live offsets */}
      <div className="flex flex-col items-center gap-1.5 pt-3">
        <dt className="sr-only">Time difference</dt>
        <dd aria-hidden className="relative block h-px w-10 bg-gradient-to-r from-signal/70 to-sky/70 sm:w-16">
          <span className="absolute -top-[3px] left-0 h-[7px] w-px bg-signal" />
          <span className="absolute -top-[3px] right-0 h-[7px] w-px bg-sky" />
        </dd>
        <dd className="text-center font-mono text-[10px] leading-relaxed tabular-nums tracking-[0.12em] text-text/80" suppressHydrationWarning>
          {gap === null ? "--:--" : `+${gapLabel}`}
          <span className="block text-[9px] uppercase tracking-[0.14em] text-dim">
            <span className="sr-only">Nepal </span>ahead
          </span>
        </dd>
      </div>
      {cell(STATIONS[1], 1)}
    </dl>
  );
}
