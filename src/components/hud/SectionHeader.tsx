import { campById, formatAltitude } from "@/data/camps";
import { camps } from "@/data/camps";
import { DecodeText } from "./DecodeText";

type SectionHeaderProps = {
  campId: string;
  title: string;
  kicker?: string;
};

/** Standard section opener: camp index, altitude, decoded title, optional kicker line. */
export function SectionHeader({ campId, title, kicker }: SectionHeaderProps) {
  const camp = campById(campId);
  const index = camps.findIndex((c) => c.id === campId);
  return (
    <header className="mb-12 md:mb-16">
      <div className="hud-label flex flex-wrap items-center gap-3" style={{ color: camp.color }}>
        <span className="led inline-block h-1.5 w-1.5 rounded-full" style={{ background: camp.color }} />
        <span>Camp {String(index).padStart(2, "0")}</span>
        <span className="h-px w-8 bg-line-hi" />
        <span>{camp.name}</span>
        <span className="h-px w-8 bg-line-hi" />
        <span className="text-dim">ALT {formatAltitude(camp.altitude)}</span>
      </div>
      <DecodeText
        as="h2"
        text={title}
        className="mt-4 block font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-text md:text-6xl"
      />
      {kicker && <p className="mt-4 max-w-2xl text-base text-dim md:text-lg">{kicker}</p>}
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
