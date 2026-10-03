"use client";

import type { ChangeEvent } from "react";
import { themes } from "@/data/themes";
import { DEFAULT_TICKET_TITLE, type Theme } from "@/types/ticket";

type Props = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

const ROUND_PRESETS = ["ROUND 1", "ROUND 2", "ROUND 3"];

const COLOR_FIELDS: { key: keyof Theme; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "border", label: "Border" },
  { key: "text", label: "Numbers" },
  { key: "blank", label: "Blank cells" },
  { key: "accent", label: "Header" },
];

export default function ThemePicker({ theme, onChange }: Props) {
  function selectPreset(preset: Theme) {
    // Keep the uploaded image and watermark when switching color presets.
    onChange({
      ...preset,
      image: theme.image,
      imageOpacity: theme.imageOpacity,
      watermarkText: theme.watermarkText,
      watermarkOpacity: theme.watermarkOpacity,
      title: theme.title,
    });
  }

  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      onChange({ ...theme, image: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Ticket heading</h3>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={theme.title ?? DEFAULT_TICKET_TITLE}
            onChange={(e) => onChange({ ...theme, title: e.target.value })}
            placeholder="e.g. Sharma Family Diwali"
            maxLength={28}
            className="w-64 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
          />
          {theme.title !== undefined && theme.title !== DEFAULT_TICKET_TITLE && (
            <button
              type="button"
              onClick={() => onChange({ ...theme, title: undefined })}
              className="text-sm text-rose-600 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Shown at the top-left of every ticket — try your event or family name.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Preset themes</h3>
        <div className="flex flex-wrap gap-2">
          {themes.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => selectPreset(preset)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                theme.id === preset.id
                  ? "border-rose-600 bg-rose-50 font-semibold text-rose-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full border"
                style={{
                  background: `linear-gradient(135deg, ${preset.background} 50%, ${preset.accent} 50%)`,
                  borderColor: preset.border,
                }}
              />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Custom colors</h3>
        <div className="flex flex-wrap gap-4">
          {COLOR_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="color"
                value={theme[key] as string}
                onChange={(e) =>
                  onChange({ ...theme, id: "custom", [key]: e.target.value })
                }
                className="h-8 w-10 cursor-pointer rounded border border-slate-300 bg-white"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Background image</h3>
        <div className="flex flex-wrap items-center gap-4">
          <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400">
            {theme.image ? "Change image" : "Upload image"}
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImage}
              className="hidden"
            />
          </label>
          {theme.image && (
            <>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                Opacity
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={theme.imageOpacity}
                  onChange={(e) =>
                    onChange({ ...theme, imageOpacity: Number(e.target.value) })
                  }
                />
                <span className="w-10 tabular-nums">
                  {Math.round(theme.imageOpacity * 100)}%
                </span>
              </label>
              <button
                type="button"
                onClick={() => onChange({ ...theme, image: undefined })}
                className="text-sm text-rose-600 hover:underline"
              >
                Remove
              </button>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">PNG or JPG. Shown behind every ticket.</p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Watermark text</h3>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={theme.watermarkText ?? ""}
            onChange={(e) => onChange({ ...theme, watermarkText: e.target.value || undefined })}
            placeholder="e.g. ROUND 1"
            maxLength={20}
            className="w-40 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
          />
          {ROUND_PRESETS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange({ ...theme, watermarkText: label })}
              className={`rounded-full border px-3 py-1 text-xs ${
                theme.watermarkText === label
                  ? "border-rose-600 bg-rose-50 font-semibold text-rose-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
          {theme.watermarkText && (
            <>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                Opacity
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={theme.watermarkOpacity}
                  onChange={(e) =>
                    onChange({ ...theme, watermarkOpacity: Number(e.target.value) })
                  }
                />
                <span className="w-10 tabular-nums">
                  {Math.round(theme.watermarkOpacity * 100)}%
                </span>
              </label>
              <button
                type="button"
                onClick={() => onChange({ ...theme, watermarkText: undefined })}
                className="text-sm text-rose-600 hover:underline"
              >
                Remove
              </button>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Stamped across every ticket — handy for telling rounds apart.
        </p>
      </div>
    </div>
  );
}
