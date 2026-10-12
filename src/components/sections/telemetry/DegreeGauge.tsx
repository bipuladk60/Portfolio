"use client";

import { useSyncExternalStore } from "react";
import { degree } from "@/data/content";
import { StatGauge } from "./StatGauge";

const noop = () => () => {};

/** Share of the degree behind me, from the start of the first semester to graduation, computed on the visitor's clock. */
function percentDone() {
  const start = Date.parse(degree.start);
  const end = Date.parse(degree.graduation);
  const p = (Date.now() - start) / (end - start);
  return Math.round(Math.max(0, Math.min(1, p)) * 100);
}

export function DegreeGauge({ index }: { index: number }) {
  // 0 on the server and during hydration, the live value right after
  const value = useSyncExternalStore(noop, percentDone, () => 0);
  return (
    <StatGauge
      value={value}
      suffix="%"
      label={`Degree complete · Graduating ${degree.graduationLabel}`}
      index={index}
      accent="var(--water)"
    />
  );
}
