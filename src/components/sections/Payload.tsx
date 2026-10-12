import type { ReactNode } from "react";
import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { projects } from "@/data/content";
import { MissionCard } from "./payload/MissionCard";
import { OrderBookSim } from "./payload/OrderBookSim";
import { FilmStrip } from "./payload/FilmStrip";
import { RadarSweep } from "./payload/RadarSweep";
import { PhoneSync } from "./payload/PhoneSync";

const VISUALS: Record<string, ReactNode> = {
  openbook: <OrderBookSim />,
  clipfinder: <FilmStrip />,
  jobradar: <RadarSweep />,
  partysync: <PhoneSync />,
};

// Bento on a 6-column grid (lg): two zig-zag rows, each a large side-by-side card (4 cols) plus a medium card (2 cols).
const LAYOUT: Record<string, { className: string; large?: boolean }> = {
  openbook: { className: "md:col-span-2 lg:col-span-4", large: true },
  jobradar: { className: "lg:col-span-2" },
  partysync: { className: "lg:col-span-2" },
  clipfinder: { className: "md:col-span-2 lg:col-span-4", large: true },
};

// Rows on lg: openbook + jobradar | PartySync + clipfinder.
const ORDER = ["openbook", "jobradar", "partysync", "clipfinder"];

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
@media (prefers-reduced-motion: reduce) { .pb-blip { opacity: 0.7; } }
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
