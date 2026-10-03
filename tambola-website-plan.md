# Tambola Tickets Website — Project Plan

Clone of tambolatickets.in. Next.js 14 (App Router) + TypeScript. Goal: ticket PDF
generator, live number-calling board, game rules/prizes content, and ticket theming.

---

## 1. Tech Stack

- **Framework:** Next.js 14+ (App Router), TypeScript, React Server Components where sensible
- **Styling:** Tailwind CSS
- **PDF generation:** `@react-pdf/renderer` (renders React components straight to PDF — best fit
  for a 9×3 ticket grid with themed backgrounds/colors, no server needed, can run client-side)
- **State:** React state/Context for the number-calling board (no backend needed for v1 — everything
  client-side, nothing persisted server-side)
- **Deployment:** Vercel
- **No database needed for v1** — tickets and board state are ephemeral/client-side. Add a DB later
  only if you want saved ticket sets, user accounts, or a multiplayer shared board.

---

## 2. Site Map / Routes

```
/                          Landing + ticket generator (core feature, above the fold)
/number-board              Live number calling board (draw, history, phrases)
/rules                     Game rules (ticket structure, column ranges, how numbers are arranged)
/prizes                    Prize types (Early 5, Top Line, Full House, Corners, etc.)
/history                   Game history / origin content
/phrases                   Full list of 1–90 calling phrases (reference page)
```

Keep it a single Next.js app, no auth, static content pages can be plain MDX or hardcoded
TSX — no CMS needed for v1.

---

## 3. Feature 1 — Ticket Generator (core feature)

### 3.1 Ticket generation algorithm (validated, reuse as-is)

A **strip** = 6 tickets using all 90 numbers exactly once. Each ticket = 3 rows × 9 columns,
15 numbers per ticket, 5 numbers per row, 4 blanks per row.

**Column ranges:**

| Column | Range | Pool size |
|---|---|---|
| 1 | 1–9 | 9 |
| 2 | 10–19 | 10 |
| 3 | 20–29 | 10 |
| 4 | 30–39 | 10 |
| 5 | 40–49 | 10 |
| 6 | 50–59 | 10 |
| 7 | 60–69 | 10 |
| 8 | 70–79 | 10 |
| 9 | 80–90 | 11 |

**Rules a valid ticket must satisfy:**
- Every column has at least 1 number, at most 3, in a single ticket.
- Numbers within a column are sorted ascending top→bottom.
- Each row has exactly 5 filled cells, 4 blank.
- Across a full strip (6 tickets), every number 1–90 appears exactly once.

**Algorithm (already implemented and tested — 50/50 trials passed):**

1. **Column counts per ticket** — for each column, base count = 1 per ticket (6 tickets × 1 = 6),
   then distribute `poolSize - 6` "extra" counts across tickets using a least-loaded greedy
   (sort tickets by current running total, give the extra to the ones with the lowest load first).
   This balances every ticket to exactly 15 total numbers. Verify after: retry (up to ~200x) if any
   ticket doesn't land on exactly 15 — cheap and converges almost immediately in practice.
2. **Assign actual numbers** — for each column, shuffle its number pool, slice off the counts
   decided in step 1 per ticket, sort each ticket's slice ascending.
3. **Row placement per ticket** — for each column with count 1 or 2, randomly pick that many of
   the 3 rows (sorted ascending so numbers still read top-to-bottom), place numbers into a 3×9
   grid. Retry (up to ~800x, converges fast) until all 3 rows land on exactly 5 filled cells.

> Reference implementation exists from an earlier chat session (vanilla JS, tested 50 trials, 0
> failures) — port directly to TypeScript, typed as `type Ticket = (number | null)[][]` (3×9) and
> `type Strip = Ticket[]` (length 6). Ask for the original JS if useful as a starting point.

### 3.2 UI requirements

- Generate button → produces a new strip (6 tickets) client-side, instantly (no server round-trip).
- "Generate N strips" (the real site does 10 pages × 12 tickets = 120 tickets = 20 strips) — support
  generating multiple strips in one go for the PDF export.
- Ticket display: 9 columns × 3 rows grid, clear borders, blank cells visually distinct
  (diagonal hatch or empty), theme-aware colors.
- Regenerate is unlimited and free — no rate limiting needed for v1.

### 3.3 PDF export

- Layout: 2 sheets of 6 tickets per A4 page (matches source site) — or simpler v1: 1 ticket-strip
  (6 tickets) per page, improve layout later.
- Use `@react-pdf/renderer`'s `<Document>`/`<Page>`/`<View>`/`<Text>` to lay out the grid —
  avoids a headless-browser/html-to-pdf dependency.
- Trigger a client-side download (`pdf()` blob → `saveAs` or an `<a download>` link), no backend
  file storage needed.
- Include ticket numbers (serial numbers per ticket) if useful for tracking during play.

