import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPrizes } from "../lib/prizeCheck.ts";
import { COLUMN_RANGES } from "../lib/ticketGenerator.ts";
import {
  generateSet,
  isValidSetCode,
  newSetCode,
  parseTicketId,
  setTicket,
} from "../lib/ticketSet.ts";
import type { Ticket } from "../types/ticket.ts";

test("same code rebuilds identical tickets; different codes differ", () => {
  assert.deepEqual(generateSet("7Q2K5", 3), generateSet("7Q2K5", 3));
  assert.notDeepEqual(generateSet("7Q2K5", 1), generateSet("7Q2K6", 1));
});

test("setTicket matches the ticket at the same position in the full set", () => {
  const set = generateSet("ABCDE", 20).flat();
  for (const n of [1, 6, 7, 37, 120]) {
    assert.deepEqual(setTicket("ABCDE", n), set[n - 1]);
  }
});

test("seeded strips are still valid strips", () => {
  for (const strip of generateSet(newSetCode(), 50)) {
    const nums = strip.flatMap((t) => t.flat().filter((c): c is number => c !== null));
    assert.deepEqual(
      nums.sort((a, b) => a - b),
      Array.from({ length: 90 }, (_, i) => i + 1),
    );
    for (const t of strip) {
      for (const row of t) assert.equal(row.filter((c) => c !== null).length, 5);
      for (let c = 0; c < 9; c++) {
        const col = t.map((r) => r[c]).filter((x): x is number => x !== null);
        const [min, max] = COLUMN_RANGES[c];
        assert.ok(col.length >= 1 && col.every((n, i) => n >= min && n <= max && (i === 0 || n > col[i - 1])));
      }
    }
  }
});

// FROZEN v1 output. If this fails, printed tickets from older PDFs would no
// longer match the board's checker — don't update it, fix the regression.
test("v1 seed output is frozen", () => {
  assert.deepEqual(setTicket("ABCDE", 1), FROZEN_ABCDE_1);
  assert.deepEqual(setTicket("7Q2K5", 37), FROZEN_7Q2K5_37);
});

test("parseTicketId forgives typing", () => {
  for (const input of ["7Q2K5-37", "7q2k5 37", "7Q2K5#37", " 7Q2K5-037 ", "7Q2K537"]) {
    assert.deepEqual(parseTicketId(input), { code: "7Q2K5", number: 37 }, input);
  }
  for (const bad of ["", "7Q2K5", "7Q2K-37", "7Q2K0-37", "7Q2K5-0", "7Q2K5-9999"]) {
    assert.equal(parseTicketId(bad), null, bad);
  }
  assert.ok(isValidSetCode(newSetCode()));
});

test("checkPrizes: lines, corners, early five, completion call", () => {
  const t: Ticket = [
    [4, null, 23, null, 45, null, 61, null, 82],
    [null, 12, null, 37, null, 54, 66, null, 88],
    [9, 18, null, 39, null, 57, null, 75, null],
  ];
  const drawn = [90, 4, 23, 45, 1, 61, 82, 9, 75];
  const byId = Object.fromEntries(checkPrizes(t, drawn).map((r) => [r.id, r]));

  assert.equal(byId.top.done, true);
  assert.deepEqual(byId.top.completedAt, { call: 7, number: 82 });
  assert.equal(byId.early5.done, true);
  assert.deepEqual(byId.early5.completedAt, { call: 7, number: 82 }); // 4, 23, 45, 61, 82
  assert.equal(byId.corners.done, true); // 4, 82, 9, 75
  assert.deepEqual(byId.corners.completedAt, { call: 9, number: 75 });
  assert.equal(byId.middle.done, false);
  assert.deepEqual(byId.middle.missing, [12, 37, 54, 66, 88]);
  assert.equal(byId.early7.done, true);
  assert.equal(byId.fullHouse.needMore, 8); // 7 of 15 marked
});
const FROZEN_ABCDE_1: Ticket = [[8,13,null,null,41,59,null,null,81],[9,null,25,null,43,null,60,70,null],[null,null,28,35,null,null,69,74,83]];
const FROZEN_7Q2K5_37: Ticket = [[null,17,null,33,44,null,65,null,86],[null,null,25,35,null,51,null,71,89],[4,19,null,39,null,53,null,75,null]];

test("prize tracker defaults are checkable and clearWinners keeps the list", async () => {
  const { defaultTrackedPrizes, clearWinners, isCheckable } = await import("../lib/prizeTracker.ts");
  const prizes = defaultTrackedPrizes();
  assert.deepEqual(prizes.map((p) => p.id), ["early5", "top", "middle", "bottom", "fullHouse"]);
  assert.ok(prizes.every((p) => isCheckable(p.id)));
  const won = prizes.map((p) => ({ ...p, winner: { name: "Asha", call: 3 } }));
  assert.deepEqual(clearWinners(won), prizes);
});

test("prize amounts: formatting, pool, and clearWinners keeps amounts", async () => {
  const { clearWinners, formatAmount, prizePool } = await import("../lib/prizeTracker.ts");
  assert.equal(formatAmount(2500), "₹2,500");
  assert.equal(formatAmount(150000), "₹1,50,000");
  const prizes = [
    { id: "top" as const, name: "Top Line", amount: 500, winner: { name: "Asha", call: 9 } },
    { id: "fullHouse" as const, name: "Full House", amount: 2000 },
    { id: "custom-1" as const, name: "Lucky 7s" },
  ];
  assert.equal(prizePool(prizes), 2500);
  assert.deepEqual(clearWinners(prizes), [
    { id: "top", name: "Top Line", amount: 500 },
    { id: "fullHouse", name: "Full House", amount: 2000 },
    { id: "custom-1", name: "Lucky 7s" },
  ]);
});
