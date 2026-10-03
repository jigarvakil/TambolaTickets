"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CHECKABLE_PRIZES } from "@/lib/prizeCheck";
import {
  formatAmount,
  MAX_PRIZE_AMOUNT,
  prizePool,
  type PrizeWinner,
  type TrackedPrize,
} from "@/lib/prizeTracker";

type Props = {
  prizes: TrackedPrize[];
  /** Calls so far, used to stamp manual awards. */
  drawn: number[];
  onChange: (prizes: TrackedPrize[]) => void;
};

function AwardForm({
  onSave,
  onCancel,
}: {
  onSave: (winner: Pick<PrizeWinner, "name" | "ticket">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [ticket, setTicket] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() && !ticket.trim()) return;
    onSave({ name: name.trim(), ticket: ticket.trim().toUpperCase() || undefined });
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Winner's name"
        aria-label="Winner's name"
        className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
      <input
        value={ticket}
        onChange={(e) => setTicket(e.target.value)}
        placeholder="Ticket ID (optional)"
        aria-label="Ticket ID"
        className="w-36 rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm uppercase"
      />
      <button type="submit" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
        Save
      </button>
      <button type="button" onClick={onCancel} className="px-2 text-sm text-slate-500 hover:text-slate-800">
        Cancel
      </button>
    </form>
  );
}

function AmountInput({
  value,
  label,
  onChange,
}: {
  value: number | undefined;
  label: string;
  onChange: (amount: number | undefined) => void;
}) {
  return (
    <div className="flex shrink-0 items-center rounded-md border border-slate-300 bg-white pl-2 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100">
      <span className="text-sm text-slate-400" aria-hidden>
        ₹
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          const amount = digits ? Math.min(Number(digits), MAX_PRIZE_AMOUNT) : undefined;
          onChange(amount);
        }}
        placeholder="Amount"
        aria-label={`${label} amount (optional)`}
        className="w-20 bg-transparent px-1.5 py-1 text-sm tabular-nums outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

