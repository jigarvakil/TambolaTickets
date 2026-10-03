"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TourButton from "@/components/tour/TourButton";
import { useTour, type TourStep } from "@/components/tour/useTour";
import {
  activeLanguages,
  defaultBoardSettings,
  loadBoardSettings,
  saveBoardSettings,
  type BoardSettings,
  type DrawMode,
} from "@/lib/boardSettings";
import {
  boardReducer,
  initialBoardState,
  loadSavedGame,
  saveGame,
  TOTAL_NUMBERS,
} from "@/lib/numberBoard";
import { callText, LANGUAGES } from "@/lib/numberCall";
import {
  clearWinners,
  defaultTrackedPrizes,
  loadTrackedPrizes,
  saveTrackedPrizes,
  type TrackedPrize,
} from "@/lib/prizeTracker";
import { playPop, playRattle } from "@/lib/sfx";
import { speakCall, stopSpeaking } from "@/lib/speech";
import BoardSettingsDrawer from "./BoardSettingsDrawer";
import DrawButton from "./DrawButton";
import DrawnHistory from "./DrawnHistory";
import ManualEntry from "./ManualEntry";
import BallMachine from "./BallMachine";
import NumberBoard from "./NumberBoard";
import PrizeTracker from "./PrizeTracker";
import RecapDialog from "./RecapDialog";
import TicketCheckDialog from "./TicketCheckDialog";

/** How long a new number stays big before flying to the board (ms). */
const HOLD_MS = 1200;
/** Duration of the flight from the big display to its board cell (ms). */
const FLY_MS = 800;
/** How long the ball machine tumbles before a random number comes out (ms). */
const SPIN_MS = 1400;

const BOARD_TOUR: TourStep[] = [
  {
    title: "Your calling board",
    description: "Run the whole game from here. Here's a quick look around — it takes 20 seconds.",
  },
  {
    element: '[data-tour="draw-mode"]',
    title: "Random or manual",
    description:
      "Random lets the site draw numbers. Using a physical ball set? Switch to Manual and call each ball you pull — the board shows it big for everyone.",
    side: "bottom",
  },
  {
    element: '[data-tour="draw"]',
    title: "Call a number",
    description:
      "Random: press Draw Number. Manual: type the number and press Enter, or tap it on the board. Each number is called only once per game.",
    side: "top",
  },
  {
    element: '[data-tour="big-number"]',
    title: "The current call",
    description:
      "The called number shows big here with how to read it out.",
    side: "right",
  },
  {
    element: '[data-tour="board"]',
    title: "The 1–90 board",
    description:
      "After a moment the number flies onto the board so everyone can check what's been called.",
    side: "left",
  },
  {
    element: '[data-tour="history"]',
    title: "Called numbers",
    description: "Every number in the order it was called, newest first — handy for checking claims.",
    side: "top",
  },
  {
    element: '[data-tour="check-ticket"]',
    title: "Check a claim",
    description:
      "Someone shouts Housie? Type the ID printed on their ticket (like 7Q2K5-37) to see instantly which prizes it has won.",
    side: "top",
  },
  {
    element: '[data-tour="prizes"]',
    title: "Prize list",
    description:
      "Pick this game's prizes with Edit prizes, then record winners — straight from Check Ticket or by hand.",
    side: "left",
  },
  {
    element: '[data-tour="undo"]',
    title: "Oops, wrong draw?",
    description: "Undo takes the last number off the board. Keyboard fans: Space draws, Z undoes, C checks a ticket.",
    side: "top",
  },
  {
    element: '[data-tour="tv-mode"]',
    title: "TV mode",
    description: "Put the board on a TV or projector: full screen, giant numbers, dark background. Press F or Esc to toggle.",
    side: "bottom",
  },
  {
    element: '[data-tour="recap"]',
    title: "Share the recap",
    description: "After the game, share a picture of the board and winners straight to WhatsApp.",
    side: "bottom",
  },
  {
    element: '[data-tour="settings"]',
    title: "Settings",
    description:
      "Turn voice calls on or off and set auto-call. More calling languages are coming soon.",
    side: "bottom",
  },
  {
    element: '[data-tour="new-game"]',
    title: "Start over",
    description: "Clears the board for a fresh game. We'll ask before wiping anything.",
    side: "top",
  },
  {
    element: '[data-tour="help"]',
    title: "Need this again?",
    description: "Press ? any time to replay this tour.",
    side: "bottom",
  },
];

