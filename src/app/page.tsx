import { Chrome } from "@/components/chrome/Chrome";
import { Hero } from "@/components/sections/Hero";
import { Telemetry } from "@/components/sections/Telemetry";
import { RouteLog } from "@/components/sections/RouteLog";
import { Summits } from "@/components/sections/Summits";
import { Lab } from "@/components/sections/Lab";
import { Gate } from "@/components/sections/Gate";
import { Games } from "@/components/sections/Games";
import { Payload } from "@/components/sections/Payload";
import { Systems } from "@/components/sections/Systems";
import { Uplink } from "@/components/sections/Uplink";

export default function Home() {
  return (
    <>
      <Chrome />
      <main id="main" className="relative z-10">
        <Hero />
        <Telemetry />
        <RouteLog />
        <Summits />
        <Lab />
        <Gate />
        {/* Chapter 2: hidden until the gate is solved (see src/lib/chapter.ts and globals.css). */}
        <div data-chapter2-root>
          <Games />
          <Payload />
          <Systems />
          <Uplink />
        </div>
      </main>
    </>
  );
}
