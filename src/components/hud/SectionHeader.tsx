import { campById, camps, formatAltitude } from "@/data/camps";
import { DecodeText } from "./DecodeText";

type SectionHeaderProps = {
  campId: string;
  /** Defaults to the camp's plain name from camps.ts (About, Experience, Hackathons...). */
  title?: string;
  kicker?: string;
};

/**
 * Standard chapter-1 section opener. A quiet strip runs across the top: the camp number, the altitude
 * and the climb from the previous camp. Then the title and an optional line of copy.
 */
export function SectionHeader({ campId, title, kicker }: SectionHeaderProps) {
  const camp = campById(campId);
  const i = camps.findIndex((c) => c.id === camp.id);
  const climb = i > 0 ? camp.altitude - camps[i - 1].altitude : 0;
  return (
    <header className="mb-12 md:mb-16">
      <div className="hud-label flex items-center gap-3">
        <span style={{ color: camp.color }}>{String(i).padStart(2, "0")}</span>
        <span aria-hidden className="h-px w-6" style={{ background: camp.color }} />
        <span>{formatAltitude(camp.altitude).toLowerCase()}</span>
        {climb > 0 && (
          <span className="ml-3 shrink-0">
            <span aria-hidden style={{ color: camp.color }}>▲ </span>+{climb.toLocaleString("en-US")} m
          </span>
        )}
      </div>
      <DecodeText
        as="h2"
        text={title ?? camp.name}
        className="mt-5 block font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight text-text md:text-7xl"
      />
      {kicker && <p className="mt-5 max-w-2xl text-base leading-relaxed text-dim md:text-lg">{kicker}</p>}
    </header>
  );
}

/** Section wrapper so every camp has the same id, spacing and data attributes the altimeter reads. */
export function CampSection({
  campId,
  children,
  className = "",
}: {
  campId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const camp = campById(campId);
  return (
    <section
      id={campId}
      data-camp={campId}
      data-altitude={camp.altitude}
      className={`relative scroll-mt-16 px-5 py-16 md:px-12 md:py-20 lg:px-20 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