/**
 * Animate a copy of the big number from `from` into `to`, then call `done`.
 * Returns a cleanup that cancels the flight.
 */
function flyNumber(n: number, from: HTMLElement, to: HTMLElement, done: () => void): () => void {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const bigFont = parseFloat(getComputedStyle(from).fontSize);
  const smallFont = parseFloat(getComputedStyle(to).fontSize);

  const el = document.createElement("div");
  el.textContent = String(n);
  el.setAttribute("aria-hidden", "true");
  el.className =
    "pointer-events-none fixed z-[70] flex items-center justify-center bg-rose-600 font-extrabold text-white tabular-nums shadow-2xl";
  Object.assign(el.style, {
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    borderRadius: "50%",
    fontSize: `${bigFont}px`,
  });
  document.body.appendChild(el);

  const animation = el.animate(
    [
      { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, borderRadius: "50%", fontSize: `${bigFont}px` },
      { left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px`, borderRadius: "6px", fontSize: `${smallFont}px` },
    ],
    { duration: FLY_MS, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "forwards" },
  );
  animation.onfinish = () => {
    el.remove();
    done();
  };
  return () => {
    animation.cancel();
    el.remove();
  };
}

/** True when keys typed here belong to a form field. */
function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** True for buttons and links, where Enter should keep its normal meaning. */
function isControl(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && ["BUTTON", "A"].includes(target.tagName);
}

const ICON_BUTTON =
  "flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm hover:border-rose-400 hover:text-rose-600";

export default function BoardGame() {
  const [state, dispatch] = useReducer(boardReducer, initialBoardState);
  const [settings, setSettings] = useState<BoardSettings>(defaultBoardSettings);
  const [prizes, setPrizes] = useState<TrackedPrize[]>(defaultTrackedPrizes);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [confirmingUndo, setConfirmingUndo] = useState(false);
  const [checking, setChecking] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);
  const [tv, setTv] = useState(false);
  /** False until the saved game (if any) has been restored. */
  const [ready, setReady] = useState(false);
  /** How many drawn numbers have finished flying onto the board. */
  const [landed, setLanded] = useState(0);
  /** Manual mode: number being typed, and why the last attempt was rejected. */
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const bigRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const startTour = useTour("board", BOARD_TOUR);
  /** How many calls have already been announced (so restores stay silent). */
  const announced = useRef(0);

  // Saved settings live in this browser only; load them after hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadBoardSettings());
  }, []);

  // Bring back the game in progress after a refresh — without replaying the
  // animation or speech for numbers already called.
  useEffect(() => {
    const saved = loadSavedGame();
    if (saved.length > 0) {
      announced.current = saved.length;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanded(saved.length);
      dispatch({ type: "restore", drawn: saved });
    }
    setPrizes(loadTrackedPrizes());
    setReady(true);
  }, []);

  function updateSettings(next: BoardSettings) {
    setSettings(next);
    saveBoardSettings(next);
  }

  function updatePrizes(next: TrackedPrize[]) {
    setPrizes(next);
    saveTrackedPrizes(next);
  }

  const { drawn } = state;
  const last = drawn[drawn.length - 1];
  const finished = drawn.length === TOTAL_NUMBERS;
  const animating = drawn.length > landed;
  const languages = activeLanguages(settings);
  const manual = settings.drawMode === "manual";

  // Announce each new number as soon as it is drawn.
  useEffect(() => {
    if (drawn.length > announced.current && settings.voice && last !== undefined) {
      speakCall(last, languages);
    }
    announced.current = drawn.length;
    // Only react to new draws, not to settings edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawn.length]);

  // Save after every call so a refresh doesn't lose the game.
  useEffect(() => {
    if (ready) saveGame(drawn);
  }, [drawn, ready]);

  // Hold the new number big, then fly it to its cell on the board.
  useEffect(() => {
    if (!animating || last === undefined) return;
    const target = drawn.length;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelFlight: (() => void) | undefined;

    const timer = setTimeout(
      () => {
        const from = bigRef.current;
        const to = boardRef.current?.querySelector<HTMLElement>(`[data-n="${last}"]`);
        if (reduceMotion || !from || !to) {
          setLanded(target);
          return;
        }
        cancelFlight = flyNumber(last, from, to, () => setLanded(target));
      },
      reduceMotion ? 0 : HOLD_MS,
    );

    return () => {
      clearTimeout(timer);
      cancelFlight?.();
    };
  }, [animating, drawn.length, last]);

  // --- Drawing (random mode) ---
  const [spinning, setSpinning] = useState(false);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelSpin() {
    if (spinTimer.current) clearTimeout(spinTimer.current);
    spinTimer.current = null;
    setSpinning(false);
  }

  useEffect(() => () => {
    if (spinTimer.current) clearTimeout(spinTimer.current);
  }, []);

  /** Spin the ball machine (if on), then draw a random number with a pop. */
  function startDraw() {
    if (manual || finished || animating || spinning) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!settings.machine || reduceMotion) {
      if (settings.sounds) playPop();
      dispatch({ type: "draw" });
      return;
    }
    setSpinning(true);
    if (settings.sounds) playRattle(SPIN_MS);
    spinTimer.current = setTimeout(() => {
      spinTimer.current = null;
      setSpinning(false);
      if (settings.sounds) playPop();
      dispatch({ type: "draw" });
    }, SPIN_MS);
  }

  // Auto-call and the keyboard handler call the latest startDraw through a ref,
  // so their timers/listeners don't restart on every render.
  const startDrawRef = useRef(startDraw);
  useEffect(() => {
    startDrawRef.current = startDraw;
  });
  const draw = useCallback(() => startDrawRef.current(), []);

  /** Manual mode: call a specific number. Returns an error message, or null on success. */
  function callNumber(n: number): string | null {
    if (!Number.isInteger(n) || n < 1 || n > TOTAL_NUMBERS) return "Enter a number from 1 to 90.";
    if (drawn.includes(n)) return `${n} has already been called.`;
    if (settings.sounds) playPop();
    dispatch({ type: "call", number: n });
    return null;
  }

  function pickNumber(n: number) {
    setManualError(callNumber(n));
    setManualValue("");
  }

  function setDrawMode(drawMode: DrawMode) {
    updateSettings({ ...settings, drawMode });
    setManualError(null);
  }

  // Auto-call kicks in after the first manual draw, and pauses while any
  // dialog or the settings drawer is open.
  const autoSeconds = settings.autoSeconds;
  const anyDialogOpen = confirmingReset || confirmingUndo || settingsOpen || checking || recapOpen;
  const autoActive = !manual && autoSeconds !== null && drawn.length > 0 && !finished && !anyDialogOpen;
  useEffect(() => {
    if (!autoActive || autoSeconds === null) return;
    const id = setInterval(draw, autoSeconds * 1000);
    return () => clearInterval(id);
  }, [autoActive, autoSeconds, draw]);

  function requestReset() {
    if (drawn.length === 0) return;
    setConfirmingReset(true);
  }

  function reset() {
    setConfirmingReset(false);
    cancelSpin();
    stopSpeaking();
    setLanded(0);
    announced.current = 0;
    dispatch({ type: "reset" });
    // Same prizes next game, fresh winners.
    updatePrizes(clearWinners(prizes));
  }

  function undo() {
    setConfirmingUndo(false);
    cancelSpin();
    if (drawn.length === 0) return;
    stopSpeaking();
    const remaining = drawn.length - 1;
    announced.current = remaining;
    setLanded((n) => Math.min(n, remaining));
    dispatch({ type: "undo" });
  }

  // --- TV / projector mode ---
  const enterTv = useCallback(() => {
    setTv(true);
    document.documentElement.requestFullscreen?.().catch(() => {
      // Fullscreen refused (e.g. inside an iframe) — TV layout still works.
    });
  }, []);

  const exitTv = useCallback(() => {
    setTv(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  // Leaving fullscreen with Esc (handled by the browser) also leaves TV mode.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setTv(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (isTextField(e.target)) return;
      // Leave keys alone while a dialog or the guided tour is open.
      if (document.querySelector("dialog[open]") || document.body.classList.contains("driver-active")) return;

      const key = e.key.toLowerCase();
      // Manual mode: digits typed anywhere go into the number box.
      if (manual && /^[0-9]$/.test(key)) {
        e.preventDefault();
        setManualValue((v) => (v + key).slice(0, 2));
        setManualError(null);
        manualInputRef.current?.focus();
        return;
      }
      // Space always draws — even with focus left on another button, where it
      // would otherwise re-click that button. Enter still presses buttons.
      if (key === " " || (key === "enter" && !isControl(e.target))) {
        e.preventDefault();
        if (!manual) draw();
      } else if (key === "z") {
        if (drawn.length > 0) setConfirmingUndo(true);
      } else if (key === "c") {
        setChecking(true);
      } else if (key === "f") {
        if (tv) exitTv();
        else enterTv();
      } else if (key === "escape" && tv) {
        exitTv();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draw, drawn.length, enterTv, exitTv, manual, tv]);

  const onBoard = drawn.slice(0, landed);
  const recent = [...onBoard].reverse().slice(0, 10);

  const bigSize = tv
    ? "h-[min(52vh,38vw)] w-[min(52vh,38vw)]"
    : "h-56 w-56 md:h-80 md:w-80";

  const bigNumber = spinning ? (
    <BallMachine className={bigSize} tv={tv} />
  ) : last !== undefined ? (
      <div
        key={drawn.length}
        ref={bigRef}
        className={`call-pop flex items-center justify-center rounded-full bg-rose-600 leading-none font-extrabold text-white shadow-xl tabular-nums ${
          tv
            ? "h-[min(52vh,38vw)] w-[min(52vh,38vw)] text-[min(30vh,22vw)] shadow-rose-900/40"
            : "h-56 w-56 text-[8rem] md:h-80 md:w-80 md:text-[11rem]"
        }`}
      >
        {last}
      </div>
    ) : (
      <div
        className={`flex items-center justify-center rounded-full border-4 border-dashed font-extrabold ${
          tv
            ? "h-[min(52vh,38vw)] w-[min(52vh,38vw)] border-slate-700 text-8xl text-slate-700"
            : "h-56 w-56 border-slate-300 text-6xl text-slate-300 md:h-80 md:w-80"
        }`}
      >
        ?
      </div>
    );

  const callLines = (
    <div aria-live="polite" className="flex min-h-8 flex-col items-center gap-1 text-center">
      {spinning ? (
        <p className={tv ? "text-3xl font-bold text-slate-300" : "text-2xl font-semibold text-slate-500"}>
          Drawing…
        </p>
      ) : last !== undefined ? (
        languages.map((lang, i) => (
          <p
            key={lang}
            lang={LANGUAGES[lang].speechLang}
            className={`capitalize ${
              tv
                ? i === 0
                  ? "text-[min(5vh,3rem)] font-bold text-white"
                  : "text-2xl text-slate-400"
                : i === 0
                  ? "text-2xl font-semibold text-slate-800"
                  : "text-lg font-medium text-slate-500"
            }`}
          >
            {callText(last, lang)}
          </p>
        ))
      ) : (
        <p className={tv ? "text-3xl font-bold text-slate-400" : "text-2xl font-semibold text-slate-800"}>
          Press Draw Number to start
        </p>
      )}
    </div>
  );

  const board = (
    <NumberBoard
      ref={boardRef}
      drawn={onBoard}
      tv={tv}
      onPick={manual && !finished ? pickNumber : undefined}
      allCalled={drawn}
    />
  );

  const callControl = manual ? (
    <ManualEntry
      value={manualValue}
      onChange={setManualValue}
      onCall={callNumber}
      error={manualError}
      onError={setManualError}
      disabled={finished}
      tv={tv}
      inputRef={manualInputRef}
    />
  ) : (
    <DrawButton onDraw={draw} disabled={finished || animating || spinning} finished={finished} />
  );

  return (
    <>
      {tv ? (
        <div className="fixed inset-0 z-[60] flex flex-col gap-4 overflow-auto bg-slate-950 p-4 text-white sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-lg font-semibold text-slate-400">
              <span className="text-white">{drawn.length}</span> of {TOTAL_NUMBERS} called
            </p>
            <div role="radiogroup" aria-label="How numbers are drawn" className="flex rounded-full bg-slate-800 p-1 text-sm font-semibold">
              {(
                [
                  ["random", "🎲 Random"],
                  ["manual", "✋ Manual"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={settings.drawMode === mode}
                  onClick={() => setDrawMode(mode)}
                  className={`rounded-full px-4 py-1.5 ${
                    settings.drawMode === mode ? "bg-slate-950 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={exitTv}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
            >
              Exit TV mode <span className="text-slate-500">(Esc)</span>
            </button>
          </div>
          <div className="grid flex-1 items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div className="flex flex-col items-center gap-6">
              {bigNumber}
              {callLines}
              {recent.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2" aria-label="Recent calls">
                  {recent.slice(1).map((n) => (
                    <span
                      key={n}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-slate-300 tabular-nums"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              )}
              {callControl}
            </div>
            <div className="mx-auto w-full max-w-[calc((100dvh-7rem)*10/9)]">{board}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-slate-900">Number Calling Board</h1>
            <div className="flex items-center gap-2">
              <TourButton onClick={startTour} />
              <button
                type="button"
                onClick={enterTv}
                data-tour="tv-mode"
                aria-label="TV mode"
                title="TV / projector mode (F)"
                className={ICON_BUTTON}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path strokeLinecap="round" d="M8 20h8M12 16v4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setRecapOpen(true)}
                data-tour="recap"
                aria-label="Share game recap"
                title="Share game recap"
                className={ICON_BUTTON}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                data-tour="settings"
                aria-label="Board settings"
                title="Board settings"
                className={ICON_BUTTON}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.3 4.3c.4-1.7 3-1.7 3.4 0a1.7 1.7 0 0 0 2.6 1.1c1.5-.9 3.3.8 2.4 2.4a1.7 1.7 0 0 0 1 2.5c1.8.4 1.8 3 0 3.4a1.7 1.7 0 0 0-1 2.6c.9 1.5-.9 3.3-2.4 2.4a1.7 1.7 0 0 0-2.6 1c-.4 1.8-3 1.8-3.4 0a1.7 1.7 0 0 0-2.5-1c-1.6.9-3.3-.9-2.4-2.4a1.7 1.7 0 0 0-1.1-2.6c-1.7-.4-1.7-3 0-3.4a1.7 1.7 0 0 0 1.1-2.5c-.9-1.6.8-3.3 2.4-2.4a1.7 1.7 0 0 0 2.5-1.1Z"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-2">
            {/* Left half: the number being called. */}
            <div className="flex flex-col gap-4 md:sticky md:top-24">
              <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div
                  data-tour="draw-mode"
                  role="radiogroup"
                  aria-label="How numbers are drawn"
                  className="flex rounded-full bg-slate-100 p-1 text-sm font-semibold"
                >
                  {(
                    [
                      ["random", "🎲 Random draw"],
                      ["manual", "✋ Manual (physical balls)"],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      role="radio"
                      aria-checked={settings.drawMode === mode}
                      onClick={() => setDrawMode(mode)}
                      className={`rounded-full px-4 py-1.5 transition-colors ${
                        settings.drawMode === mode
                          ? "bg-white text-rose-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div data-tour="big-number" className="flex min-h-64 items-center justify-center md:min-h-80">
                  {bigNumber}
                </div>
                {callLines}
                <p className="text-sm text-slate-500">
                  {drawn.length} of {TOTAL_NUMBERS} called
                  {!manual && autoSeconds !== null && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      Auto every {autoSeconds}s{drawn.length === 0 ? " · starts after first draw" : ""}
                    </span>
                  )}
                </p>

                <div
                  className={`flex flex-wrap justify-center gap-3 ${manual ? "items-start" : "items-center"}`}
                >
                  <div data-tour="draw">{callControl}</div>
                  <button
                    type="button"
                    onClick={() => setConfirmingUndo(true)}
                    disabled={drawn.length === 0}
                    data-tour="undo"
                    title="Undo last call (Z)"
                    className="rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:border-slate-400 disabled:opacity-40"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
                      </svg>
                      Undo
                    </span>
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChecking(true)}
                    data-tour="check-ticket"
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-5 py-2.5 font-semibold text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100"
                  >
                    Check Ticket
                  </button>
                  <button
                    type="button"
                    onClick={requestReset}
                    data-tour="new-game"
                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:border-slate-400"
                  >
                    New Game
                  </button>
                </div>
                <p className="hidden text-xs text-slate-400 md:block">
                  Keys:{" "}
                  {manual ? (
                    <>
                      <kbd className="font-semibold">0–9</kbd> + <kbd className="font-semibold">Enter</kbd> call
                    </>
                  ) : (
                    <>
                      <kbd className="font-semibold">Space</kbd> draw
                    </>
                  )}{" "}
                  · <kbd className="font-semibold">Z</kbd> undo ·{" "}
                  <kbd className="font-semibold">C</kbd> check ticket · <kbd className="font-semibold">F</kbd> TV mode
                </p>
              </div>

              <div data-tour="history" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-3 font-semibold text-slate-800">Called numbers</h2>
                <DrawnHistory drawn={onBoard} />
              </div>
            </div>

            {/* Right half: the 1–90 board and prize list. */}
            <div className="flex flex-col gap-4">
              <div data-tour="board" className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                {board}
              </div>
              <PrizeTracker prizes={prizes} drawn={drawn} onChange={updatePrizes} />
            </div>
          </div>
        </>
      )}

      <BoardSettingsDrawer
        open={settingsOpen}
        settings={settings}
        onChange={updateSettings}
        onClose={() => setSettingsOpen(false)}
      />

      <TicketCheckDialog
        open={checking}
        drawn={drawn}
        tracked={prizes}
        onAward={(id, winner) =>
          updatePrizes(prizes.map((p) => (p.id === id ? { ...p, winner } : p)))
        }
        onClose={() => setChecking(false)}
      />

      <RecapDialog open={recapOpen} drawn={drawn} prizes={prizes} onClose={() => setRecapOpen(false)} />

      <ConfirmDialog
        open={confirmingUndo}
        title={last !== undefined ? `Undo ${last}?` : "Undo last call?"}
        message={
          last !== undefined
            ? `${last} will be taken off the board and can be drawn again later.`
            : "There's nothing to undo yet."
        }
        confirmLabel="Undo call"
        cancelLabel="Keep it"
        onConfirm={undo}
        onCancel={() => setConfirmingUndo(false)}
      />

      <ConfirmDialog
        open={confirmingReset}
        title="Start a new game?"
        message={`All ${drawn.length} called number${drawn.length === 1 ? "" : "s"} will be cleared from the board, along with this game's prize winners.`}
        confirmLabel="New Game"
        cancelLabel="Keep Playing"
        onConfirm={reset}
        onCancel={() => setConfirmingReset(false)}
      />
    </>
  );
}
