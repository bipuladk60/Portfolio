import { SKY_BOTTOM } from "@/components/toon/toon";

// One continuous day across chapter 2: each section's gradient starts where the previous one ended.
// Games (Warmer) ends on SKY_BOTTOM; the contact section warms toward the horizon.
export const SKY = [SKY_BOTTOM, "#d9f0ff", "#cbe9ff", "#fff1d2"] as const;
