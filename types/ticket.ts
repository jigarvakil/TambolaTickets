/** One cell of a ticket: a number, or null for a blank. */
export type Cell = number | null;

/** A single ticket: 3 rows × 9 columns, 15 numbers, 5 per row. */
export type Ticket = Cell[][];

/** A strip: 6 tickets that together use every number 1–90 exactly once. */
export type Strip = Ticket[];

/** Colors and background applied to tickets on screen and in the PDF. */
export type Theme = {
  id: string;
  name: string;
  /** Heading shown top-left on every ticket; defaults to DEFAULT_TICKET_TITLE. */
  title?: string;
  /** Ticket background color. */
  background: string;
  /** Grid lines and outer border. */
  border: string;
  /** Number text. */
  text: string;
  /** Fill for blank cells. */
  blank: string;
  /** Header strip (title + serial) color. */
  accent: string;
  /** Optional background image (data URL or path), shown behind the grid. */
  image?: string;
  /** Opacity of the background image, 0–1. */
  imageOpacity: number;
  /** Optional large text stamped across each ticket, e.g. "ROUND 1". */
  watermarkText?: string;
  /** Opacity of the watermark text, 0–1. */
  watermarkOpacity: number;
};

/** Ticket heading used when the user hasn't set their own. */
export const DEFAULT_TICKET_TITLE = "Tambola";
