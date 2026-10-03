/** Public site URL; set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const SITE_ROUTES = ["/", "/number-board", "/rules", "/prizes", "/history"];

/** Brand text printed below every ticket. */
export const TICKET_WATERMARK = "jigarvakil.com";

/**
 * Font size for the watermark text so it fits within `width` units.
 * Approximates bold glyph width as 0.62 of the font size.
 */
export function watermarkFontSize(text: string, width: number, max: number): number {
  return Math.min(max, width / (Math.max(text.length, 1) * 0.62));
}
