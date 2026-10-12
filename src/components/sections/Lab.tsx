import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { diseaseSim, musicRnn, research } from "@/data/content";
import { DiseaseSim } from "./lab/DiseaseSim";
import { LabBullets, LabEntry } from "./lab/LabEntry";
import { MusicRnn } from "./lab/MusicRnn";
import { PfasFigure, PfasMethod } from "./lab/PfasStudy";

/** Research & ML: three entries on one shared layout (text left, framed instrument right). */
export function Lab() {
  return (
    <CampSection campId="lab" className="pt-8 md:pt-10">
      <SectionHeader campId="lab" title="Research & ML" />

      <div className="space-y-20 md:space-y-28">
        <LabEntry
          n="01"
          meta={research.award}
          title={research.title}
          figure={{ label: "PFAS exposure and COPD", status: "NHANES 2007–2018", node: <PfasFigure /> }}
        >
          <p className="text-sm leading-relaxed text-dim">
            Done at {research.where}. Presented at the {research.venue}, {research.when}.
          </p>
          <blockquote className="mt-5 border-l-2 border-water pl-4 text-lg leading-snug text-text">{research.question}</blockquote>
          <PfasMethod />
        </LabEntry>

        <LabEntry
          n="02"
          meta={diseaseSim.when}
          title={diseaseSim.title}
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
