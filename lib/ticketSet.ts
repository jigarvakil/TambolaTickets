import type { Strip, Ticket } from "@/types/ticket";
import { generateStrip, TICKETS_PER_STRIP, type Rng } from "./ticketGenerator.ts";

/**
 * Seeded ticket sets.
 *
 * A set code (e.g. "7Q2K5") fixes every ticket in a set: the same code always
 * rebuilds the same tickets on any device, so the board can check a printed
 * ticket from just its ID ("7Q2K5-37") — no server needed.
 *
 * FROZEN (v1): changing the PRNG, the seed derivation, or the generator's use
 * of random numbers changes what old codes produce and breaks printed tickets.
 * tests/ticketSet.test.ts pins known outputs to catch that.
 */

/** No 0/O, 1/I/L — easy to read off paper and type back in. */
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const CODE_LENGTH = 5;

/** cyrb53-style 32-bit string hash. */
function hashString(str: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 ^ h2) >>> 0;
}

/** mulberry32: small, fast seeded PRNG returning numbers in [0, 1). */
function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random new set code. */
export function newSetCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function isValidSetCode(code: string): boolean {
  return code.length === CODE_LENGTH && [...code].every((c) => CODE_ALPHABET.includes(c));
}

/** Strip `index` (0-based) of a set. Each strip has its own seed. */
export function setStrip(code: string, index: number): Strip {
  return generateStrip(mulberry32(hashString(`v1:${code}:${index}`)));
}

/** First `count` strips of a set. */
export function generateSet(code: string, count: number): Strip[] {
  return Array.from({ length: count }, (_, i) => setStrip(code, i));
}

/** Ticket number `n` (1-based, as printed) of a set. */
export function setTicket(code: string, n: number): Ticket {
  const strip = setStrip(code, Math.floor((n - 1) / TICKETS_PER_STRIP));
  return strip[(n - 1) % TICKETS_PER_STRIP];
}

/** Printed ticket ID, e.g. "7Q2K5-37". */
export function ticketId(code: string, n: number): string {
  return `${code}-${n}`;
}

/** Largest ticket number the checker accepts (the generator offers up to 120). */
export const MAX_TICKET_NUMBER = 600;

export type ParsedTicketId = { code: string; number: number };

/**
 * Read a ticket ID as typed by a host. Case, spaces, separators and leading
 * zeros are forgiven: "7q2k5 37", "7Q2K5#37" and "7Q2K5-037" all work.
 */
export function parseTicketId(input: string): ParsedTicketId | null {
  const cleaned = input.toUpperCase().replace(/[^0-9A-Z]/g, " ").trim();
  const match = cleaned.match(/^([0-9A-Z]{5})\s*0*(\d{1,3})$/);
  if (!match) return null;
  const code = match[1];
  const number = Number(match[2]);
  if (!isValidSetCode(code) || number < 1 || number > MAX_TICKET_NUMBER) return null;
  return { code, number };
}
