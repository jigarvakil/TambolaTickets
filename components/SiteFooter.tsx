import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500">
        <p>Free Tambola tickets and number calling board. No sign-up needed.</p>
        <nav className="flex gap-4">
          <Link href="/rules" className="hover:text-rose-600">Rules</Link>
          <Link href="/prizes" className="hover:text-rose-600">Prizes</Link>
        </nav>
      </div>
    </footer>
  );
}
