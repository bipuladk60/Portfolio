import { profile } from "@/data/content";
import { playBlip } from "./sound";
import { toast } from "./toast";

/** Copy text with a legacy fallback. Resolves true on success. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Copy profile.email, chirp, and toast "TRANSMITTED". Shared by the palette and any section. */
export async function copyEmail(): Promise<boolean> {
  const ok = await copyText(profile.email);
  if (ok) {
    playBlip("transmit");
    toast(profile.email, { title: "Email copied · transmitted", tone: "water" });
  } else {
    playBlip("error");
    toast(profile.email, { title: "Copy blocked · address below", tone: "fire", duration: 6000 });
  }
  return ok;
}
