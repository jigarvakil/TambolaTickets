"use client";

import type { FormEvent, Ref } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Returns an error message, or null when the number was called. */
  onCall: (n: number) => string | null;
  error: string | null;
  onError: (error: string | null) => void;
  disabled: boolean;
  tv?: boolean;
  inputRef?: Ref<HTMLInputElement>;
};

/** Manual mode: type the number from a physical ball/chit and press Enter. */
export default function ManualEntry({ value, onChange, onCall, error, onError, disabled, tv = false, inputRef }: Props) {
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!value) return;
    const message = onCall(Number(value));
    onError(message);
    if (!message) onChange("");
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value.replace(/\D/g, "").slice(0, 2));
            onError(null);
          }}
          inputMode="numeric"
          autoComplete="off"
          placeholder="No."
          aria-label="Number to call"
          disabled={disabled}
          className={`w-28 rounded-lg border-2 px-3 py-2.5 text-center text-2xl font-extrabold tabular-nums outline-none ${
            tv
              ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-600 focus:border-rose-500"
              : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-300 focus:border-rose-500"
          }`}
        />
        <button
          type="submit"
          disabled={disabled || !value}
          className="rounded-lg bg-rose-600 px-6 py-3 text-lg font-bold text-white shadow hover:bg-rose-700 disabled:opacity-50"
        >
          Call
        </button>
      </form>
      <p className={`text-sm ${error ? "font-semibold text-rose-500" : tv ? "text-slate-500" : "text-slate-500"}`}>
        {error ?? "Type the number and press Enter — or tap it on the board."}
      </p>
    </div>
  );
}
