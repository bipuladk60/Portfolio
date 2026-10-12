"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { mulberry32 } from "../chautari/prng";

/**
 * Tiny live limit order book: passive orders rest, aggressive orders walk the book,
 * cancels thin it out. Prices are integer ticks shown as dollars. Pure illustration, labelled SIM.
 */

type Book = { bids: Map<number, number>; asks: Map<number, number> };
type Trade = { id: number; price: number; qty: number; buy: boolean };
type Snap = {
  asks: [number, number][];
  bids: [number, number][];
  spread: number;
  mid: number;
  max: number;
  trade: Trade | null;
  tape: Trade[];
};

const ROWS = 6;
const TAPE = 9;
const DEPTH = 9;

function initialBook(): Book {
  const rng = mulberry32(2048);
  const bids = new Map<number, number>();
  const asks = new Map<number, number>();
  for (let i = 1; i <= DEPTH; i++) {
    bids.set(10000 - i, 2 + Math.floor(rng() * 16));
    asks.set(10000 + i, 2 + Math.floor(rng() * 16));
  }
  return { bids, asks };
}

const bestBid = (b: Book) => Math.max(...b.bids.keys());
const bestAsk = (b: Book) => Math.min(...b.asks.keys());

function snapshot(b: Book, trade: Trade | null): Snap {
  const asks = [...b.asks.entries()].sort((x, y) => x[0] - y[0]).slice(0, ROWS);
  const bids = [...b.bids.entries()].sort((x, y) => y[0] - x[0]).slice(0, ROWS);
  const max = Math.max(1, ...asks.map((l) => l[1]), ...bids.map((l) => l[1]));
  const ba = asks[0]?.[0] ?? 0;
  const bb = bids[0]?.[0] ?? 0;
  return { asks, bids, spread: ba - bb, mid: (ba + bb) / 2, max, trade, tape: [] };
}

function step(b: Book, rng: () => number, id: number): Trade | null {
  const bb = bestBid(b);
  const ba = bestAsk(b);
  const r = rng();
  let trade: Trade | null = null;

  if (r < 0.52) {
    // passive limit order, sometimes improving the touch
    const buy = rng() < 0.5;
    const off = Math.floor(rng() * 5) - 1;
    let price = buy ? bb - off : ba + off;
    if (buy && price >= ba) price = bb;
    if (!buy && price <= bb) price = ba;
    const side = buy ? b.bids : b.asks;
    side.set(price, (side.get(price) ?? 0) + 1 + Math.floor(rng() * 10));
  } else if (r < 0.84) {
    // aggressive order walks the opposite side
    const buy = rng() < 0.5;
    const book = buy ? b.asks : b.bids;
    let qty = 2 + Math.floor(rng() * 14);
    let filled = 0;
    let last = buy ? ba : bb;
    while (qty > 0 && book.size > 0) {
      const px = buy ? Math.min(...book.keys()) : Math.max(...book.keys());
      const avail = book.get(px) ?? 0;
      const fill = Math.min(avail, qty);
      qty -= fill;
      filled += fill;
      last = px;
      if (avail - fill <= 0) book.delete(px);
      else book.set(px, avail - fill);
    }
    trade = { id, price: last, qty: filled, buy };
  } else {
    // cancel part of a resting order near the touch
    const side = rng() < 0.5 ? b.bids : b.asks;
    const keys = [...side.keys()].sort((x, y) => (side === b.bids ? y - x : x - y)).slice(0, 6);
    const k = keys[Math.floor(rng() * keys.length)];
    const left = (side.get(k) ?? 0) - (1 + Math.floor(rng() * 6));
    if (left <= 0) side.delete(k);
    else side.set(k, left);
  }

  // keep both sides populated and bounded
  while (b.bids.size < DEPTH) {
    const low = b.bids.size ? Math.min(...b.bids.keys()) : bestAsk(b);
    b.bids.set(low - 1, 2 + Math.floor(rng() * 14));
  }
  while (b.asks.size < DEPTH) {
    const high = b.asks.size ? Math.max(...b.asks.keys()) : bestBid(b);
    b.asks.set(high + 1, 2 + Math.floor(rng() * 14));
  }
  while (b.bids.size > DEPTH + 6) b.bids.delete(Math.min(...b.bids.keys()));
  while (b.asks.size > DEPTH + 6) b.asks.delete(Math.max(...b.asks.keys()));
  return trade;
}

