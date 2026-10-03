import { createElement, type ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { Strip, Theme } from "@/types/ticket";

/**
 * Render strips to a PDF in the browser and trigger a download.
 * react-pdf is loaded on demand so it stays out of the initial bundle.
 */
export async function downloadTicketsPdf(strips: Strip[], theme: Theme, code: string): Promise<void> {
  const [{ pdf }, { default: TicketPdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/ticket/TicketPdfDocument"),
  ]);

  const doc = createElement(TicketPdfDocument, { strips, theme, code }) as unknown as ReactElement<DocumentProps>;
  const blob = await pdf(doc).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tambola-tickets-${code}-${strips.length * 6}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
