"use client";

import Image from "next/image";
import { useState } from "react";

/** How long the splash stays up on each full page load (ms). Keep in sync with globals.css. */
export const SPLASH_MS = 2000;

/**
 * Full-screen logo splash shown on every full page load (refresh or first
 * visit). It lives in the root layout, so client-side navigation doesn't
 * show it again. Timing is pure CSS, so it hides even if JS is slow.
 */
export default function SplashScreen() {
  const [done, setDone] = useState(false);
  if (done) return null;

  return (
    <div
      role="status"
      aria-label="Loading Tambola Tickets"
      className="splash fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-[radial-gradient(circle_at_50%_40%,#fff7ed_0%,#ffffff_55%,#f8fafc_100%)] print:hidden"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && e.animationName === "splash-out") setDone(true);
      }}
    >
      <Image
        src="/logo.png"
        alt=""
        width={1200}
        height={400}
        priority
        className="splash-logo h-auto w-[min(78vw,420px)] drop-shadow-xl"
      />
      <div className="h-2 w-[min(60vw,260px)] overflow-hidden rounded-full bg-slate-200">
        <div className="splash-bar h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-sky-500" />
      </div>
      <p className="text-sm font-medium tracking-wide text-slate-500">Shuffling the numbers…</p>
    </div>
  );
}
