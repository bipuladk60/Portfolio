// The page is one ascent. Each section is a camp at an altitude.
// Order here is the order on the page.

export type Camp = {
  id: string;
  name: string;
  short: string;
  altitude: number;
  color: string; // CSS var, the section's prayer-flag colour
};

export const camps: Camp[] = [
  { id: "base", name: "Ground Station", short: "Base", altitude: 1400, color: "var(--signal)" },
  { id: "telemetry", name: "Telemetry", short: "About", altitude: 2000, color: "var(--signal)" },
  { id: "route", name: "Route Log", short: "Experience", altitude: 3500, color: "var(--sky)" },
  { id: "summits", name: "Summit Attempts", short: "Hackathons", altitude: 5300, color: "var(--signal)" },
  { id: "lab", name: "Atmospheric Lab", short: "Research", altitude: 6100, color: "var(--water)" },
  { id: "games", name: "Game Room", short: "Games", altitude: 6800, color: "var(--dusk-glow)" },
  { id: "payload", name: "Payload Bay", short: "Projects", altitude: 7400, color: "var(--fire)" },
  { id: "systems", name: "Systems Check", short: "Skills", altitude: 8000, color: "var(--water)" },
  { id: "uplink", name: "Contact", short: "Contact", altitude: 8849, color: "var(--air)" },
];

export const campById = (id: string) => camps.find((c) => c.id === id)!;

export const formatAltitude = (m: number) => `${m.toLocaleString("en-US")} M`;
