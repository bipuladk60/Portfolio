import type { ReactNode } from "react";
import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { projects } from "@/data/content";
import { MissionCard } from "./payload/MissionCard";
import { OrderBookSim } from "./payload/OrderBookSim";
import { AgendaTicker } from "./payload/AgendaTicker";
import { TrieGrow } from "./payload/TrieGrow";

const VISUALS: Record<string, ReactNode> = {
  openbook: <OrderBookSim />,
  mhd: <AgendaTicker />,
  typetrie: <TrieGrow />,
};

// Bento on a 6-column grid (lg): openbook full width (visual left, copy right), then MHD Connect + TypeTrie side by side.
const LAYOUT: Record<string, { className: string; large?: boolean }> = {
  openbook: { className: "md:col-span-2 lg:col-span-6", large: true },
  mhd: { className: "lg:col-span-3" },
  typetrie: { className: "lg:col-span-3" },
};

const ORDER = ["openbook", "mhd", "typetrie"];

const PAYLOAD_CSS = `
.pb-flash { animation: pb-flash 0.7s ease-out; }
@keyframes pb-flash { from { background-color: color-mix(in oklab, var(--signal) 28%, transparent); } to { background-color: transparent; } }
.pb-progress { width: 0; animation: pb-progress linear forwards; }
@keyframes pb-progress { to { width: 100%; } }
@media (prefers-reduced-motion: reduce) { .pb-progress { width: 50%; } }
`;

export function Payload() {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const ordered = [...ORDER.map((id) => byId.get(id)).filter((p) => p !== undefined), ...projects.filter((p) => !ORDER.includes(p.id))];

  return (
    <CampSection campId="payload">
      <style>{PAYLOAD_CSS}</style>
      <SectionHeader
        campId="payload"
        title="Payload Bay"
        kicker="What I carried up the mountain. Each module runs a small live readout of the idea inside it."
      />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-6">
        {ordered.map((p, i) => (
          <MissionCard
            key={p.id}
            project={p}
            index={i}
            visual={VISUALS[p.id] ?? null}
            large={LAYOUT[p.id]?.large}
            className={LAYOUT[p.id]?.className ?? "lg:col-span-2"}
          />
        ))}
      </ul>
    </CampSection>
  );
}
