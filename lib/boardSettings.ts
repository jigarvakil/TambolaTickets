import { LANGUAGES, type CallLanguage } from "./numberCall";

/** "random": the site draws numbers. "manual": the host calls numbers from a physical set. */
export type DrawMode = "random" | "manual";

export type BoardSettings = {
  /** How numbers are drawn. */
  drawMode: DrawMode;
  /** Speak each call aloud. */
  voice: boolean;
  /** Random mode: show the tumbling ball machine before each number. */
  machine: boolean;
  /** Rattle and pop sound effects. */
  sounds: boolean;
  /** All languages in call order; `enabled` marks which are used. */
  languages: { code: CallLanguage; enabled: boolean }[];
  /** Seconds between automatic draws, or null when off. */
  autoSeconds: number | null;
};

export const AUTO_INTERVALS = [5, 8, 12, 20, 30];

export const defaultBoardSettings: BoardSettings = {
  drawMode: "random",
  voice: true,
  machine: true,
  sounds: true,
  languages: [
    { code: "en", enabled: true },
    { code: "hi", enabled: false },
    { code: "gu", enabled: false },
  ],
  autoSeconds: null,
};

const STORAGE_KEY = "tambola.boardSettings";
const ALL_CODES: CallLanguage[] = ["en", "hi", "gu"];

/** Enabled, available languages in call order (never empty). */
export function activeLanguages(settings: BoardSettings): CallLanguage[] {
  const active = settings.languages
    .filter((l) => l.enabled && LANGUAGES[l.code].available)
    .map((l) => l.code);
  return active.length > 0 ? active : ["en"];
}

/** Read saved settings, falling back to defaults for anything missing or invalid. */
export function loadBoardSettings(): BoardSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultBoardSettings;
    const saved = JSON.parse(raw) as Partial<BoardSettings>;

    // Keep saved order, drop unknown codes, append any languages added since.
    const seen = new Set<CallLanguage>();
    const languages: BoardSettings["languages"] = [];
    for (const l of saved.languages ?? []) {
      if (ALL_CODES.includes(l.code) && !seen.has(l.code)) {
        seen.add(l.code);
        languages.push({ code: l.code, enabled: Boolean(l.enabled) });
      }
    }
    for (const code of ALL_CODES) {
      if (!seen.has(code)) languages.push({ code, enabled: false });
    }

    return {
      drawMode: saved.drawMode === "manual" ? "manual" : "random",
      voice: typeof saved.voice === "boolean" ? saved.voice : defaultBoardSettings.voice,
      machine: typeof saved.machine === "boolean" ? saved.machine : defaultBoardSettings.machine,
      sounds: typeof saved.sounds === "boolean" ? saved.sounds : defaultBoardSettings.sounds,
      languages,
      autoSeconds: AUTO_INTERVALS.includes(saved.autoSeconds as number)
        ? (saved.autoSeconds as number)
        : null,
    };
  } catch {
    return defaultBoardSettings;
  }
}

export function saveBoardSettings(settings: BoardSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable (private mode etc.) — settings just won't persist.
  }
}
