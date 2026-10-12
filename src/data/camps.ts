// The page is one ascent. Each section is a camp at an altitude.
// Order here is the order on the page.

export type Camp = {
  id: string;
  name: string;
  short: string;
  altitude: number;
  color: string; // CSS var, the section's prayer-flag colour
};

/** Camps that only exist after the gate is solved. */
export const CHAPTER_TWO = ["games", "payload", "systems", "uplink"];

export const camps: Camp[] = [
  { id: "base", name: "Ground Station", short: "Base", altitude: 1400, color: "var(--signal)" },
  { id: "telemetry", name: "About", short: "About", altitude: 2000, color: "var(--signal)" },
  { id: "route", name: "Experience", short: "Experience", altitude: 3500, color: "var(--sky)" },
  { id: "hackathons", name: "Hackathons", short: "Hackathons", altitude: 5300, color: "var(--signal)" },
  { id: "lab", name: "Research & ML", short: "Research", altitude: 6100, color: "var(--water)" },
  { id: "gate", name: "Checkpoint", short: "Checkpoint", altitude: 6400, color: "var(--dusk-glow)" },
  // Chapter 2 (unlocked by the gate): Warmer's world.
  { id: "games", name: "Warmer", short: "Warmer", altitude: 6800, color: "var(--dusk-glow)" },
  { id: "payload", name: "Projects", short: "Projects", altitude: 7400, color: "var(--fire)" },
  { id: "systems", name: "Skills", short: "Skills", altitude: 8000, color: "var(--water)" },
  { id: "uplink", name: "Contact", short: "Contact", altitude: 8849, color: "var(--air)" },
];

export const campById = (id: string) => camps.find((c) => c.id === id)!;

export const formatAltitude = (m: number) => `${m.toLocaleString("en-US")} M`;
