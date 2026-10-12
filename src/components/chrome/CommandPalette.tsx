"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { camps } from "@/data/camps";
import { indieGame, profile } from "@/data/content";
import { copyEmail } from "@/lib/clipboard";
import { ACHIEVEMENTS, unlock, useAchievements } from "@/lib/achievements";
import { closePalette, openDevLog, togglePalette, useChromeUI } from "@/lib/chrome-ui";
import { strictLabelMatch, tokenPrefixMatch } from "@/lib/fuzzy";
import { EASE_HUD } from "@/lib/motion";
import { scrollToCamp } from "@/lib/scroll";
import { playBlip, toggleSound, useSoundEnabled } from "@/lib/sound";
import { setTheme, useTheme } from "@/lib/theme";
import { toast } from "@/lib/toast";

type Command = {
  id: string;
  group: "Navigate" | "Transmit" | "Links" | "System";
  label: string;
  hint?: string;
  keywords?: string;
  disabled?: boolean;
  run: () => void;
};

const CAMP_KEYWORDS: Record<string, string> = {
  base: "home hero top start",
  telemetry: "about bio education",
  route: "experience work jobs career",
  summits: "hackathons hackathon awards wins",
  lab: "research ml machine learning pfas copd",
  chautari: "games ludo warmer",
  payload: "projects work openbook",
  systems: "skills stack honors",
  uplink: "contact email reach",
};

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Cmd/Ctrl+K mission console. ARIA combobox (input) controlling a listbox, fuzzy filtered,
 * arrow keys + Enter, Esc closes, focus held inside and restored to where it came from.
 */
