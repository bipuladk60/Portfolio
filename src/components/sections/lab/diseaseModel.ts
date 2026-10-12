// Faithful browser re-implementation of simulation.ipynb from
// github.com/bipuladk60/infectious-disease-simulation. One step = one notebook frame = one day.
import { diseaseSim } from "@/data/content";

export const P = diseaseSim.params;
/** The notebook animates range(100) frames. */
export const RUN_DAYS = 100;

export const SUSCEPTIBLE = 0;
export const INFECTED = 1;
export const RECOVERED = 2;
export const DEAD = 3;

/** mulberry32: small seeded PRNG so a run can be replayed. */
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

/** Standard normal via Box-Muller (np.random.randn). */
function randn(rng: Rng) {
  let u = 0;
  while (u === 0) u = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

/** Gamma(shape, 1) via Marsaglia-Tsang; shape >= 1 here (2 and 5). */
function gamma(rng: Rng, shape: number): number {
  if (shape < 1) return gamma(rng, shape + 1) * Math.pow(rng(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = randn(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

/** np.random.beta(a, b) = X / (X + Y), X ~ Gamma(a), Y ~ Gamma(b). */
function betaSample(rng: Rng, a: number, b: number) {
  const x = gamma(rng, a);
  const y = gamma(rng, b);
  return x / (x + y);
}

/** assign_recovery_days(): 14 + (28 - 14) * Beta(2, 5). */
function recoveryDays(rng: Rng) {
  return P.recoveryMin + (P.recoveryMax - P.recoveryMin) * betaSample(rng, P.betaAlpha, P.betaBeta);
}

/** viral_load(day): vl_array[clamp(day - 1, 0, 20)]. */
export function viralLoad(day: number) {
  const vl = P.viralLoad;
  return vl[Math.max(0, Math.min(day - 1, vl.length - 1))];
}

export type Counts = { s: number; i: number; r: number; d: number };

export type Sim = {
  n: number;
  day: number;
  x: Float32Array;
  y: Float32Array;
  px: Float32Array; // positions before the last step, for smooth interpolation
  py: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  status: Uint8Array;
  days: Int32Array;
  recovery: Float32Array;
  /** Notebook counters. */
  newInfections: number;
  reinfections: number;
  recovered: number;
  deaths: number;
  history: Counts[];
  rng: Rng;
};

export function counts(sim: Sim): Counts {
  const c = { s: 0, i: 0, r: 0, d: 0 };
  for (let k = 0; k < sim.n; k++) {
    const st = sim.status[k];
    if (st === SUSCEPTIBLE) c.s++;
    else if (st === INFECTED) c.i++;
    else if (st === RECOVERED) c.r++;
    else c.d++;
  }
  return c;
}

export function createSim(seed: number, population: number = P.population, initialInfected: number = P.initialInfected): Sim {
  const rng = makeRng(seed);
  const n = population;
  const W = P.size;
  const sim: Sim = {
    n,
    day: 0,
    x: new Float32Array(n),
    y: new Float32Array(n),
    px: new Float32Array(n),
    py: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    status: new Uint8Array(n),
    days: new Int32Array(n),
    recovery: new Float32Array(n),
    newInfections: 0,
    reinfections: 0,
    recovered: 0,
    deaths: 0,
    history: [],
    rng,
  };
  for (let k = 0; k < n; k++) {
    if (k < initialInfected) {
      sim.status[k] = INFECTED;
      sim.days[k] = 1;
      sim.recovery[k] = recoveryDays(rng);
    }
    sim.x[k] = sim.px[k] = rng() * W;
    sim.y[k] = sim.py[k] = rng() * W;
    sim.vx[k] = randn(rng) * 2;
    sim.vy[k] = randn(rng) * 2;
  }
  sim.history.push(counts(sim));
  return sim;
}

/** One notebook update(frame): individuals are processed in order and see earlier updates, as in the loop. */
export function step(sim: Sim) {
  const { n, x, y, vx, vy, status, days, recovery, rng } = sim;
  const W = P.size;
  sim.px.set(x);
  sim.py.set(y);
  for (let i = 0; i < n; i++) {
    if (status[i] !== DEAD) {
      x[i] += vx[i];
      y[i] += vy[i];
      // reflect off walls, then clamp into the box
      if (x[i] <= 0 || x[i] >= W) {
        vx[i] *= -1;
        x[i] = Math.max(Math.min(x[i], W), 0);
      }
      if (y[i] <= 0 || y[i] >= W) {
        vy[i] *= -1;
        y[i] = Math.max(Math.min(y[i], W), 0);
      }
    }

    if (status[i] === INFECTED) {
      if (days[i] >= recovery[i]) {
        status[i] = RECOVERED;
        sim.recovered++;
      } else if (days[i] > P.deathAfterDay) {
        status[i] = DEAD;
        vx[i] = 0;
        vy[i] = 0;
        sim.deaths++;
      }
    }

    if (status[i] === SUSCEPTIBLE || status[i] === RECOVERED) {
      for (let j = 0; j < n; j++) {
        if (i === j || status[j] !== INFECTED) continue;
        const dist = Math.hypot(x[i] - x[j], y[i] - y[j]);
        const tp = Math.exp(-dist / viralLoad(days[j]));
        if (rng() < tp) {
          if (status[i] === SUSCEPTIBLE) sim.newInfections++;
          else sim.reinfections++;
          status[i] = INFECTED;
          days[i] = 1;
          recovery[i] = recoveryDays(rng);
          break;
        }
      }
    }

    if (status[i] === INFECTED) days[i] += 1;
  }
  sim.day++;
  sim.history.push(counts(sim));
}

/** A run is over at the notebook's last frame, or once nobody is infected (nothing can change after that). */
export function isDone(sim: Sim) {
  const last = sim.history[sim.history.length - 1];
  return sim.day >= RUN_DAYS || last.i === 0;
}
