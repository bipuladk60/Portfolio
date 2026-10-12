import { campById, formatAltitude } from "@/data/camps";
import { DecodeText } from "./DecodeText";

type SectionHeaderProps = {
  campId: string;
  /** Defaults to the camp's plain name from camps.ts (About, Experience, Hackathons...). */
  title?: string;
  kicker?: string;
};

/** Standard section opener: one quiet altitude mark in the section colour, the title, an optional line of copy. */
export function SectionHeader({ campId, title, kicker }: SectionHeaderProps) {
  const camp = campById(campId);
  return (
    <header className="mb-12 md:mb-16">
      <p className="hud-label flex items-center gap-3">
        <span aria-hidden className="h-px w-8" style={{ background: camp.color }} />
        <span>{formatAltitude(camp.altitude).toLowerCase()}</span>
      </p>
      <DecodeText
        as="h2"
        text={title ?? camp.name}
        className="mt-4 block font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-text md:text-6xl"
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
