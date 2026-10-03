"use client";

import { useEffect, useMemo, useState } from "react";
import TourButton from "@/components/tour/TourButton";
import { useTour, type TourStep } from "@/components/tour/useTour";
import { defaultTheme } from "@/data/themes";
import { downloadTicketsPdf } from "@/lib/pdfExport";
import { TICKETS_PER_STRIP } from "@/lib/ticketGenerator";
import { generateSet, isValidSetCode, newSetCode } from "@/lib/ticketSet";
import type { Theme } from "@/types/ticket";
import StripView from "./StripView";
import ThemePicker from "./ThemePicker";

/** Strip counts offered; 20 strips = 120 tickets = 10 A4 pages. */
const STRIP_OPTIONS = [1, 2, 4, 6, 10, 20];

const HOME_TOUR: TourStep[] = [
  {
    title: "Welcome to Tambola Tickets 🎉",
    description:
      "Make printable tickets, then run your game on our calling board. Let's take a 30-second look around.",
  },
  {
    element: '[data-tour="nav"]',
    title: "Everything in one place",
    description: "Tickets, the number calling board, and the rules, prizes and history of the game.",
    side: "bottom",
  },
  {
    element: '[data-tour="nav-number-board"]',
    title: "Number calling board",
    description:
      "When it's game time, open the board to draw numbers with voice calls.",
    side: "bottom",
  },
  {
    element: '[data-tour="ticket-count"]',
    title: "How many tickets?",
    description: "Pick a number. Tickets come in strips of 6 that share all 90 numbers between them.",
    side: "bottom",
  },
  {
    element: '[data-tour="generate"]',
    title: "Generate",
    description: "Makes a brand new set every time you press it — as often as you like.",
    side: "bottom",
  },
  {
    element: '[data-tour="download"]',
    title: "Download the PDF",
    description: "12 tickets per A4 page, numbered and ready to print or share.",
    side: "bottom",
  },
  {
    element: '[data-tour="design"]',
    title: "Make them yours",
    description: "Pick a theme or your own colors, add a photo, or stamp a watermark like ROUND 1.",
    side: "top",
  },
  {
    element: '[data-tour="tickets"]',
    title: "Live preview",
    description: "This is exactly what goes into the PDF. Changes show up here instantly.",
    side: "top",
  },
  {
    element: '[data-tour="help"]',
    title: "Need this again?",
    description: "Press ? any time to replay this tour.",
    side: "left",
  },
];

type TicketSet = { code: string; strips: number };

const SET_STORAGE_KEY = "tambola.ticketSet";

/** Last generated set, so a refresh shows (and re-downloads) the same tickets. */
function loadSet(): TicketSet | null {
  try {
    const saved = JSON.parse(localStorage.getItem(SET_STORAGE_KEY) ?? "null") as TicketSet | null;
    if (saved && isValidSetCode(saved.code) && STRIP_OPTIONS.includes(saved.strips)) return saved;
  } catch {
    // Missing or unreadable — start a fresh set.
  }
  return null;
}

function saveSet(set: TicketSet) {
  try {
    localStorage.setItem(SET_STORAGE_KEY, JSON.stringify(set));
  } catch {
    // Storage unavailable; the set just won't survive a refresh.
  }
}

export default function TicketGenerator() {
  const [stripCount, setStripCount] = useState(2);
  // Chosen on the client only (random code / saved set), so server and client HTML match.
  const [set, setSet] = useState<TicketSet | null>(null);
  const strips = useMemo(() => (set ? generateSet(set.code, set.strips) : []), [set]);
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTour = useTour("home", HOME_TOUR);

  useEffect(() => {
    const saved = loadSet();
    const initial = saved ?? { code: newSetCode(), strips: 2 };
    if (!saved) saveSet(initial);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSet(initial);
    setStripCount(initial.strips);
  }, []);

  function generate() {
    const next = { code: newSetCode(), strips: stripCount };
    saveSet(next);
    setSet(next);
  }

  async function handleDownload() {
    setExporting(true);
    setError(null);
    try {
      if (set) await downloadTicketsPdf(strips, theme, set.code);
    } catch (err) {
      console.error(err);
      setError("Could not create the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  const ticketCount = strips.length * TICKETS_PER_STRIP;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <div className="flex flex-wrap items-end gap-3">
          <label
            data-tour="ticket-count"
            className="flex flex-col gap-1 text-sm font-medium text-slate-700"
          >
            How many tickets?
            <select
              value={stripCount}
              onChange={(e) => setStripCount(Number(e.target.value))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            >
              {STRIP_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n * TICKETS_PER_STRIP} tickets ({n} strip{n > 1 ? "s" : ""})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={generate}
            data-tour="generate"
            className="rounded-md bg-rose-600 px-5 py-2 font-semibold text-white hover:bg-rose-700"
          >
            Generate Tickets
          </button>
          <button
            type="button"
            onClick={handleDownload}
            data-tour="download"
            disabled={exporting || strips.length === 0}
            className="rounded-md bg-slate-900 px-5 py-2 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {exporting ? "Preparing PDF…" : `Download PDF (${ticketCount})`}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={strips.length === 0}
            className="rounded-md border border-slate-300 px-5 py-2 font-semibold text-slate-700 hover:border-slate-400 disabled:opacity-50"
          >
            Print
          </button>
          <div className="ml-auto">
            <TourButton onClick={startTour} />
          </div>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {set && (
          <p data-tour="set-code" className="text-sm text-slate-600">
            Set code{" "}
            <span className="rounded-md bg-amber-100 px-2 py-0.5 font-mono font-bold tracking-wider text-amber-900">
              {set.code}
            </span>{" "}
            — printed on every ticket (e.g. {set.code}-1). Use it on the number board to check claims.
          </p>
        )}

        <details data-tour="design" className="group border-t border-slate-200 pt-4" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">
            Ticket design
          </summary>
          <div className="mt-4">
            <ThemePicker theme={theme} onChange={setTheme} />
          </div>
        </details>
      </div>

      {strips.map((strip, i) => (
        <div
          key={i}
          data-tour={i === 0 ? "tickets" : undefined}
          className="strip-block flex flex-col gap-2"
        >
          {strips.length > 1 && (
            <h3 className="text-sm font-semibold text-slate-500 print:hidden">
              Strip {i + 1}
            </h3>
          )}
          <StripView
            strip={strip}
            theme={theme}
            code={set!.code}
            firstSerial={i * TICKETS_PER_STRIP + 1}
          />
        </div>
      ))}
    </section>
  );
}
