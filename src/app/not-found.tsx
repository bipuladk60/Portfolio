import type { Metadata } from "next";
import Link from "next/link";
import { Glow } from "@/components/hud/Surface";
import { Ridgeline } from "@/components/hud/Ridgeline";

export const metadata: Metadata = {
  title: "Off the map · Bipul Adhikari",
};

/** 404 in the chapter-1 HUD style. next/link prefixes the GitHub Pages basePath, so "/" is always home. */
export default function NotFound() {
  return (
    <main id="main" className="hud-grid relative flex min-h-svh flex-col overflow-hidden">
      <Ridgeline className="inset-x-0 bottom-0 h-[clamp(140px,28vh,280px)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-40 pt-24 sm:px-8">
        <div className="relative max-w-xl">
          <Glow color="var(--signal)" strength={13} className="-left-40 -top-24 h-[30rem] w-[44rem] max-w-none" />
          <p className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-signal">
            <span aria-hidden className="h-px w-10 bg-signal" />
            404 · Signal lost
          </p>
          <h1 className="font-display text-[clamp(3rem,12vw,6.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.02em] text-text">
            Off the map.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text/85 md:text-xl">
            This page isn&apos;t on the route. The climb starts back at base.
          </p>
          <Link
            href="/"
            className="group mt-9 inline-flex items-center gap-3 bg-signal px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.14em] text-bg transition-colors hover:bg-[#ffc93d]"
          >
            Back to base
            <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