### 3.4 Theming

- Background color picker (simple hex/swatch picker).
- Border color, text color pickers.
- A handful of **preset themes** matching the source site's idea (Simple Classic, Birthday
  Balloons, Anniversary, Christmas, Valentine, Coffee, Black & White) — for v1, ship Simple
  Classic + Black & White + 2–3 presets; the rest can be added incrementally since they're just
  CSS/PDF color + background-image swaps.
- "Opacity" slider for background image behind the ticket grid in the PDF.
- Live preview of the theme on-screen before generating the PDF.

---

## 4. Feature 2 — Live Number Calling Board

- A "Draw Number" button pulls a random number from the un-drawn pool (1–90, no repeats until
  reset).
- Shows the number large, plus its **calling phrase** (see §6 — full phrase list to port in).
- A 1–90 board grid lights up/marks numbers as they're called (visual bingo-board style, 9×10
  or similar grid).
- History list of numbers called so far, in order.
- "Reset Game" clears drawn numbers and starts fresh.
- Optional nice-to-have (not v1): text-to-speech announcement of the number + phrase using the
  Web Speech API (`speechSynthesis`) — no backend needed, works fully client-side.
- All client-side state (`useState`/`useReducer`), nothing persisted — refreshing resets the game,
  same as a physical board. (A shareable/synced multiplayer board would need a backend — explicitly
  out of scope for v1.)

---

## 5. Feature 3 — Rules, Prizes, History content pages

Static content pages, mostly ported/rewritten copy (don't copy the source site's text verbatim —
write original copy covering the same information):

- **Rules page:** ticket structure (9×3, 15 numbers, column ranges, ascending-order-per-column
  rule, 5-per-row rule), how a full sheet/strip works, basic play flow.
- **Prizes page:** Early 5, Early 7, Top/Center/Bottom Line, Corners (King's/Queen's), Full House,
  Half House (Young/Old), Breakfast/Lunch/Dinner (column-based prizes), Pyramid, Bamboo, Cross,
  Snowball, etc. — list each with a one-line description of the winning pattern.
- **History page:** brief, original write-up on tambola/housie/bingo origins and regional variants.

---

## 6. Feature 4 — Calling Phrases Reference (1–90)

A reference table/page of the traditional calling phrase for each number (e.g. "Garden Gate" for
88, "Doctor's Orders" for 9, etc. — exact phrases vary by region/house; use a standard commonly-used
set). This same data powers the Number Calling Board (§4). Store it as a single typed data file:

```ts
// data/phrases.ts
export const callingPhrases: Record<number, string> = {
  1: "Kelly's Eye",
  2: "One Little Duck",
  // ... 1 through 90
};
```

---

## 7. Suggested Folder Structure

```
tambola-website/
├── app/
│   ├── page.tsx                  # landing + generator
│   ├── number-board/page.tsx
│   ├── rules/page.tsx
│   ├── prizes/page.tsx
│   ├── history/page.tsx
│   ├── phrases/page.tsx
│   └── layout.tsx
├── components/
│   ├── ticket/
│   │   ├── TicketGrid.tsx        # renders one 3x9 ticket
│   │   ├── StripView.tsx         # renders 6 tickets
│   │   ├── TicketPdfDocument.tsx # @react-pdf/renderer layout
│   │   └── ThemePicker.tsx
│   ├── board/
│   │   ├── NumberBoard.tsx
│   │   ├── DrawnHistory.tsx
│   │   └── DrawButton.tsx
│   └── ui/                       # shared buttons, pickers, etc.
├── lib/
│   ├── ticketGenerator.ts        # the algorithm from §3.1
│   └── pdfExport.ts
├── data/
│   ├── phrases.ts
│   ├── prizes.ts
│   └── themes.ts
├── types/
│   └── ticket.ts                 # Ticket, Strip, Theme types
└── public/
    └── themes/                   # background images per theme
```

---

## 8. Build Order (phases)

1. **Core generator** — algorithm in `lib/ticketGenerator.ts`, typed, with a small test file
   (reuse the validated logic — don't re-derive it from scratch).
2. **Ticket UI** — render a strip on screen, "Generate New Strip" button, basic styling only
   (no theming yet).
3. **PDF export** — wire up `@react-pdf/renderer`, single strip per PDF first, then multi-strip.
4. **Theming** — color pickers + presets, applied to both on-screen and PDF.
5. **Number calling board** — draw/history/reset, phrases data file.
6. **Content pages** — rules, prizes, history, phrases reference.
7. **Polish** — responsive layout, print styles for the on-screen ticket view (as a fallback to
   PDF), deploy to Vercel.

---

## 9. Explicit Non-Goals for v1

- No user accounts / auth
- No backend database or persisted game state
- No multiplayer/shared real-time board
- No payment/ticket-selling functionality (this is a free generator, same as the source site)
