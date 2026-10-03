import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COLUMN_RANGES,
  generateStrip,
} from "../lib/ticketGenerator.ts";

const TRIALS = 500;

test(`generateStrip produces valid strips (${TRIALS} trials)`, () => {
  for (let trial = 0; trial < TRIALS; trial++) {
    const strip = generateStrip();
    assert.equal(strip.length, 6);

    const seen: number[] = [];
    for (const ticket of strip) {
      assert.equal(ticket.length, 3);
      for (const row of ticket) {
        assert.equal(row.length, 9);
        assert.equal(row.filter((c) => c !== null).length, 5);
      }

      let total = 0;
      for (let col = 0; col < 9; col++) {
        const nums = ticket
          .map((row) => row[col])
          .filter((c): c is number => c !== null);
        assert.ok(nums.length >= 1 && nums.length <= 3, `col ${col} count`);
        const [min, max] = COLUMN_RANGES[col];
        for (let i = 0; i < nums.length; i++) {
          assert.ok(nums[i] >= min && nums[i] <= max, `col ${col} range`);
          if (i > 0) assert.ok(nums[i] > nums[i - 1], `col ${col} order`);
        }
        total += nums.length;
        seen.push(...nums);
      }
      assert.equal(total, 15);
    }

    assert.deepEqual(
      seen.sort((a, b) => a - b),
      Array.from({ length: 90 }, (_, i) => i + 1),
    );
  }
});
