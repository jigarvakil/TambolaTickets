"use client";

import { useEffect, useRef, useState } from "react";
import type { TrackedPrize } from "@/lib/prizeTracker";
import { createRecapImage } from "@/lib/recapImage";

type Props = {
  open: boolean;
  drawn: number[];
  prizes: TrackedPrize[];
  onClose: () => void;
};

const FILENAME = "tambola-game-recap.png";

export default function RecapDialog({ open, drawn, prizes, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Build a fresh image each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    let url: string | undefined;
    let cancelled = false;
    createRecapImage(drawn, prizes)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImage({ blob, url });
        setError(null);
      })
      .catch(() => !cancelled && setError("Couldn't create the recap image."));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
      setImage(null);
    };
  }, [open, drawn, prizes]);

  const file = image ? new File([image.blob], FILENAME, { type: "image/png" }) : null;
  const canShare =
    typeof navigator !== "undefined" && file !== null && Boolean(navigator.canShare?.({ files: [file] }));

  async function share() {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: "Tambola game recap" });
    } catch {
      // Cancelled or unsupported — nothing to do.
    }
  }

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
      aria-labelledby="recap-title"
      className="confirm-dialog m-auto max-h-[94dvh] w-[min(94vw,26rem)] overflow-y-auto rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 id="recap-title" className="text-lg font-bold text-slate-900">
            Game recap
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>
        <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt="Game recap: called numbers and prize winners" className="h-full w-full object-contain" />
          ) : (
            <p className="text-sm text-slate-500">{error ?? "Creating image…"}</p>
          )}
        </div>
        <div className="flex gap-3">
          {canShare && (
            <button
              type="button"
              onClick={share}
              className="flex-1 rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700"
            >
              Share
            </button>
          )}
          <a
            href={image?.url}
            download={FILENAME}
            aria-disabled={!image}
            className={`flex-1 rounded-lg py-2.5 text-center font-semibold ${
              canShare
                ? "border border-slate-300 text-slate-700 hover:border-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-700"
            } ${image ? "" : "pointer-events-none opacity-50"}`}
          >
            Download
          </a>
        </div>
      </div>
    </dialog>
  );
}
