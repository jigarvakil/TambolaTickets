import type { Ref } from "react";
import { TOTAL_NUMBERS } from "@/lib/numberBoard";

type Props = {
  /** Numbers that have landed on the board, in call order. */
  drawn: number[];
  ref?: Ref<HTMLDivElement>;
  /** Dark, larger styling for TV / projector mode. */
  tv?: boolean;
  /**
   * Manual mode: tapping an uncalled number calls it. `allCalled` includes
   * numbers still flying to the board, so they can't be tapped twice.
   */
  onPick?: (n: number) => void;
  allCalled?: number[];
};

export default function NumberBoard({ drawn, ref, tv = false, onPick, allCalled = drawn }: Props) {
  const called = new Set(drawn);
  const taken = new Set(allCalled);
  const last = drawn[drawn.length - 1];

  return (
    <div ref={ref} className={`grid grid-cols-10 ${tv ? "gap-1.5 sm:gap-2" : "gap-1 sm:gap-1.5"}`}>
      {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map((n) => {
        const isCalled = called.has(n);
        const isLast = n === last;
        const pickable = Boolean(onPick) && !taken.has(n);
        const className = `flex aspect-square items-center justify-center rounded-md font-bold tabular-nums transition-colors duration-300 ${
          tv ? "text-[clamp(0.9rem,2.2vw,2.4rem)]" : "text-sm sm:text-lg lg:text-xl"
        } ${
          isLast
            ? "board-land bg-amber-400 text-slate-900 ring-2 ring-amber-600"
            : isCalled
              ? "bg-rose-600 text-white"
              : tv
                ? "bg-slate-800 text-slate-500"
                : "bg-white text-slate-400 ring-1 ring-slate-200"
        } ${
          pickable
            ? tv
              ? "cursor-pointer hover:bg-slate-700 hover:text-white"
              : "cursor-pointer hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-300"
            : ""
        }`;

        return pickable ? (
          <button
            key={n}
            type="button"
            data-n={n}
            onClick={() => onPick!(n)}
            aria-label={`Call ${n}`}
            className={className}
          >
            {n}
          </button>
        ) : (
          <div key={n} data-n={n} aria-label={`${n}${isCalled ? " called" : ""}`} className={className}>
            {n}
          </div>
        );
      })}
    </div>
  );
}
