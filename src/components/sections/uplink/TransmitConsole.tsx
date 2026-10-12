"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { profile } from "@/data/content";
import { copyEmail } from "@/lib/clipboard";
import { GREEN, INK, RED, YELLOW } from "@/components/toon/toon";
import { useReducedMotionSafe } from "../summits/motion";

const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const CHANNELS = [
  { name: "GitHub", value: strip(profile.links.github), href: profile.links.github, color: "#a8d8ff" },
  { name: "LinkedIn", value: strip(profile.links.linkedin), href: profile.links.linkedin, color: GREEN },
];

const [EMAIL_LOCAL, EMAIL_DOMAIN] = profile.email.split("@");

type Status = "idle" | "sent" | "failed";

/** The toon contact card: the email big and copyable, plus mail / GitHub / LinkedIn pills. */
export function TransmitConsole() {
  const reduce = useReducedMotionSafe();
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
    <article data-cursor-box="" className="wr-sticker p-5 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {[profile.origin, profile.base].map((place, i) => (
              <span
                key={place}
                className="rounded-full border-2 px-3 py-0.5 text-xs font-extrabold"
                style={{ borderColor: INK, background: i === 0 ? YELLOW : "#ffffff" }}
              >
                {i === 0 ? "From" : "Based in"} {place}
              </span>
            ))}
          </div>
          <p className="mt-3 text-base font-bold leading-snug">{profile.status}</p>

          <p className="wr-display mt-6 break-words text-[clamp(1.35rem,5.6vw,2.5rem)] font-bold leading-tight" style={{ color: INK }}>
            {EMAIL_LOCAL}
            <wbr />@{EMAIL_DOMAIN}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="relative">
              <AnimatePresence>
                {!reduce &&
                  pulse > 0 &&
                  [0, 1].map((k) => (
                    <motion.span
                      key={`${pulse}-${k}`}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl border-[3px]"
                      style={{ borderColor: status === "failed" ? RED : INK }}
                      initial={{ opacity: 0.8, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.45 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: k * 0.15 }}
                    />
                  ))}
              </AnimatePresence>
              <button
                type="button"
                onClick={transmit}
                className="wr-pill wr-press wr-display relative inline-flex min-h-14 cursor-pointer items-center gap-3 !rounded-2xl px-6 py-3 text-xl font-bold"
                style={{ background: status === "sent" ? GREEN : YELLOW, borderWidth: 3, boxShadow: `5px 5px 0 ${INK}` }}
              >
                {status === "sent" ? "Copied!" : "Copy email"}
              </button>
            </div>
            <a
              href={`mailto:${profile.email}`}
              className="wr-pill wr-press inline-flex min-h-11 items-center gap-2 bg-white px-4 py-2 text-sm font-extrabold"
            >
              Open a mail draft <span aria-hidden>✉</span>
            </a>
          </div>
          <p role="status" aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm font-extrabold">
            {status === "sent" && <span>The email is on your clipboard.</span>}
            {status === "failed" && <span style={{ color: RED }}>Copy was blocked. Use the mail draft instead.</span>}
          </p>
        </div>

        <div className="min-w-0">
          <p className="wr-display text-xl font-bold">Elsewhere</p>
          <ul className="mt-3 flex flex-col gap-3">
            {CHANNELS.map((c) => (
              <li key={c.name}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="wr-pill wr-press group flex min-h-14 items-center gap-3 !rounded-2xl px-4 py-2.5"
                  style={{ background: c.color }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="wr-display block text-lg font-bold leading-tight">{c.name}</span>
                    <span className="block truncate text-xs font-bold opacity-75">{c.value}</span>
                  </span>
                  <span aria-hidden className="wr-display text-xl transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
