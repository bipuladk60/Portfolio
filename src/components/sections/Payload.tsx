import type { ReactNode } from "react";
import { CampSection } from "@/components/hud/SectionHeader";
import { projects } from "@/data/content";
import { RED, WARMER_CSS, YELLOW } from "@/components/toon/toon";
import { ToonHeader } from "./shared/ToonHeader";
import { ToonSky } from "./shared/ToonSky";
import { SKY } from "./shared/sky";
import { MissionCard } from "./payload/MissionCard";
import { OrderBookSim } from "./payload/OrderBookSim";
import { AgendaTicker } from "./payload/AgendaTicker";
import { TrieGrow } from "./payload/TrieGrow";

const VISUALS: Record<string, ReactNode> = {
  openbook: <OrderBookSim />,
  mhd: <AgendaTicker />,
  typetrie: <TrieGrow />,
};

// 12-column grid on desktop: openbook takes half (taller ladder), MHD Connect and TypeTrie a quarter each.
const LAYOUT: Record<string, { className: string; large?: boolean }> = {
  openbook: { className: "md:col-span-2 lg:col-span-6", large: true },
  mhd: { className: "lg:col-span-3" },
  typetrie: { className: "lg:col-span-3" },
};

const ORDER = ["openbook", "mhd", "typetrie"];

const PAYLOAD_CSS = `
.pb-flash { animation: pb-flash 0.7s ease-out; }
@keyframes pb-flash { from { background-color: ${YELLOW}; } to { background-color: transparent; } }
.pb-progress { width: 0; animation: pb-progress linear forwards; }
@keyframes pb-progress { to { width: 100%; } }
@media (prefers-reduced-motion: reduce) { .pb-progress { width: 50%; } }
`;

export function Payload() {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const ordered = [...ORDER.map((id) => byId.get(id)).filter((p) => p !== undefined), ...projects.filter((p) => !ORDER.includes(p.id))];

  return (
    <CampSection campId="payload" className="overflow-hidden">
      <style>{WARMER_CSS + PAYLOAD_CSS}</style>
      <ToonSky from={SKY[0]} to={SKY[1]} seed={74} clouds={4} />
      <div className="wr-world relative">
        <ToonHeader campId="payload" title="Projects" dot={RED} kicker="Three things I built, each running a tiny live version of the idea inside it." />
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
          {ordered.map((p, i) => (
            <MissionCard
              key={p.id}
              project={p}
              index={i}
              visual={VISUALS[p.id] ?? null}
              large={LAYOUT[p.id]?.large}
              className={LAYOUT[p.id]?.className ?? "lg:col-span-4"}
            />
          ))}
        </ul>
      </div>
    </CampSection>
  );
}
