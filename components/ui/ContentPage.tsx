import type { ReactNode } from "react";

type Props = {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
};

/** Shared layout for the static reference pages. */
export default function ContentPage({ title, intro, children }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
      {intro && <p className="mt-3 text-lg text-slate-600">{intro}</p>}
      <div className="prose-content mt-8 flex flex-col gap-8">{children}</div>
    </main>
  );
}
