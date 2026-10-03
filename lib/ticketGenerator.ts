import type { Strip, Ticket } from "@/types/ticket";

export const ROWS = 3;
export const COLS = 9;
export const TICKETS_PER_STRIP = 6;
export const NUMBERS_PER_TICKET = 15;
export const NUMBERS_PER_ROW = 5;

/** Inclusive [min, max] number range for each column. */
export const COLUMN_RANGES: ReadonlyArray<readonly [number, number]> = [
  [1, 9],
  [10, 19],
  [20, 29],
  [30, 39],
  [40, 49],
  [50, 59],
  [60, 69],
  [70, 79],
  [80, 90],
];

/** Source of random numbers in [0, 1); pass a seeded one for reproducible tickets. */
export type Rng = () => number;

const MAX_COUNT_ATTEMPTS = 200;
const MAX_ROW_ATTEMPTS = 800;

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

/**
 * Step 1: decide how many numbers each ticket gets in each column.
 * Returns counts[ticket][col]. Every ticket gets ≥1 and ≤3 per column, and
 * exactly 15 in total.
 */
function columnCounts(rng: Rng): number[][] {
  for (let attempt = 0; attempt < MAX_COUNT_ATTEMPTS; attempt++) {
    const counts = Array.from({ length: TICKETS_PER_STRIP }, () =>
      Array<number>(COLS).fill(1),
    );
    const totals = Array<number>(TICKETS_PER_STRIP).fill(COLS);

    for (let col = 0; col < COLS; col++) {
      const [min, max] = COLUMN_RANGES[col];
      let extras = max - min + 1 - TICKETS_PER_STRIP;
      while (extras > 0) {
        // Least-loaded first; shuffle beforehand so ties break randomly.
        const order = shuffle(range(0, TICKETS_PER_STRIP - 1), rng)
          .filter((t) => counts[t][col] < ROWS)
          .sort((a, b) => totals[a] - totals[b]);
        if (order.length === 0) break;
        const t = order[0];
        counts[t][col]++;
        totals[t]++;
        extras--;
      }
    }

    if (totals.every((n) => n === NUMBERS_PER_TICKET)) return counts;
  }
  throw new Error("Failed to balance column counts");
}

/** Step 3: place a ticket's column numbers into rows so each row has 5. */
function placeRows(columns: number[][], rng: Rng): Ticket {
  for (let attempt = 0; attempt < MAX_ROW_ATTEMPTS; attempt++) {
    const grid: Ticket = Array.from({ length: ROWS }, () =>
      Array<number | null>(COLS).fill(null),
    );

    for (let col = 0; col < COLS; col++) {
      const nums = columns[col];
      const rows = shuffle(range(0, ROWS - 1), rng)
        .slice(0, nums.length)
        .sort((a, b) => a - b);
      rows.forEach((row, i) => {
        grid[row][col] = nums[i];
      });
    }

    const balanced = grid.every(
      (row) => row.filter((c) => c !== null).length === NUMBERS_PER_ROW,
    );
    if (balanced) return grid;
  }
  throw new Error("Failed to place rows");
}

/** Generate one strip of 6 tickets covering 1–90 exactly once. */
export function generateStrip(rng: Rng = Math.random): Strip {
  const counts = columnCounts(rng);

  // Step 2: perTicket[ticket][col] = sorted numbers for that ticket/column.
  const perTicket: number[][][] = Array.from(
    { length: TICKETS_PER_STRIP },
    () => [],
  );
  for (let col = 0; col < COLS; col++) {
    const [min, max] = COLUMN_RANGES[col];
    const pool = shuffle(range(min, max), rng);
    let offset = 0;
    for (let t = 0; t < TICKETS_PER_STRIP; t++) {
      const n = counts[t][col];
      perTicket[t][col] = pool.slice(offset, offset + n).sort((a, b) => a - b);
      offset += n;
    }
  }

  return perTicket.map((columns) => placeRows(columns, rng));
}

export function generateStrips(count: number, rng: Rng = Math.random): Strip[] {
  return Array.from({ length: count }, () => generateStrip(rng));
}
