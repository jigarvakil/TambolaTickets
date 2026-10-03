"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { checkPrizes, type PrizeId, type PrizeResult } from "@/lib/prizeCheck";
import type { TrackedPrize } from "@/lib/prizeTracker";
import { parseTicketId, setTicket, ticketId, type ParsedTicketId } from "@/lib/ticketSet";

type Props = {
  open: boolean;
  /** Numbers called so far, in call order. */
  drawn: number[];
  /** Prizes chosen for this game, with any winners so far. */
  tracked: TrackedPrize[];
  onAward: (id: PrizeId, winner: { name: string; ticket: string; call: number; number: number }) => void;
  onClose: () => void;
};

type AwardState =
  | { kind: "awardable"; onAward: () => void }
  | { kind: "taken"; by: string }
  | { kind: "untracked" };

function PrizeRow({
  prize,
  totalCalls,
  award,
}: {
  prize: PrizeResult;
  totalCalls: number;
  award?: AwardState;
}) {
  if (prize.done && prize.completedAt) {
    const callsAgo = totalCalls - prize.completedAt.call;
    return (
      <li className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2">
        <span aria-hidden>✅</span>
        <div className="text-sm">
          <p className="font-semibold text-emerald-900">{prize.name}</p>
          <p className="text-emerald-800">
            Completed on call #{prize.completedAt.call} ({prize.completedAt.number})
            {callsAgo > 0 && (
              <span className="ml-1 font-semibold text-amber-700">
                · {callsAgo} call{callsAgo === 1 ? "" : "s"} ago
              </span>
            )}
          </p>
          {award?.kind === "awardable" && (
            <button
              type="button"
              onClick={award.onAward}
              className="mt-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              🏆 Award {prize.name}
            </button>
          )}
          {award?.kind === "taken" && (
            <p className="mt-1 text-xs font-semibold text-slate-500">Already won by {award.by}</p>
          )}
        </div>
      </li>
    );
  }

  const isCount = prize.id === "early5" || prize.id === "early7";
  return (
    <li className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
      <span aria-hidden className="opacity-60">
        ❌
      </span>
      <div className="text-sm">
        <p className="font-semibold text-slate-700">{prize.name}</p>
        <p className="text-slate-500">
          {isCount
            ? `Needs ${prize.needMore} more number${prize.needMore === 1 ? "" : "s"}`
            : `Still needs ${prize.missing.join(", ")}`}
        </p>
      </div>
    </li>
  );
}

export default function TicketCheckDialog({ open, drawn, tracked, onAward, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<ParsedTicketId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.select();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const ticket = useMemo(() => (checked ? setTicket(checked.code, checked.number) : null), [checked]);
  // Re-evaluated as more numbers are called while the dialog is open.
  const prizes = useMemo(() => (ticket ? checkPrizes(ticket, drawn) : []), [ticket, drawn]);
  const called = new Set(drawn);
  const last = drawn[drawn.length - 1];
  const won = prizes.filter((p) => p.done);
  const notWon = prizes.filter((p) => !p.done);

  function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseTicketId(input);
    if (!parsed) {
      setChecked(null);
      setError("Enter the ID printed on the ticket, like 7Q2K5-37.");
      return;
    }
    setError(null);
    setChecked(parsed);
    setPlayerName("");
  }

  function awardState(prize: PrizeResult): AwardState {
    const entry = tracked.find((t) => t.id === prize.id);
    if (!entry) return { kind: "untracked" };
    if (entry.winner) {
      return { kind: "taken", by: [entry.winner.name, entry.winner.ticket].filter(Boolean).join(" · ") };
    }
    return {
      kind: "awardable",
      onAward: () =>
        checked &&
        prize.completedAt &&
        onAward(prize.id, {
          name: playerName.trim(),
          ticket: ticketId(checked.code, checked.number),
          call: prize.completedAt.call,
          number: prize.completedAt.number,
        }),
    };
  }

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="ticket-check-title"
      className="confirm-dialog m-auto max-h-[92dvh] w-[min(94vw,40rem)] overflow-y-auto rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="ticket-check-title" className="text-lg font-bold text-slate-900">
              Check a ticket
            </h2>
            <p className="text-sm text-slate-500">
              Type the ID printed top-right on the player&apos;s ticket.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 7Q2K5-37"
            aria-label="Ticket ID"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-lg tracking-wider uppercase"
          />
          <button
            type="submit"
            className="rounded-lg bg-rose-600 px-5 font-semibold text-white hover:bg-rose-700"
          >
            Check
          </button>
        </form>
        {error && <p className="-mt-3 text-sm text-rose-600">{error}</p>}

        {checked && ticket && (
          <>
            <div>
              <p className="mb-2 flex items-center justify-between text-sm">
                <span className="font-mono font-bold tracking-wider text-slate-800">
                  {ticketId(checked.code, checked.number)}
                </span>
                <span className="text-slate-500">
                  {drawn.length} number{drawn.length === 1 ? "" : "s"} called
                </span>
              </p>
              <div className="grid grid-cols-9 border-t border-l border-slate-800">
                {ticket.flatMap((row, r) =>
                  row.map((cell, c) => {
                    const isCalled = cell !== null && called.has(cell);
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`flex aspect-square items-center justify-center border-r border-b border-slate-800 text-sm font-bold tabular-nums sm:text-lg ${
                          cell === null
                            ? "ticket-blank bg-slate-100"
                            : cell === last
                              ? "bg-amber-400 text-slate-900"
                              : isCalled
                                ? "bg-rose-600 text-white"
                                : "text-slate-900"
                        }`}
                      >
                        {cell}
                      </div>
                    );
                  }),
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-rose-600 align-middle" /> called
                <span className="mr-1 ml-3 inline-block h-2.5 w-2.5 rounded-sm bg-amber-400 align-middle" /> last call.
                Compare with the player&apos;s paper ticket before awarding.
              </p>
            </div>

            {won.some((p) => awardState(p).kind === "awardable") && (
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Player's name (optional, for the prize list)"
                aria-label="Player's name"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">
                  Won {won.length > 0 && `(${won.length})`}
                </h3>
                {won.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {won.map((p) => (
                      <PrizeRow key={p.id} prize={p} totalCalls={drawn.length} award={awardState(p)} />
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                    Nothing complete yet.
                  </p>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">Not yet</h3>
                <ul className="flex flex-col gap-2">
                  {notWon.map((p) => (
                    <PrizeRow key={p.id} prize={p} totalCalls={drawn.length} />
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
