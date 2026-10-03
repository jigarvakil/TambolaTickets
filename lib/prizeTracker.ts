import { CHECKABLE_PRIZES, type PrizeId } from "./prizeCheck.ts";

export type PrizeWinner = {
  /** Player name and/or ticket ID, as entered by the host. */
  name: string;
  ticket?: string;
  /** Call on which the prize was awarded (1-based) and the number called then. */
  call: number;
  number?: number;
};

export type TrackedPrize = {
  /** A checkable PrizeId, or "custom-…" for host-defined prizes. */
  id: PrizeId | `custom-${string}`;
  name: string;
  /** Optional prize money, in rupees. */
  amount?: number;
  winner?: PrizeWinner;
};

/** Largest prize amount accepted (₹99,99,999). */
export const MAX_PRIZE_AMOUNT = 9_999_999;

/** "₹2,500" — Indian digit grouping. */
export function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Sum of all prize amounts set for the game. */
export function prizePool(prizes: TrackedPrize[]): number {
  return prizes.reduce((sum, p) => sum + (p.amount ?? 0), 0);
}

export const DEFAULT_PRIZE_IDS: PrizeId[] = ["early5", "top", "middle", "bottom", "fullHouse"];

export function defaultTrackedPrizes(): TrackedPrize[] {
  return CHECKABLE_PRIZES.filter((p) => DEFAULT_PRIZE_IDS.includes(p.id)).map((p) => ({ ...p }));
}

export function isCheckable(id: TrackedPrize["id"]): id is PrizeId {
  return CHECKABLE_PRIZES.some((p) => p.id === id);
}

/** Same prizes and amounts, no winners. */
export function clearWinners(prizes: TrackedPrize[]): TrackedPrize[] {
  return prizes.map(({ id, name, amount }) => (amount === undefined ? { id, name } : { id, name, amount }));
}

const STORAGE_KEY = "tambola.prizeTracker";

function isTrackedPrize(value: unknown): value is TrackedPrize {
  if (typeof value !== "object" || value === null) return false;
  const p = value as TrackedPrize;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    p.name.length > 0 &&
    (p.amount === undefined || (Number.isInteger(p.amount) && p.amount >= 0 && p.amount <= MAX_PRIZE_AMOUNT))
  );
}

export function loadTrackedPrizes(): TrackedPrize[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(saved) && saved.every(isTrackedPrize)) return saved;
  } catch {
    // Unreadable — fall back to defaults.
  }
  return defaultTrackedPrizes();
}

export function saveTrackedPrizes(prizes: TrackedPrize[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes));
  } catch {
    // Storage unavailable; the tracker just won't survive a refresh.
  }
}
