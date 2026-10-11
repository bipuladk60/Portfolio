import { CampSection, SectionHeader } from "@/components/hud/SectionHeader";
import { experience } from "@/data/content";
import { RouteTrack } from "./route/RouteTrack";

/** Faint topographic contours behind the route. Static, decorative, server-rendered. */
function Contours() {
  const rings = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
      viewBox="0 0 1000 1400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <g stroke="var(--line)" strokeWidth={1}>
        {rings.map((i) => {
          const s = 1 + i * 0.32;
          return (
            <path
              key={`a${i}`}
              transform={`translate(780 380) scale(${s}) translate(-780 -380)`}
              vectorEffect="non-scaling-stroke"
              d="M780 300c60 4 110 38 104 92s-62 70-118 66-96-30-92-78 46-84 106-80z"
            />
          );
        })}
        {rings.slice(0, 7).map((i) => {
          const s = 1 + i * 0.38;
          return (
            <path
              key={`b${i}`}
              transform={`translate(200 1050) scale(${s}) translate(-200 -1050)`}
              vectorEffect="non-scaling-stroke"
              d="M200 980c70-6 118 30 112 80s-70 64-120 58-84-36-78-78 22-56 86-60z"
            />
          );
        })}
      </g>
    </svg>
  );
}

/** Camp 02, Route Log: experience as a climbing route that draws itself on scroll. */
export function RouteLog() {
  return (
    <CampSection campId="route" className="overflow-hidden">
      <Contours />
      <div className="relative">
        <SectionHeader
          campId="route"
          title="Route Log"
          kicker="Each role is a camp on the way up. Open a log for the full record."
        />
        <RouteTrack entries={experience} />
        <p className="hud-label mt-10 flex items-center gap-3 md:justify-center">
          <span aria-hidden className="h-px w-10 bg-line-hi" />
          Route continues
          <span aria-hidden className="h-px w-10 bg-line-hi" />
        </p>
      </div>
    </CampSection>
  );
}