function PrizeSetupDialog({
  open,
  prizes,
  onSave,
  onClose,
}: {
  open: boolean;
  prizes: TrackedPrize[];
  onSave: (prizes: TrackedPrize[]) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<TrackedPrize[]>(prizes);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      // Start each edit from the current list.
      setDraft(prizes);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, prizes]);

  const has = (id: TrackedPrize["id"]) => draft.some((p) => p.id === id);

  function toggle(id: TrackedPrize["id"], name: string) {
    setDraft((d) => (has(id) ? d.filter((p) => p.id !== id) : [...d, { id, name }]));
  }

  function setAmount(id: TrackedPrize["id"], amount: number | undefined) {
    setDraft((d) => d.map((p) => (p.id === id ? { ...p, amount } : p)));
  }

  function addCustom(e: FormEvent) {
    e.preventDefault();
    const name = custom.trim();
    if (!name) return;
    setDraft((d) => [...d, { id: `custom-${Date.now()}`, name }]);
    setCustom("");
  }

  // Keep checkable prizes in their standard order, customs after.
  function ordered(list: TrackedPrize[]): TrackedPrize[] {
    const rank = (p: TrackedPrize) => {
      const i = CHECKABLE_PRIZES.findIndex((c) => c.id === p.id);
      return i === -1 ? CHECKABLE_PRIZES.length : i;
    };
    return [...list].sort((a, b) => rank(a) - rank(b));
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
      aria-labelledby="prize-setup-title"
      className="confirm-dialog m-auto max-h-[90dvh] w-[min(94vw,36rem)] overflow-y-auto rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4 p-6">
        <div>
          <h2 id="prize-setup-title" className="text-lg font-bold text-slate-900">
            Prizes for this game
          </h2>
          <p className="text-sm text-slate-500">
            Ticked prizes can be checked and awarded automatically. Amounts are optional.
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CHECKABLE_PRIZES.map((p) => {
            const selected = draft.find((d) => d.id === p.id);
            return (
              <li
                key={p.id}
                className={`flex min-h-12 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                  selected ? "border-rose-300 bg-rose-50" : "border-slate-200"
                }`}
              >
                <label className="flex flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(selected)}
                    onChange={() => toggle(p.id, p.name)}
                    className="accent-rose-600"
                  />
                  {p.name}
                </label>
                {selected && (
                  <AmountInput value={selected.amount} label={p.name} onChange={(a) => setAmount(p.id, a)} />
                )}
              </li>
            );
          })}
        </ul>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Custom prizes</h3>
          {draft.filter((p) => p.id.startsWith("custom-")).length > 0 && (
            <ul className="mb-2 flex flex-col gap-2">
              {draft
                .filter((p) => p.id.startsWith("custom-"))
                .map((p) => (
                  <li
                    key={p.id}
                    className="flex min-h-12 items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm text-slate-800"
                  >
                    <span className="flex-1 truncate">{p.name}</span>
                    <AmountInput value={p.amount} label={p.name} onChange={(a) => setAmount(p.id, a)} />
                    <button
                      type="button"
                      onClick={() => toggle(p.id, p.name)}
                      aria-label={`Remove ${p.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-rose-100"
                    >
                      ×
                    </button>
                  </li>
                ))}
            </ul>
          )}
          <form onSubmit={addCustom} className="flex gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. Lucky 7s, Pyramid"
              maxLength={30}
              aria-label="Custom prize name"
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
            <button type="submit" className="rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:border-slate-400">
              Add
            </button>
          </form>
          <p className="mt-1 text-xs text-slate-500">Custom prizes are awarded by hand.</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {prizePool(draft) > 0 && (
            <p className="mr-auto text-sm text-slate-600">
              Prize pool <span className="font-bold text-slate-900">{formatAmount(prizePool(draft))}</span>
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:border-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={draft.length === 0}
            onClick={() => {
              // Keep existing winners for prizes that stay on the list; take
              // names and amounts from the edited draft.
              const kept = ordered(draft).map((p) => {
                const winner = prizes.find((old) => old.id === p.id)?.winner;
                return winner ? { ...p, winner } : p;
              });
              onSave(kept);
            }}
            className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            Save prizes
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default function PrizeTracker({ prizes, drawn, onChange }: Props) {
  const [awarding, setAwarding] = useState<TrackedPrize["id"] | null>(null);
  const [editing, setEditing] = useState(false);
  const wonCount = prizes.filter((p) => p.winner).length;

  function award(id: TrackedPrize["id"], winner: Pick<PrizeWinner, "name" | "ticket">) {
    onChange(
      prizes.map((p) =>
        p.id === id
          ? { ...p, winner: { ...winner, call: drawn.length, number: drawn[drawn.length - 1] } }
          : p,
      ),
    );
    setAwarding(null);
  }

  function clearWinner(id: TrackedPrize["id"]) {
    onChange(prizes.map(({ winner, ...p }) => (p.id === id ? p : { ...p, winner })));
  }

  return (
    <div data-tour="prizes" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-800">
          Prizes{" "}
          <span className="text-sm font-normal text-slate-500">
            {wonCount} of {prizes.length} won
            {prizePool(prizes) > 0 && ` · ${formatAmount(prizePool(prizes))} pool`}
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm font-semibold text-rose-600 hover:underline"
        >
          Edit prizes
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {prizes.map((p) => (
          <li
            key={p.id}
            className={`rounded-lg border px-3 py-2 ${
              p.winner ? "border-emerald-200 bg-emerald-50" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className={`font-medium ${p.winner ? "text-emerald-900" : "text-slate-800"}`}>
                  {p.winner ? "🏆 " : ""}
                  {p.name}
                </p>
                {p.winner && (
                  <p className="truncate text-sm text-emerald-800">
                    {[p.winner.name, p.winner.ticket].filter(Boolean).join(" · ")}
                    <span className="text-emerald-700/70"> — call #{p.winner.call}</span>
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {p.amount !== undefined && p.amount > 0 && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums ${
                      p.winner ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {formatAmount(p.amount)}
                  </span>
                )}
                {p.winner ? (
                  <button
                    type="button"
                    onClick={() => clearWinner(p.id)}
                    aria-label={`Remove winner of ${p.name}`}
                    title="Remove winner"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-emerald-700 hover:bg-emerald-100"
                  >
                    ×
                  </button>
                ) : (
                  awarding !== p.id && (
                    <button
                      type="button"
                      onClick={() => setAwarding(p.id)}
                      disabled={drawn.length === 0}
                      className="shrink-0 rounded-md border border-slate-300 px-2.5 py-1 text-sm font-semibold text-slate-700 hover:border-slate-400 disabled:opacity-40"
                    >
                      Award
                    </button>
                  )
                )}
              </div>
            </div>
            {awarding === p.id && (
              <AwardForm onSave={(w) => award(p.id, w)} onCancel={() => setAwarding(null)} />
            )}
          </li>
        ))}
      </ul>

      <PrizeSetupDialog
        open={editing}
        prizes={prizes}
        onSave={(next) => {
          onChange(next);
          setEditing(false);
        }}
        onClose={() => setEditing(false)}
      />
    </div>
  );
}
