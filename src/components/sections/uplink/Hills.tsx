import { GREEN, INK } from "@/components/toon/toon";

/** Rolling cartoon hills that close the day sky at the bottom of the page. */
export function Hills() {
  return (
    <svg aria-hidden viewBox="0 0 1440 160" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 block h-[90px] w-full md:h-[130px]">
      <path d="M0 92 C180 40 330 40 520 84 C700 126 860 52 1040 58 C1200 64 1320 96 1440 80 L1440 160 L0 160 Z" fill="#9be7c9" stroke={INK} strokeWidth="4" vectorEffect="non-scaling-stroke" />
      <path d="M0 128 C220 92 420 100 640 126 C860 150 1080 94 1260 104 C1350 110 1400 118 1440 116 L1440 160 L0 160 Z" fill={GREEN} stroke={INK} strokeWidth="4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
