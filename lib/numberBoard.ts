export const TOTAL_NUMBERS = 90;

export type BoardState = {
  /** Numbers called so far, in call order. */
  drawn: number[];
};

export type BoardAction =
  | { type: "draw" }
  | { type: "reset" }
  | { type: "undo" }
  /** Manual mode: the host calls a specific number (e.g. from a physical ball). */
  | { type: "call"; number: number }
  | { type: "restore"; drawn: number[] };

export const initialBoardState: BoardState = { drawn: [] };

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "draw": {
      const called = new Set(state.drawn);
      const remaining: number[] = [];
      for (let n = 1; n <= TOTAL_NUMBERS; n++) {
        if (!called.has(n)) remaining.push(n);
      }
      if (remaining.length === 0) return state;
      const next = remaining[Math.floor(Math.random() * remaining.length)];
      return { drawn: [...state.drawn, next] };
    }
    case "reset":
      return initialBoardState;
    case "call": {
      const n = action.number;
      const valid = Number.isInteger(n) && n >= 1 && n <= TOTAL_NUMBERS && !state.drawn.includes(n);
      return valid ? { drawn: [...state.drawn, n] } : state;
    }
    case "undo":
      return state.drawn.length === 0 ? state : { drawn: state.drawn.slice(0, -1) };
    case "restore":
      return isValidDrawn(action.drawn) ? { drawn: action.drawn } : state;
  }
}

/** Called numbers must be unique whole numbers 1–90. */
export function isValidDrawn(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length <= TOTAL_NUMBERS &&
    value.every((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL_NUMBERS) &&
    new Set(value).size === value.length
  );
}

const GAME_STORAGE_KEY = "tambola.boardGame";

/** Called numbers saved by this browser, so a refresh doesn't lose the game. */
export function loadSavedGame(): number[] {
  try {
    const saved = JSON.parse(localStorage.getItem(GAME_STORAGE_KEY) ?? "[]");
    return isValidDrawn(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function saveGame(drawn: number[]): void {
  try {
    if (drawn.length === 0) localStorage.removeItem(GAME_STORAGE_KEY);
    else localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(drawn));
  } catch {
    // Storage unavailable; the game just won't survive a refresh.
  }
}
