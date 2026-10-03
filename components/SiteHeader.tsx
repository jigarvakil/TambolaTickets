"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Tickets" },
  { href: "/rules", label: "Rules" },
  { href: "/prizes", label: "Prizes" },
  { href: "/history", label: "History" },
];

function tourId(href: string) {
  return `nav-${href === "/" ? "home" : href.slice(1)}`;
}

function Logo() {
  return (
    <Link href="/" className="shrink-0" aria-label="Tambola Tickets home">
      <Image
        src="/logo.png"
        alt="Tambola Tickets"
        width={1200}
        height={400}
        priority
        className="h-12 w-auto transition-transform md:h-15 hover:scale-[1.03]"
      />
    </Link>
  );
}

function BoardButton({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/number-board"
      data-tour="nav-number-board"
      className={`inline-flex items-center gap-2 rounded-full bg-rose-600 font-semibold text-white shadow-sm hover:bg-rose-700 ${
        compact ? "px-3.5 py-2 text-sm" : "px-4 py-2 text-sm"
      }`}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M6.3 3.6A1 1 0 0 0 5 4.5v11a1 1 0 0 0 1.5.9l9-5.5a1 1 0 0 0 0-1.8l-9-5.5Z" />
      </svg>
      {compact ? "Board" : "Number Board"}
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu after navigating.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl md:h-20 items-center justify-between gap-4 px-4">
        <Logo />

        {/* Desktop navigation */}
        <nav data-tour="nav" className="hidden items-center gap-1 rounded-full bg-slate-100/80 p-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={tourId(item.href)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-rose-600 shadow-sm"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <BoardButton />
        </div>

        {/* Mobile: board shortcut + menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <BoardButton compact />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              {menuOpen ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2.5 font-medium ${
                      active ? "bg-rose-50 text-rose-600" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
