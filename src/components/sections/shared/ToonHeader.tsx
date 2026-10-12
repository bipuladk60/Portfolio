import { campById, CHAPTER_TWO } from "@/data/camps";
import { INK, ORANGE, YELLOW } from "@/components/toon/toon";

/** The Warmer title; the chapter transition focuses it when the overlay is gone. */
export const GAMES_HEADING_ID = "games-title";

type ToonHeaderProps = {
  campId: string;
  title: string;
  kicker?: string;
  /** colour of the little dot in the chapter pill */
  dot?: string;
  /** id for the title, which then takes programmatic focus (tabIndex -1), e.g. after the chapter transition */
  headingId?: string;
};

/** Chapter-2 section opener: a sticker pill ("Chapter 2 · 03 · Projects") over a chunky Fredoka title. */
export function ToonHeader({ campId, title, kicker, dot = ORANGE, headingId }: ToonHeaderProps) {
  const camp = campById(campId);
  const n = Math.max(0, CHAPTER_TWO.indexOf(campId)) + 1;
  return (
    <header className="mb-8 md:mb-10">
      <p
        className="wr-pill inline-flex items-center gap-2 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider"
        style={{ color: INK }}
      >
        <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ background: dot, borderColor: INK }} />
        Chapter 2 · {String(n).padStart(2, "0")} · {camp.short}
      </p>
      <h2
        id={headingId}
        tabIndex={headingId ? -1 : undefined}
        className="wr-display mt-4 text-5xl font-bold leading-[0.95] md:text-6xl"
        // a programmatic focus target only (not in the tab order), so no ring; inline beats the global :focus-visible
        style={{ color: INK, outline: headingId ? "none" : undefined }}
      >
        {title}
        <span aria-hidden style={{ color: dot === YELLOW ? ORANGE : dot }}>
          .
        </span>
      </h2>
      {kicker && <p className="mt-3 max-w-2xl text-lg font-semibold leading-snug md:text-xl" style={{ color: INK, opacity: 0.8 }}>{kicker}</p>}
    </header>
  );
}
