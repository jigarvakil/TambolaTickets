import { test } from "node:test";
import assert from "node:assert/strict";
import {
  boardReducer,
  initialBoardState,
  TOTAL_NUMBERS,
} from "../lib/numberBoard.ts";
import { callText } from "../lib/numberCall.ts";

test("drawing all numbers calls each 1–90 once, then stops", () => {
  let state = initialBoardState;
  for (let i = 0; i < TOTAL_NUMBERS + 5; i++) {
    state = boardReducer(state, { type: "draw" });
  }
  assert.equal(state.drawn.length, TOTAL_NUMBERS);
  assert.deepEqual(
    [...state.drawn].sort((a, b) => a - b),
    Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1),
  );
});

test("reset clears drawn numbers", () => {
  const drawn = boardReducer(initialBoardState, { type: "draw" });
  assert.deepEqual(boardReducer(drawn, { type: "reset" }).drawn, []);
});

test("callText reads digits then the whole number", () => {
  assert.equal(callText(24), "two four, twenty four");
  assert.equal(callText(90), "nine zero, ninety");
  assert.equal(callText(11), "one one, eleven");
  assert.equal(callText(70), "seven zero, seventy");
  assert.equal(callText(5), "single number five");
  for (let n = 1; n <= TOTAL_NUMBERS; n++) {
    assert.ok(!callText(n).includes("undefined"), `bad call text for ${n}`);
  }
});

test("callText in Hindi and Gujarati", () => {
  assert.equal(callText(24, "hi"), "दो चार, चौबीस");
  assert.equal(callText(24, "gu"), "બે ચાર, ચોવીસ");
  assert.equal(callText(90, "hi"), "नौ शून्य, नब्बे");
  assert.equal(callText(5, "gu"), "પાંચ");
  for (const lang of ["en", "hi", "gu"] as const) {
    for (let n = 1; n <= TOTAL_NUMBERS; n++) {
      const text = callText(n, lang);
      assert.ok(text && !text.includes("undefined"), `bad ${lang} call text for ${n}`);
    }
  }
});

test("restore accepts a valid saved game and rejects bad data", () => {
  assert.deepEqual(boardReducer(initialBoardState, { type: "restore", drawn: [5, 90, 12] }).drawn, [5, 90, 12]);
  for (const bad of [[0], [91], [5, 5], [1.5]]) {
    assert.deepEqual(boardReducer(initialBoardState, { type: "restore", drawn: bad }).drawn, [], String(bad));
  }
});

test("undo removes only the last call", () => {
  let state = boardReducer(initialBoardState, { type: "restore", drawn: [5, 90, 12] });
  state = boardReducer(state, { type: "undo" });
  assert.deepEqual(state.drawn, [5, 90]);
  assert.deepEqual(boardReducer(initialBoardState, { type: "undo" }).drawn, []);
});

test("manual call adds a chosen number once, rejects repeats and out-of-range", () => {
  let state = boardReducer(initialBoardState, { type: "call", number: 45 });
  state = boardReducer(state, { type: "call", number: 7 });
  assert.deepEqual(state.drawn, [45, 7]);
  for (const bad of [45, 0, 91, 2.5]) {
    assert.deepEqual(boardReducer(state, { type: "call", number: bad }).drawn, [45, 7], String(bad));
  }
});
