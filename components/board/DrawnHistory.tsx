type Props = {
  drawn: number[];
};

export default function DrawnHistory({ drawn }: Props) {
  if (drawn.length === 0) {
    return <p className="text-sm text-slate-500">No numbers called yet.</p>;
  }

  // Most recent first.
  const recent = [...drawn].reverse();

  return (
    <ol className="flex flex-wrap gap-1.5">
      {recent.map((n, i) => (
        <li
          key={n}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold tabular-nums ${
            i === 0 ? "bg-amber-400 text-slate-900" : "bg-slate-200 text-slate-700"
          }`}
          title={`Call #${drawn.length - i}`}
        >
          {n}
        </li>
      ))}
    </ol>
  );
}