const px = (p: number) => (p / 100).toFixed(2);

export function OrderBookSim() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  const reduce = useReducedMotion();
  const [snap, setSnap] = useState<Snap>(() => snapshot(initialBook(), null));
  const bookRef = useRef<Book | null>(null);
  const rngRef = useRef<(() => number) | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (!inView || reduce) return;
    if (!bookRef.current) bookRef.current = initialBook();
    if (!rngRef.current) rngRef.current = mulberry32(Math.floor(Math.random() * 1e9));
    const book = bookRef.current;
    const rng = rngRef.current;
    const id = window.setInterval(() => {
      idRef.current += 1;
      const t = step(book, rng, idRef.current);
      setSnap((prev) => ({ ...snapshot(book, t ?? prev.trade), tape: t ? [t, ...prev.tape].slice(0, TAPE) : prev.tape }));
    }, 460);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  const row = (side: "ask" | "bid", [price, size]: [number, number]) => {
    const traded = snap.trade && snap.trade.price === price;
    const color = side === "ask" ? "var(--fire)" : "var(--water)";
    return (
      <div
        key={`${price}-${traded ? snap.trade?.id : "r"}`}
        className={`relative grid grid-cols-[1fr_auto] items-center px-2 leading-[15px] lg:leading-[21px] ${traded ? "pb-flash" : ""}`}
      >
        <span
          className="absolute inset-y-[1px] right-0 transition-[width] duration-300 ease-out"
          style={{ width: `${(size / snap.max) * 100}%`, background: `color-mix(in oklab, ${color} 16%, transparent)` }}
        />
        <span className="relative" style={{ color }}>
          {px(price)}
        </span>
        <span className="relative text-text/80 tabular-nums">{size}</span>
      </div>
    );
  };

  return (
    <div ref={ref} className="flex h-full gap-4 p-3 pr-4 font-mono text-[10px] md:text-[11px]">
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="mb-1 grid grid-cols-[1fr_auto] px-2 text-[9px] uppercase tracking-[0.14em] text-dim/70">
          <span>Price</span>
          <span>Size</span>
        </div>
        {[...snap.asks].reverse().map((l) => row("ask", l))}
        <div className="my-1 flex items-center justify-between border-y border-line px-2 py-[3px] text-[9px] uppercase tracking-[0.12em] text-signal">
          <span>Spread {px(snap.spread)}</span>
          <span className="hidden text-dim sm:inline">Mid {px(snap.mid)}</span>
        </div>
        {snap.bids.map((l) => row("bid", l))}
      </div>
      <div className="hidden w-[40%] min-w-0 flex-col border-l border-line pl-3 sm:flex">
        <p className="text-[9px] uppercase tracking-[0.14em] text-dim/70">Engine</p>
        <p className="mt-1 text-text">Array-indexed levels</p>
        <p className="text-dim">O(1) cancel</p>
        <p className="mt-4 flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-dim/70">
          <span>Fills tape</span>
          <span>Qty @ px</span>
        </p>
        <ol className="mt-1 min-h-0 flex-1 overflow-hidden border-t border-line">
          {snap.tape.length === 0 && <li className="py-1 text-dim">Waiting for an aggressive order</li>}
          {snap.tape.map((t, i) => (
            <li
              key={t.id}
              className={`flex justify-between border-b border-line/60 py-[3px] lg:py-[5px] ${i === 0 ? "pb-flash" : ""}`}
              style={{ opacity: 1 - i * 0.08 }}
            >
              <span style={{ color: t.buy ? "var(--water)" : "var(--fire)" }}>{t.buy ? "BUY" : "SELL"}</span>
              <span className="tabular-nums text-text/80">
                {t.qty} @ {px(t.price)}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-dim/70">Sim · not market data</p>
      </div>
    </div>
  );
}
