import type { Ticket } from "@/types/ticket";

export type PrizeId =
  | "early5"
  | "early7"
  | "top"
  | "middle"
  | "bottom"
  | "corners"
  | "star"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "fullHouse";

export type PrizeResult = {
  id: PrizeId;
  name: string;
  done: boolean;
  /** Numbers still needed (empty when done). For Early N: any of the unmarked ones. */
  missing: number[];
  /** For "any N" prizes, how many more numbers are needed. */
  needMore: number;
  /** When the pattern was completed: 1-based call index and that number. */
  completedAt?: { call: number; number: number };
};

type PatternPrize = { id: PrizeId; name: string; numbers: (t: Ticket) => number[] };
type CountPrize = { id: PrizeId; name: string; count: number };

const filled = (cells: (number | null)[]) => cells.filter((c): c is number => c !== null);
const rowNumbers = (t: Ticket, r: number) => filled(t[r]);
const allNumbers = (t: Ticket) => t.flatMap(filled);
const columnsNumbers = (t: Ticket, from: number, to: number) =>
  t.flatMap((row) => filled(row.slice(from, to + 1)));

function corners(t: Ticket): number[] {
  const top = rowNumbers(t, 0);
  const bottom = rowNumbers(t, 2);
  return [top[0], top[top.length - 1], bottom[0], bottom[bottom.length - 1]];
}

const COUNT_PRIZES: CountPrize[] = [
  { id: "early5", name: "Early Five", count: 5 },
  { id: "early7", name: "Early Seven", count: 7 },
];

const PATTERN_PRIZES: PatternPrize[] = [
  { id: "top", name: "Top Line", numbers: (t) => rowNumbers(t, 0) },
  { id: "middle", name: "Middle Line", numbers: (t) => rowNumbers(t, 1) },
  { id: "bottom", name: "Bottom Line", numbers: (t) => rowNumbers(t, 2) },
  { id: "corners", name: "Four Corners", numbers: corners },
  // Corners plus the middle (3rd) number of the middle row.
  { id: "star", name: "Star", numbers: (t) => [...corners(t), rowNumbers(t, 1)[2]] },
  { id: "breakfast", name: "Breakfast (1–29)", numbers: (t) => columnsNumbers(t, 0, 2) },
  { id: "lunch", name: "Lunch (30–59)", numbers: (t) => columnsNumbers(t, 3, 5) },
  { id: "dinner", name: "Dinner (60–90)", numbers: (t) => columnsNumbers(t, 6, 8) },
  { id: "fullHouse", name: "Full House", numbers: allNumbers },
];

/** Every prize the checker can verify, in display order. */
export const CHECKABLE_PRIZES: { id: PrizeId; name: string }[] = [
  ...COUNT_PRIZES.map(({ id, name }) => ({ id, name })),
  ...PATTERN_PRIZES.map(({ id, name }) => ({ id, name })),
];

/** Check every supported prize for `ticket` against the numbers called so far (in call order). */
export function checkPrizes(ticket: Ticket, drawn: number[]): PrizeResult[] {
  const callIndex = new Map(drawn.map((n, i) => [n, i]));
  const all = allNumbers(ticket);
  const marked = all.filter((n) => callIndex.has(n));
  const unmarked = all.filter((n) => !callIndex.has(n));
  // Ticket numbers in the order they were called.
  const markedInOrder = [...marked].sort((a, b) => callIndex.get(a)! - callIndex.get(b)!);

  const countResults = COUNT_PRIZES.map<PrizeResult>(({ id, name, count }) => {
    const done = marked.length >= count;
    const completing = markedInOrder[count - 1];
    return {
      id,
      name,
      done,
      missing: done ? [] : unmarked,
      needMore: Math.max(0, count - marked.length),
      completedAt: done ? { call: callIndex.get(completing)! + 1, number: completing } : undefined,
    };
  });

  const patternResults = PATTERN_PRIZES.map<PrizeResult>(({ id, name, numbers }) => {
    const required = numbers(ticket);
    const missing = required.filter((n) => !callIndex.has(n));
    const done = missing.length === 0;
    let completedAt: PrizeResult["completedAt"];
    if (done) {
      const last = required.reduce((a, b) => (callIndex.get(a)! > callIndex.get(b)! ? a : b));
      completedAt = { call: callIndex.get(last)! + 1, number: last };
    }
    return { id, name, done, missing, needMore: missing.length, completedAt };
  });

  return [...countResults, ...patternResults];
}
