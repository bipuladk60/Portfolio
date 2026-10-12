"use client";

import { useEffect, useState } from "react";

type Station = { code: string; city: string; zone: string; fallbackAbbr: string };

const STATIONS: Station[] = [
  { code: "NP", city: "Nepal", zone: "Asia/Kathmandu", fallbackAbbr: "NPT" },
  { code: "MS", city: "Hattiesburg", zone: "America/Chicago", fallbackAbbr: "CT" },
];

type Reading = { time: string; abbr: string; offset: string };

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
  return { time, abbr, offset: offset === "UTC" ? "UTC+0" : offset };
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

  return (
    <dl data-cursor-box="" className="grid grid-cols-2 divide-x divide-line border border-line bg-panel/70">
      {STATIONS.map((s, i) => {
        const r = now ? read(now, s) : null;
        const accent = i === 0 ? "text-signal" : "text-sky";
        return (
          <div key={s.code} className="min-w-0 px-3 py-3 sm:px-4">
            <dt className="hud-label flex items-center gap-2">
              <span className={`led inline-block h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-signal" : "bg-sky"}`} aria-hidden />
              <span className={accent}>{s.code}</span>
              <span className="truncate">{s.city}</span>
            </dt>
            <dd className="mt-1.5">
              <time
                className="block font-mono text-xl tabular-nums tracking-tight text-text sm:text-2xl"
                suppressHydrationWarning
              >
                {r ? r.time : "--:--:--"}
              </time>
              <span className="mt-0.5 block font-mono text-[10px] tracking-widest text-dim">
                {r ? `${r.abbr} · ${r.offset}` : `${s.fallbackAbbr} · UTC`}
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
