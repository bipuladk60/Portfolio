"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>[]=+";

type DecodeTextProps = {
  text: string;
  className?: string;
  duration?: number; // ms
  delay?: number; // ms
  as?: "span" | "h1" | "h2" | "h3" | "p";
};

/**
 * Text that "decodes" from scrambled glyphs into its final string when scrolled into view.
 * The real string is always in the DOM for screen readers and no-JS; the scramble is a visual layer.
 */
export function DecodeText({ text, className = "", duration = 700, delay = 0, as = "span" }: DecodeTextProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(text);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    let start = 0;
    const timer = window.setTimeout(() => {
      setRunning(true);
      const tick = (t: number) => {
        if (!start) start = t;
        const p = Math.min(1, (t - start) / duration);
        const settled = Math.floor(p * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (i < settled || ch === " ") out += ch;
          else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setShown(out);
        if (p < 1) raf = requestAnimationFrame(tick);
        else setRunning(false);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [inView, reduce, text, duration, delay]);

  const Tag = as;
  return (
    <Tag ref={ref as never} className={`relative ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className={running ? "opacity-90" : ""}>
        {shown}
      </span>
    </Tag>
  );
}
