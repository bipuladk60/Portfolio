import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { diseaseSim, musicRnn, research } from "@/data/content";
import { DiseaseSim } from "./lab/DiseaseSim";
import { LabBullets, LabEntry } from "./lab/LabEntry";
import { MusicRnn } from "./lab/MusicRnn";
import { PfasFigure, PfasMethod } from "./lab/PfasStudy";
import { RUN_DAYS } from "./lab/diseaseModel";

// Key-fact rows: every value is read from content.ts (or the model constants built from it).
const best = research.models.reduce((a, m) => (m.accuracy > a.accuracy ? m : a));
const PFAS_FACTS = [
  { label: "Data", value: "NHANES" },
  { label: "Models", value: String(research.models.length) },
  { label: "Best acc.", value: `${best.accuracy.toFixed(1)}%` },
];
const SIM_FACTS = [
  { label: "Agents", value: String(diseaseSim.params.population) },
  { label: "Seeded sick", value: String(diseaseSim.params.initialInfected) },
  { label: "Run", value: `${RUN_DAYS} days` },
];
const header = (key: string) => musicRnn.sample.header.match(new RegExp(`^${key}:(.+)$`, "m"))?.[1].trim() ?? "";
const RNN_FACTS = [
  { label: "Key", value: header("K") },
  { label: "Meter", value: header("M") },
  { label: "Notes", value: String(musicRnn.sample.body.match(/[A-Ga-g]/g)?.length ?? 0) },
];

/** Research & ML: three entries on one shared layout (text left, framed instrument right). */
export function Lab() {
  return (
    <CampSection campId="lab" className="md:pt-28! md:pb-12!">
      {/* a cool water-green glow behind the heading, the section colour */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, #000 18%, #000 70%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 18%, #000 70%, transparent)",
          background: "radial-gradient(ellipse 45% 45% at 20% 14%, color-mix(in oklab, var(--water) 7%, transparent), transparent 70%)",
        }}
      />
      <SectionHeader campId="lab" title="Research & ML" />

      <div className="space-y-20 md:space-y-28">
        <LabEntry
          n="01"
          meta={research.when}
          title={research.title}
          award={research.award}
          facts={PFAS_FACTS}
          figure={{ label: "PFAS exposure and COPD", status: "NHANES 2007–2018", node: <PfasFigure /> }}
        >
          <p className="text-sm leading-relaxed text-dim">
            Done at {research.where}. Presented at the {research.venue}.
          </p>
          <blockquote className="mt-5 border-l-2 border-water pl-4 text-lg leading-snug text-text">{research.question}</blockquote>
          <PfasMethod />
        </LabEntry>

        <LabEntry
          n="02"
          meta={diseaseSim.when}
          title={diseaseSim.title}
          facts={SIM_FACTS}
          stack={diseaseSim.stack}
          link={{ label: "Notebook on GitHub", href: diseaseSim.href }}
          figure={{ label: "Agent-based outbreak", status: "Live", node: <DiseaseSim /> }}
        >
          <p>{diseaseSim.pitch}</p>
          <LabBullets items={diseaseSim.bullets} />
        </LabEntry>

        <LabEntry
          n="03"
          meta={musicRnn.when}
          title={musicRnn.title}
          facts={RNN_FACTS}
          stack={musicRnn.stack}
          link={{ label: "Repo on GitHub", href: musicRnn.href }}
          figure={{ label: "Character-level LSTM", status: "Replaying a real sample", node: <MusicRnn /> }}
        >
          <p>{musicRnn.pitch}</p>
          <LabBullets items={musicRnn.bullets} />
        </LabEntry>
      </div>
    </CampSection>
  );
}
