import type { ReactNode } from "react";
import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { projects } from "@/data/content";
import { MissionCard } from "./payload/MissionCard";
import { OrderBookSim } from "./payload/OrderBookSim";
import { FilmStrip } from "./payload/FilmStrip";
import { RadarSweep } from "./payload/RadarSweep";
import { PhoneSync } from "./payload/PhoneSync";
import { TrieGrow } from "./payload/TrieGrow";
import { AgendaTicker } from "./payload/AgendaTicker";

const VISUALS: Record<string, ReactNode> = {
  openbook: <OrderBookSim />,
  clipfinder: <FilmStrip />,
  mhd: <AgendaTicker />,
  jobradar: <RadarSweep />,
  partysync: <PhoneSync />,
  typetrie: <TrieGrow />,
};

// Bento placement on a 6-column grid (lg). Big cards zig-zag: openbook top-left, clipfinder lower-right.
const LAYOUT: Record<string, { className: string; large?: boolean }> = {
  openbook: { className: "md:col-span-2 lg:col-span-4 lg:row-span-2", large: true },
  mhd: { className: "lg:col-span-2" },
  jobradar: { className: "lg:col-span-2" },
  clipfinder: { className: "md:col-span-2 lg:col-span-4 lg:col-start-3 lg:row-span-2 lg:row-start-3", large: true },
  partysync: { className: "lg:col-span-2 lg:col-start-1 lg:row-start-3" },
  typetrie: { className: "lg:col-span-2 lg:col-start-1 lg:row-start-4" },
};

// Reading order follows the visual zig-zag.
const ORDER = ["openbook", "mhd", "jobradar", "clipfinder", "partysync", "typetrie"];

const PAYLOAD_CSS = `
.pb-flash { animation: pb-flash 0.7s ease-out; }
@keyframes pb-flash { from { background-color: color-mix(in oklab, var(--signal) 28%, transparent); } to { background-color: transparent; } }
.pb-sprockets { background-image: radial-gradient(circle, #2e4052 1.2px, transparent 1.6px); background-size: 9px 4px; background-repeat: repeat-x; }
.pb-scan { animation: pb-scan 0.48s linear infinite; }
@keyframes pb-scan { from { top: 0; } to { top: 100%; } }
.pb-sweep { transform-box: view-box; transform-origin: 60px 60px; animation: pb-spin 4.2s linear infinite; animation-play-state: var(--play, running); }
@keyframes pb-spin { to { transform: rotate(360deg); } }
.pb-blip { opacity: 0.12; transform-box: fill-box; transform-origin: center; animation: pb-blip 4.2s linear infinite; animation-play-state: var(--play, running); }
@keyframes pb-blip { 0% { opacity: 1; transform: scale(1.8); } 30% { opacity: 0.4; transform: scale(1); } 100% { opacity: 0.12; transform: scale(1); } }
.pb-progress { width: 0; animation: pb-progress linear forwards; }
@keyframes pb-progress { to { width: 100%; } }
@media (prefers-reduced-motion: reduce) { .pb-blip { opacity: 0.7; } .pb-progress { width: 50%; } }
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
      <ul className="grid grid-flow-row-dense grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-6">
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
