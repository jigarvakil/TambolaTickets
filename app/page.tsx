import Link from "next/link";
import TicketGenerator from "@/components/ticket/TicketGenerator";

const FEATURES = [
  {
    title: "Valid every time",
    body: "Each strip of 6 tickets uses all 90 numbers exactly once, with 5 numbers per row and sorted columns.",
  },
  {
    title: "Print-ready PDF",
    body: "12 tickets per A4 page with serial numbers. Generate up to 120 tickets in one go.",
  },
  {
    title: "Your own design",
    body: "Pick a preset theme, tweak the colors, or add a photo behind every ticket.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="mb-6 print:hidden">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Free Tambola Ticket Generator
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Make printable Tambola (Housie) tickets in seconds, download them as a PDF, then run
          your game with our{" "}
          <Link href="/number-board" className="font-semibold text-rose-600 hover:underline">
            number calling board
          </Link>
          .
        </p>
      </div>

      <TicketGenerator />

      <section className="mt-12 grid gap-4 sm:grid-cols-3 print:hidden">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">{f.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm print:hidden">
        <h2 className="text-xl font-bold text-slate-900">How to use it</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-slate-700">
          <li>Choose how many tickets you need and press Generate Tickets.</li>
          <li>Open Ticket design to pick a theme or your own colors.</li>
          <li>Download the PDF and print it, or share the file with players.</li>
          <li>
            Start the game on the{" "}
            <Link href="/number-board" className="font-semibold text-rose-600 hover:underline">
              calling board
            </Link>{" "}
            and check the <Link href="/prizes" className="font-semibold text-rose-600 hover:underline">prize list</Link>.
          </li>
        </ol>
      </section>
    </main>
  );
}
