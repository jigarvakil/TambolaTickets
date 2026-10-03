import type { Metadata } from "next";
import Link from "next/link";
import TicketGrid from "@/components/ticket/TicketGrid";
import ContentPage from "@/components/ui/ContentPage";
import { defaultTheme } from "@/data/themes";
import { COLUMN_RANGES } from "@/lib/ticketGenerator";
import type { Ticket } from "@/types/ticket";

export const metadata: Metadata = {
  title: "How to Play Tambola — Rules",
  description:
    "Learn how Tambola (Housie) tickets are structured, how numbers are arranged in columns and rows, and how a game is played from start to Full House.",
};

const SAMPLE_TICKET: Ticket = [
  [4, null, 23, null, 45, null, 61, null, 82],
  [null, 12, null, 37, null, 54, 66, null, 88],
  [9, 18, null, 39, null, 57, null, 75, null],
];

export default function RulesPage() {
  return (
    <ContentPage
      title="How to Play Tambola"
      intro="Tambola — also called Housie — is a numbers game for any group size. One person calls out numbers at random and everyone else races to mark them off their tickets."
    >
      <section>
        <h2>What you need</h2>
        <ul>
          <li>A ticket (or several) for each player — <Link href="/">generate them here</Link>.</li>
          <li>A pen or marker for each player.</li>
          <li>
            A caller with a way to draw numbers 1–90 at random. Our{" "}
            <Link href="/number-board">number calling board</Link> does this for you.
          </li>
          <li>An agreed list of prizes before the game starts — see <Link href="/prizes">prizes</Link>.</li>
        </ul>
      </section>

      <section>
        <h2>The ticket</h2>
        <p>
          Every ticket is a grid of 3 rows and 9 columns, so it has 27 boxes. Exactly 15 of them
          hold a number and the other 12 are left blank.
        </p>
        <div className="my-5 max-w-md">
          <TicketGrid ticket={SAMPLE_TICKET} theme={defaultTheme} />
        </div>
        <ul>
          <li>Each row has exactly 5 numbers and 4 blanks.</li>
          <li>Each column has at least 1 number and at most 3.</li>
          <li>Inside a column, numbers always go from smallest at the top to largest at the bottom.</li>
          <li>A number never appears twice on the same ticket.</li>
        </ul>
      </section>

      <section>
        <h2>Which numbers go in which column</h2>
        <p>Each column only ever holds numbers from its own range:</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border border-slate-200 px-3 py-2">Column</th>
                {COLUMN_RANGES.map((_, i) => (
                  <th key={i} className="border border-slate-200 px-3 py-2 text-center">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 px-3 py-2 font-semibold">Numbers</td>
                {COLUMN_RANGES.map(([min, max], i) => (
                  <td key={i} className="whitespace-nowrap border border-slate-200 px-3 py-2 text-center tabular-nums">
                    {min}–{max}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          The first column is one short (1–9) and the last column is one long (80–90), which is
          how 90 numbers fit across 9 columns.
        </p>
      </section>

      <section>
        <h2>Strips: six tickets, all 90 numbers</h2>
        <p>
          Tickets are made in sets of six called a strip (or sheet). Across those six tickets,
          every number from 1 to 90 appears exactly once — 6 tickets × 15 numbers = 90. A player
          who buys a whole strip is guaranteed to mark a number on every single call.
        </p>
        <p>
          Our generator always builds full strips, so if you hand out tickets from the same
          strip to different players, no two of them will share a number.
        </p>
      </section>

      <section>
        <h2>Playing a game</h2>
        <ol>
          <li>Hand out tickets and agree on the prizes and how much each one is worth.</li>
          <li>The caller draws numbers one at a time and reads each one out — usually digit by digit, then the whole number (“two four, twenty four”).</li>
          <li>Players mark off any called number that appears on their ticket.</li>
          <li>
            When a player completes a prize pattern, they shout out straight away — before the
            next number is called.
          </li>
          <li>
            The caller checks the claim against the numbers called so far. A valid claim wins the
            prize; that prize is then closed and play continues.
          </li>
          <li>The game usually ends when someone claims Full House.</li>
        </ol>
      </section>

      <section>
        <h2>House rules worth agreeing up front</h2>
        <ul>
          <li>
            <strong>Late claims.</strong> Most groups say a claim only counts if made before the
            next number is drawn.
          </li>
          <li>
            <strong>Ties.</strong> If two players complete the same prize on the same number,
            decide in advance whether they split it.
          </li>
          <li>
            <strong>Bogus claims.</strong> Some groups disqualify the ticket for that prize, or
            for the rest of the game, if a claim turns out to be wrong.
          </li>
        </ul>
      </section>
    </ContentPage>
  );
}
