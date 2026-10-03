"use client";

import { useEffect, useRef } from "react";
import { AUTO_INTERVALS, type BoardSettings } from "@/lib/boardSettings";
import { callText, LANGUAGES } from "@/lib/numberCall";
import { findVoice, useVoices } from "@/lib/speech";

type Props = {
  open: boolean;
  settings: BoardSettings;
  onChange: (settings: BoardSettings) => void;
  onClose: () => void;
};

const SAMPLE_NUMBER = 24;

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-rose-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

export default function BoardSettingsDrawer({ open, settings, onChange, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const voices = useVoices();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const isOn = (l: BoardSettings["languages"][number]) => l.enabled && LANGUAGES[l.code].available;
  const enabledCount = settings.languages.filter(isOn).length;
  const availableCount = settings.languages.filter((l) => LANGUAGES[l.code].available).length;

  function toggleLanguage(index: number) {
    const languages = settings.languages.map((l, i) =>
      i === index ? { ...l, enabled: !l.enabled } : l,
    );
    // At least one language must stay on.
    if (!languages.some(isOn)) return;
    onChange({ ...settings, languages });
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= settings.languages.length) return;
    const languages = settings.languages.slice();
    [languages[index], languages[target]] = [languages[target], languages[index]];
    onChange({ ...settings, languages });
  }

  // Position of each enabled language in the spoken order (1-based).
  const order = new Map(
    settings.languages.filter(isOn).map((l, i) => [l.code, i + 1]),
  );

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
      aria-labelledby="board-settings-title"
      className="settings-drawer fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-[min(100vw,24rem)] max-w-none bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="board-settings-title" className="text-lg font-bold text-slate-900">
            Board settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-5 py-5">
          <section>
            <h3 className="font-semibold text-slate-900">Draw mode</h3>
            <p className="mb-3 text-sm text-slate-500">
              Let the site draw numbers, or call them yourself from a physical ball set.
            </p>
            <div role="radiogroup" aria-label="Draw mode" className="grid grid-cols-2 gap-2">
              {(
                [
                  ["random", "🎲 Random", "Site draws numbers"],
                  ["manual", "✋ Manual", "You call physical balls"],
                ] as const
              ).map(([mode, label, hint]) => {
                const selected = settings.drawMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange({ ...settings, drawMode: mode })}
                    className={`rounded-lg border px-3 py-2.5 text-left ${
                      selected ? "border-rose-400 bg-rose-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className={`block font-semibold ${selected ? "text-rose-700" : "text-slate-800"}`}>
                      {label}
                    </span>
                    <span className="text-xs text-slate-500">{hint}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Announce aloud</h3>
              <p className="text-sm text-slate-500">Speak each number as it is drawn.</p>
            </div>
            <Toggle
              label="Announce aloud"
              checked={settings.voice}
              onChange={(voice) => onChange({ ...settings, voice })}
            />
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="-mb-1 font-semibold text-slate-900">Effects</h3>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">Ball machine animation</p>
                <p className="text-sm text-slate-500">
                  {settings.drawMode === "manual"
                    ? "Random mode only — in Manual mode you already have the ball."
                    : "Balls tumble in a drum before each number comes out."}
                </p>
              </div>
              <Toggle
                label="Ball machine animation"
                checked={settings.machine}
                onChange={(machine) => onChange({ ...settings, machine })}
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">Sound effects</p>
                <p className="text-sm text-slate-500">Rattle while drawing and a pop for each number.</p>
              </div>
              <Toggle
                label="Sound effects"
                checked={settings.sounds}
                onChange={(sounds) => onChange({ ...settings, sounds })}
              />
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900">Calling languages</h3>
            <p className="mb-3 text-sm text-slate-500">
              {availableCount > 1
                ? "Tick one or more. Use the arrows to set which is called first."
                : "More languages coming soon."}
            </p>
            <ol className="flex flex-col gap-2">
              {settings.languages
                .map((l, i) => ({ l, i }))
                // Available languages first; "coming soon" ones after.
                .sort((a, b) => Number(LANGUAGES[b.l.code].available) - Number(LANGUAGES[a.l.code].available))
                .map(({ l, i }) => {
                const info = LANGUAGES[l.code];
                if (!info.available) {
                  return (
                    <li
                      key={l.code}
                      className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 px-3 py-2.5 text-slate-400"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                        –
                      </span>
                      <span className="flex-1 font-medium">
                        {info.label} <span>· {info.nativeLabel}</span>
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        Coming soon
                      </span>
                    </li>
                  );
                }
                const hasVoice = voices.length === 0 || Boolean(findVoice(voices, info.speechLang));
                const position = order.get(l.code);
                return (
                  <li
                    key={l.code}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                      isOn(l) ? "border-rose-200 bg-rose-50/60" : "border-slate-200"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        position ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-400"
                      }`}
                      aria-hidden
                    >
                      {position ?? "–"}
                    </span>
                    <label className="flex flex-1 cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isOn(l)}
                        disabled={isOn(l) && enabledCount === 1}
                        onChange={() => toggleLanguage(i)}
                        className="h-4 w-4 accent-rose-600"
                      />
                      <span className="flex flex-col leading-tight">
                        <span className="font-medium text-slate-800">
                          {info.label}{" "}
                          {info.nativeLabel !== info.label && (
                            <span className="text-slate-500">· {info.nativeLabel}</span>
                          )}
                        </span>
                        <span className="text-xs text-slate-500">{callText(SAMPLE_NUMBER, l.code)}</span>
                        {!hasVoice && (
                          <span className="text-xs text-amber-700">
                            No {info.label} voice on this device — shown on screen only.
                          </span>
                        )}
                      </span>
                    </label>
                    {availableCount > 1 && (
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          aria-label={`Move ${info.label} up`}
                          className="rounded px-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === settings.languages.length - 1}
                          aria-label={`Move ${info.label} down`}
                          className="rounded px-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
            {/* Test voice button — hidden for now.
            <button
              type="button"
              onClick={() => speakCall(SAMPLE_NUMBER, activeLanguages(settings))}
              className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
            >
              ▶ Test voice ({SAMPLE_NUMBER})
            </button>
            */}
          </section>

          <section>
            <h3 className="font-semibold text-slate-900">Auto-call</h3>
            <p className="mb-3 text-sm text-slate-500">
              {settings.drawMode === "manual"
                ? "Only in Random mode — in Manual mode you call each number yourself."
                : "Draw the next number automatically. Starts after you draw the first number."}
            </p>
            <div className="flex flex-wrap gap-2">
              {[null, ...AUTO_INTERVALS].map((s) => {
                const selected = settings.autoSeconds === s;
                return (
                  <button
                    key={s ?? "off"}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange({ ...settings, autoSeconds: s })}
                    disabled={settings.drawMode === "manual"}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      selected
                        ? "border-rose-600 bg-rose-600 font-semibold text-white"
                        : "border-slate-300 text-slate-700 hover:border-slate-400"
                    } disabled:opacity-40`}
                  >
                    {s === null ? "Off" : `${s}s`}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-slate-900 py-2.5 font-semibold text-white hover:bg-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
}
