/**
 * Sound effects synthesised with the Web Audio API — no audio files.
 * Browsers only allow audio after a user gesture, so the context is created
 * lazily on the first call (normally from a Draw click or key press).
 */

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** One second of white noise, reused for every click. */
function noiseBuffer(ac: AudioContext): AudioBuffer {
  if (!noise) {
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

/** A single short plastic "clack" at time `at`. */
function clack(ac: AudioContext, at: number, volume: number) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac);
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800 + Math.random() * 2200;
  filter.Q.value = 6;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(volume, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.035);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(at, Math.random() * 0.9, 0.04);
}

/** Balls tumbling in the drum for `durationMs`. */
export function playRattle(durationMs: number): void {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + 0.02;
  const end = start + durationMs / 1000;
  for (let t = start; t < end; t += 0.025 + Math.random() * 0.05) {
    // Swell in, settle out.
    const progress = (t - start) / (end - start);
    const envelope = Math.sin(Math.PI * Math.min(1, progress * 1.15));
    clack(ac, t, 0.05 + 0.25 * envelope * Math.random());
  }
}

/** Bright "pop" as a ball comes out. */
export function playPop(): void {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.01;
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(1250, t + 0.09);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.35, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.3);
  clack(ac, t, 0.3);
}
