type Props = {
  onClick: () => void;
};

/** Small "?" button that replays the page tour. */
export default function TourButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tour="help"
      aria-label="Show guided tour"
      title="Show guided tour"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-bold text-slate-600 shadow-sm hover:border-rose-400 hover:text-rose-600"
    >
      ?
    </button>
  );
}
