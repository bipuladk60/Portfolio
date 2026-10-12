import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { diseaseSim } from "@/data/content";
import { DiseaseSim } from "./lab/DiseaseSim";
import { OtherMl } from "./lab/OtherMl";
import { PfasStudy } from "./lab/PfasStudy";

export function Lab() {
  return (
    <CampSection campId="lab" className="pt-8 md:pt-10">
      <SectionHeader campId="lab" title="Research & ML" />

      <PfasStudy />

      <div className="mt-20 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <p className="font-mono text-xs text-dim">{diseaseSim.when}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-text">{diseaseSim.title}</h3>
          <p className="mt-3 text-base leading-relaxed text-text">{diseaseSim.pitch}</p>
          <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-dim">
            {diseaseSim.bullets.map((b) => (
              <li key={b} className="grid grid-cols-[0.75rem_1fr] gap-2">
                <span aria-hidden className="mt-[0.6rem] h-px w-2 bg-fire" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 font-mono text-xs text-dim">{diseaseSim.stack.join(" · ")}</p>
          <a
            href={diseaseSim.href}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block font-mono text-xs text-sky underline-offset-4 hover:underline"
          >
            Notebook on GitHub ↗
          </a>
        </div>
        <div className="lg:col-span-8">
          <DiseaseSim />
        </div>
      </div>

      <div className="mt-20">
        <OtherMl />
      </div>
    </CampSection>
  );
}