export function CommandPalette() {
  const { palette: open } = useChromeUI();
  const reduce = useReducedMotion();
  const sound = useSoundEnabled();
  const theme = useTheme();
  const unlocked = useAchievements();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;

  // Global shortcut
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Open / close side effects: focus capture + restore, achievement, sound
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery("");
    setActive(0);
    playBlip("open");
    unlock("palette");
    const id = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    const back = returnFocus;
    return () => {
      cancelAnimationFrame(id);
      back.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const kathmanduUnlocked = unlocked.includes("namaste");
    const list: Command[] = camps.map((c, i) => ({
      id: `goto-${c.id}`,
      group: "Navigate",
      label: `goto ${c.name.toLowerCase()}`,
      hint: `CAMP ${String(i).padStart(2, "0")} · ${c.altitude.toLocaleString("en-US")} M`,
      keywords: `${c.short} ${c.id} ${CAMP_KEYWORDS[c.id] ?? ""} camp section`,
      run: () => scrollToCamp(c.id),
    }));
    list.push(
      {
        id: "copy-email",
        group: "Transmit",
        label: "copy email",
        hint: profile.email,
        keywords: "contact mail address",
        run: () => void copyEmail(),
      },
      {
        id: "github",
        group: "Links",
        label: "open github",
        hint: profile.handle,
        keywords: "code repos source",
        run: () => openExternal(profile.links.github),
      },
      {
        id: "linkedin",
        group: "Links",
        label: "open linkedin",
        hint: "profile",
        keywords: "resume work",
        run: () => openExternal(profile.links.linkedin),
      },
      {
        id: "warmer",
        group: "Links",
        label: "play warmer",
        hint: "warmergames.com",
        keywords: "game geography daily globe",
        run: () => openExternal(profile.links.warmer),
      },
      {
        id: "ludo",
        group: "Links",
        label: "open chautari ludo repo",
        hint: "github",
        keywords: "game indie canvas",
        run: () => openExternal(indieGame.repo),
      },
      {
        id: "sound",
        group: "System",
        label: sound ? "sound off" : "sound on",
        hint: sound ? "currently on" : "currently off",
        keywords: "audio mute volume blips",
        run: () => {
          toggleSound();
          toast(sound ? "Interface sound off" : "Interface sound on", { title: "System", tone: "sky" });
        },
      },
      {
        id: "theme-amber",
        group: "System",
        label: "theme: amber",
        hint: theme === "amber" ? "ACTIVE" : "default",
        keywords: "colour color default",
        run: () => {
          setTheme("amber");
          toast("Amber", { title: "Theme", tone: "signal" });
        },
      },
      {
        id: "theme-kathmandu",
        group: "System",
        label: "theme: kathmandu",
        hint: kathmanduUnlocked ? (theme === "kathmandu" ? "ACTIVE" : "unlocked") : "LOCKED · greet the mountain",
        keywords: "colour color nepal secret",
        disabled: !kathmanduUnlocked,
        run: () => {
          if (setTheme("kathmandu")) toast("Kathmandu", { title: "Theme", tone: "signal" });
        },
      },
      {
        id: "achievements",
        group: "System",
        label: "achievements",
        hint: `${unlocked.length}/${ACHIEVEMENTS.length} unlocked`,
        keywords: "secrets easter eggs dev log",
        run: () => openDevLog(),
      },
    );
    return list;
  }, [sound, theme, unlocked]);

  const results = useMemo(() => {
    const scored = commands
      .map((cmd, order) => {
        const m = strictLabelMatch(query, cmd.label);
        const k = m ? null : tokenPrefixMatch(query, `${cmd.label} ${cmd.keywords ?? ""}`);
        if (!m && k === null) return null;
        return { cmd, order, score: m ? m.score + 4 : k!, indices: m ? m.indices : [] };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    if (query.trim()) scored.sort((a, b) => b.score - a.score || a.order - b.order);
    return scored;
  }, [commands, query]);

  const safeActive = Math.min(active, Math.max(0, results.length - 1));

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${safeActive}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [safeActive, results]);

  const execute = useCallback(
    (cmd: Command) => {
      if (cmd.disabled) {
        playBlip("error");
        toast("Locked. Some greetings open doors.", { title: "Access denied", tone: "fire" });
        return;
      }
      playBlip("click");
      // System toggles keep the palette open so their new state is visible.
      const keepOpen = cmd.id === "sound";
      if (!keepOpen) closePalette();
      // Run after the focus restore so scroll targets are not fought by focus().
      requestAnimationFrame(() => cmd.run());
    },
    [],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = results.length;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (n) setActive((safeActive + 1) % n);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (n) setActive((safeActive - 1 + n) % n);
        break;
      case "Home":
        if (n && e.ctrlKey) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (n && e.ctrlKey) {
          e.preventDefault();
          setActive(n - 1);
        }
        break;
      case "Enter":
        e.preventDefault();
        if (results[safeActive]) execute(results[safeActive].cmd);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        playBlip("close");
        closePalette();
        break;
      case "Tab":
        // Focus trap: the input is the only tab stop inside the dialog.
        e.preventDefault();
        inputRef.current?.focus();
        break;
    }
  };

  const activeId = results[safeActive] ? `${baseId}-opt-${results[safeActive].cmd.id}` : undefined;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette"
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_HUD }}
          onKeyDown={onKeyDown}
        >
          <div aria-hidden className="absolute inset-0 bg-bg/75" onClick={closePalette} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-[620px] border border-line bg-panel shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
            style={{ ["--accent" as string]: "var(--signal)" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(48% 0% 48% 0%)", y: -6 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(48% 0% 48% 0%)" }}
            transition={{ duration: 0.34, ease: EASE_HUD }}
          >
            <PaletteCorners />
            <div className="hud-label flex items-center justify-between border-b border-line px-4 py-2 !text-[10px]">
              <span className="text-signal">Mission console</span>
              <span>{results.length} cmds</span>
            </div>
            <div className="flex items-center gap-3 border-b border-line px-4 transition-colors focus-within:border-b-signal focus-within:bg-panel-2/60">
              <span aria-hidden className="font-mono text-signal">
                &gt;
              </span>
              <input
                ref={inputRef}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                aria-label="Type a command"
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="type a command or camp"
                className="h-12 w-full bg-transparent font-mono text-[14px] text-text placeholder:text-dim/70 focus:outline-none focus-visible:outline-none"
              />
              <kbd className="hud-label shrink-0 border border-line px-1.5 py-0.5 !text-[10px]">ESC</kbd>
            </div>

            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label="Commands"
              className="max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain py-1.5"
            >
              {results.length === 0 && (
                <li role="presentation" className="px-4 py-6 text-center font-mono text-[12px] text-dim">
                  NO SIGNAL · no command matches &quot;{query}&quot;
                </li>
              )}
              {results.map(({ cmd, indices }, i) => {
                const isActive = i === safeActive;
                const showGroup = !query.trim() && (i === 0 || results[i - 1].cmd.group !== cmd.group);
                return (
                  <li key={cmd.id} role="presentation">
                    {showGroup && (
                      <div role="presentation" className="hud-label px-4 pb-1 pt-3 !text-[9px] text-dim/70">
                        {cmd.group}
                      </div>
                    )}
                    <div
                      id={`${baseId}-opt-${cmd.id}`}
                      role="option"
                      aria-selected={isActive}
                      aria-disabled={cmd.disabled || undefined}
                      data-index={i}
                      onMouseMove={() => !isActive && setActive(i)}
                      onClick={() => execute(cmd)}
                      className={`relative mx-1.5 flex cursor-pointer items-center justify-between gap-4 px-3 py-2 font-mono text-[13px] transition-colors duration-150 ${
                        isActive ? "bg-panel-2 text-text" : "text-dim"
                      } ${cmd.disabled ? "opacity-55" : ""}`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId={reduce ? undefined : "palette-active"}
                          aria-hidden
                          className="absolute inset-y-1 left-0 w-[2px] bg-signal"
                          transition={{ duration: 0.18, ease: EASE_HUD }}
                        />
                      )}
                      <span className="truncate">
                        <Highlight text={cmd.label} indices={indices} />
                      </span>
                      {cmd.hint && (
                        <span
                          className={`shrink-0 text-[10px] uppercase tracking-[0.12em] ${
                            cmd.hint === "ACTIVE" ? "text-water" : cmd.disabled ? "text-fire/80" : "text-dim/80"
                          }`}
                        >
                          {cmd.hint}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="hud-label flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2 !text-[9px]">
              <span>↑↓ navigate</span>
              <span>↵ execute</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Highlight({ text, indices }: { text: string; indices: number[] }) {
  if (!indices.length) return <>{text}</>;
  const set = new Set(indices);
  return (
    <>
      {Array.from(text).map((ch, i) =>
        set.has(i) ? (
          <span key={i} className="text-signal">
            {ch}
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </>
  );
}

function PaletteCorners() {
  const c = "pointer-events-none absolute h-2.5 w-2.5 border-signal";
  return (
    <span aria-hidden>
      <span className={`${c} -left-px -top-px border-l-2 border-t-2`} />
      <span className={`${c} -right-px -top-px border-r-2 border-t-2`} />
      <span className={`${c} -bottom-px -left-px border-b-2 border-l-2`} />
      <span className={`${c} -bottom-px -right-px border-b-2 border-r-2`} />
    </span>
  );
}
