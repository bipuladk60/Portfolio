"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Panel } from "@/components/hud/Panel";
import { profile } from "@/data/content";
import { copyEmail } from "@/lib/clipboard";
import { EASE } from "../chautari/prng";

const AIR = "var(--air)";

const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const CHANNELS = [
  { id: "CH-01", name: "Mail", value: profile.email, href: `mailto:${profile.email}`, external: false },
  { id: "CH-02", name: "GitHub", value: strip(profile.links.github), href: profile.links.github, external: true },
  { id: "CH-03", name: "LinkedIn", value: strip(profile.links.linkedin), href: profile.links.linkedin, external: true },
];

type Status = "idle" | "sent" | "failed";

export function TransmitConsole() {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [pulse, setPulse] = useState(0);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const transmit = async () => {
    const ok = await copyEmail();
    setPulse((p) => p + 1);
    setStatus(ok ? "sent" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), ok ? 3200 : 6000);
  };

  return (
    <Panel label="Transmit console" accent={AIR} className="p-5 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12">
        {/* primary transmit */}
        <div className="min-w-0">
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.12em]">
            <dt className="text-dim/70">Origin</dt>
            <dd className="text-text">{profile.origin}</dd>
            <dt className="text-dim/70">Base</dt>
            <dd className="text-text">{profile.base}</dd>
            <dt className="text-dim/70">Status</dt>
            <dd className="normal-case tracking-normal text-text">{profile.status}</dd>
          </dl>

          <p className="hud-label mt-8">Frequency</p>
          <p className="mt-2 break-all font-mono text-lg text-air md:text-2xl">{profile.email}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="relative">
              <AnimatePresence>
                {!reduce &&
                  pulse > 0 &&
                  [0, 1, 2].map((k) => (
                    <motion.span
                      key={`${pulse}-${k}`}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 border"
                      style={{ borderColor: status === "failed" ? "var(--fire)" : AIR }}
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.9 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.1, ease: EASE, delay: k * 0.18 }}
                    />
                  ))}
              </AnimatePresence>
              <button
                type="button"
                onClick={transmit}
                className="relative inline-flex cursor-pointer items-center gap-3 border border-air bg-air px-6 py-3 font-display text-base font-bold uppercase tracking-[0.14em] text-bg transition-colors duration-300 hover:bg-transparent hover:text-air"
              >
                <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-current" />
                Transmit
                <span className="sr-only">: copy my email address</span>
              </button>
            </div>
            <p role="status" aria-live="polite" className="min-h-[1.25rem] font-mono text-[11px] uppercase tracking-[0.14em]">
              {status === "sent" && <span className="text-water">Transmitted · address copied</span>}
              {status === "failed" && <span className="text-fire">Copy blocked · use the mail channel</span>}
            </p>
          </div>
          <p className="mt-4 text-sm text-dim">
            Prefer your own client?{" "}
            <a href={`mailto:${profile.email}`} className="text-text underline decoration-line-hi underline-offset-4 hover:decoration-air">
              Open a mail draft
            </a>
            .
          </p>
        </div>

        {/* channels */}
        <div className="min-w-0">
          <p className="hud-label">Uplink channels</p>
          <ul className="mt-3 border-t border-line">
            {CHANNELS.map((c) => (
              <li key={c.id} className="border-b border-line">
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group/ch grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-4 transition-colors"
                >
                  <span className="font-mono text-[10px] tracking-[0.14em] text-dim/70">{c.id}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-semibold uppercase tracking-wide text-text transition-colors group-hover/ch:text-air">
                      {c.name}
                    </span>
                    <span className="block truncate font-mono text-xs text-dim">{c.value}</span>
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-dim transition-colors group-hover/ch:text-air">
                    <span className="hidden sm:inline">Open</span>
                    <span aria-hidden className="transition-transform duration-300 group-hover/ch:translate-x-1">
                      →
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}
