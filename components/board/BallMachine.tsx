import type { CSSProperties } from "react";

/** Fixed layout so rendering stays pure: number, colour, orbit radius (% of drum), speed, delay. */
const BALLS: { n: number; color: string; r: number; s: number; d: number; rev?: boolean }[] = [
  { n: 36, color: "#f59e0b", r: 8, s: 0.9, d: 0 },
  { n: 5, color: "#e11d48", r: 22, s: 0.7, d: -0.2, rev: true },
  { n: 73, color: "#0ea5e9", r: 30, s: 1.1, d: -0.5 },
  { n: 12, color: "#10b981", r: 16, s: 0.6, d: -0.1 },
  { n: 88, color: "#8b5cf6", r: 34, s: 1.3, d: -0.8, rev: true },
  { n: 41, color: "#f97316", r: 26, s: 0.8, d: -0.35 },
  { n: 67, color: "#e11d48", r: 12, s: 1.0, d: -0.6, rev: true },
  { n: 29, color: "#0ea5e9", r: 33, s: 0.75, d: -0.15 },
  { n: 54, color: "#f59e0b", r: 20, s: 1.2, d: -0.9, rev: true },
  { n: 90, color: "#10b981", r: 28, s: 0.65, d: -0.45 },
  { n: 3, color: "#8b5cf6", r: 18, s: 0.95, d: -0.7 },
  { n: 77, color: "#f97316", r: 35, s: 1.05, d: -0.25, rev: true },
];

type Props = {
  /** Size classes matching the big number circle. */
  className: string;
  tv?: boolean;
};

/** Glass drum with tumbling balls, shown while a random number is being drawn. */
export default function BallMachine({ className, tv = false }: Props) {
  return (
    <div role="img" aria-label="Drawing a number" className={`drum-shake relative ${className}`}>
      <div
        className={`absolute inset-0 overflow-hidden rounded-full border-4 shadow-xl ${
          tv ? "border-slate-600" : "border-slate-300"
        }`}
        style={{
          background: tv
            ? "radial-gradient(circle at 35% 30%, rgba(148,163,184,0.35), rgba(30,41,59,0.85) 60%, rgba(15,23,42,0.95))"
            : "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(226,232,240,0.7) 50%, rgba(148,163,184,0.55))",
        }}
      >
        {/* Drum spokes turning behind the balls */}
        <div className="drum-spokes absolute inset-[6%] rounded-full border-2 border-dashed border-slate-400/40" />

        {BALLS.map((b) => (
          <div
            key={b.n}
            className="drum-orbit absolute inset-0"
            style={{
              animationDuration: `${b.s}s`,
              animationDelay: `${b.d}s`,
              animationDirection: b.rev ? "reverse" : "normal",
            }}
          >
            <span
              className="drum-ball absolute flex aspect-square w-[17%] items-center justify-center rounded-full font-extrabold text-slate-900"
              style={
                {
                  left: "50%",
                  top: `${50 - b.r}%`,
                  transform: "translate(-50%, -50%)",
                  background: `radial-gradient(circle at 32% 28%, #ffffffcc 0 12%, ${b.color} 13% 100%)`,
                  boxShadow: "inset -3px -4px 8px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.2)",
                  animationDuration: `${b.s * 0.6}s`,
                  animationDelay: `${b.d}s`,
                } as CSSProperties
              }
            >
              <span className="flex h-[58%] w-[58%] items-center justify-center rounded-full bg-white text-[0.55em] leading-none tabular-nums">
                {b.n}
              </span>
            </span>
          </div>
        ))}

        {/* Glass shine */}
        <div className="pointer-events-none absolute top-[8%] left-[14%] h-[28%] w-[40%] rotate-[-25deg] rounded-full bg-white/50 blur-md" />
      </div>
    </div>
  );
}
