"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { isUnlocked, unlock } from "@/lib/achievements";
import { chromeUI, openDevLog } from "@/lib/chrome-ui";
import { playBlip } from "@/lib/sound";
import { toast } from "@/lib/toast";
import { DevLog } from "./DevLog";
import { PrayerFlagCascade } from "./PrayerFlags";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const WORD = "namaste";

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName);
}

/** Global secrets: "namaste" prayer-flag cascade, Konami Dev Log, summit detection. */
export function EasterEggs() {
  const reduce = useReducedMotion() ?? false;
  const [cascade, setCascade] = useState<number | null>(null);

  useEffect(() => {
    let typed = "";
    let konami = 0;
    let busy = false;

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (chromeUI.get().palette) return;
      const key = e.key.toLowerCase();

      if (key === KONAMI[konami]) konami += 1;
      else if (key === "arrowup") konami = konami >= 2 ? 2 : 1;
      else konami = 0;
      if (konami === KONAMI.length) {
        konami = 0;
        unlock("konami");
        openDevLog();
      }

      if (key.length === 1) {
        typed = (typed + key).slice(-WORD.length);
        if (typed === WORD && !busy) {
          typed = "";
          busy = true;
          setCascade(Date.now());
          const first = unlock("namaste", { silent: true });
          playBlip(first ? "unlock" : "transmit");
          toast(first ? "Himalaya theme unlocked · ⌘K → theme" : "Namaste to you too", {
            title: first ? "Achievement unlocked" : "Greeting received",
            tone: "water",
            duration: 4200,
          });
          window.setTimeout(() => {
            busy = false;
            setCascade(null);
          }, 3200);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Summit: the uplink section comes into view.
  useEffect(() => {
    const el = document.getElementById("uplink");
    if (!el) return;
    if (isUnlocked("summit")) return;
    // Announce only after lingering at the summit ~4s, or on the way back down,
    // so the toast never lands while the visitor is reaching for the uplink links.
    let timer = 0;
    let arrived = false;
    const award = () => {
      window.clearTimeout(timer);
      unlock("summit", { toastDuration: 2000 });
      io.disconnect();
    };
    const io = new IntersectionObserver(
      (entries) => {
        const inside = entries.some((en) => en.isIntersecting);
        if (inside && !arrived) {
          arrived = true;
          timer = window.setTimeout(award, 4000);
        } else if (!inside && arrived) {
          award();
        }
      },
      { rootMargin: "0px 0px -45% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  return (
    <>
      {cascade !== null && <PrayerFlagCascade seed={cascade} reduce={reduce} />}
      <DevLog />
    </>
  );
}
