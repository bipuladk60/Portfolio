"use client";

import { useStore } from "@/lib/store";
import { NEPAL } from "@/data/countryList";
import { GREEN, INK } from "@/components/toon/toon";
import { gateGuesses } from "../gate/gateStore";
import { WarmerGlobe } from "./WarmerGlobe";

const FOUND = [{ lat: NEPAL.lat, lon: NEPAL.lon, t: 0 }];
const POINT = { lat: NEPAL.lat, lon: NEPAL.lon };

/** Chapter 2 opener: the visitor's checkpoint result on the cartoon globe, and the way to the real game. */
export function FoundSticker({ href }: { href: string }) {
  const n = useStore(gateGuesses);
  return (
    <div data-cursor-box="" className="wr-sticker wr-wobble p-5 md:p-6" style={{ background: `color-mix(in oklab, ${GREEN} 14%, #ffffff)` }}>
      <p className="wr-pill inline-flex items-center gap-2 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
        <span className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ background: GREEN, borderColor: INK }} />
        Checkpoint cleared
      </p>
      <div className="mt-3">
        <WarmerGlobe guesses={FOUND} reveal={POINT} focus={POINT} />
      </div>
      <p className="wr-display mt-3 text-2xl font-bold leading-tight md:text-3xl">
        {n ? `You found Nepal in ${n} ${n === 1 ? "guess" : "guesses"}.` : "You found Nepal."}
      </p>
      <p className="mt-1.5 text-[15px] font-semibold leading-snug opacity-85">
        It&apos;s home: I grew up there. The real game hides a new country every day.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="wr-pill wr-press wr-display mt-4 inline-flex min-h-12 items-center gap-3 !rounded-2xl px-5 py-2.5 text-base font-bold md:text-lg"
        style={{ background: GREEN, borderWidth: 3, boxShadow: `5px 5px 0 ${INK}` }}
      >
        Play today&apos;s round
        <span aria-hidden>→</span>
      </a>
    </div>
  );
}
