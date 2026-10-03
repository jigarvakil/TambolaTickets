"use client";

import "driver.js/dist/driver.css";
import { useCallback, useEffect } from "react";
import { SPLASH_MS } from "@/components/SplashScreen";

export type TourStep = {
  /** CSS selector to highlight; omit for a centred intro card. */
  element?: string;
  title: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
};

const seenKey = (id: string) => `tambola.tour.${id}.seen`;

function hasSeen(id: string): boolean {
  try {
    return localStorage.getItem(seenKey(id)) === "1";
  } catch {
    // No storage: don't nag on every visit.
    return true;
  }
}

function markSeen(id: string): void {
  try {
    localStorage.setItem(seenKey(id), "1");
  } catch {
    // Ignore — the tour just may show again next time.
  }
}

/**
 * Guided tour for a page. Starts automatically on the first visit and
 * returns `start` so a help button can replay it.
 */
export function useTour(id: string, steps: TourStep[], autoStartDelay = SPLASH_MS + 600): () => void {
  const start = useCallback(async () => {
    const { driver } = await import("driver.js");
    const tour = driver({
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Got it",
      popoverClass: "tambola-tour",
      stagePadding: 6,
      stageRadius: 10,
      smoothScroll: true,
      onDestroyed: () => markSeen(id),
      steps: steps.map((step) => ({
        // Skip the highlight when the target isn't on the page (e.g. hidden on mobile).
        element: step.element && document.querySelector(step.element) ? step.element : undefined,
        popover: {
          title: step.title,
          description: step.description,
          side: step.side,
          align: "center",
        },
      })),
    });
    tour.drive();
  }, [id, steps]);

  useEffect(() => {
    if (hasSeen(id)) return;
    const timer = setTimeout(start, autoStartDelay);
    return () => clearTimeout(timer);
  }, [id, start, autoStartDelay]);

  return start;
}
