type Props = {
  onDraw: () => void;
  disabled: boolean;
  finished: boolean;
};

export default function DrawButton({ onDraw, disabled, finished }: Props) {
  return (
    <button
      type="button"
      onClick={onDraw}
      disabled={disabled}
      className="rounded-lg bg-rose-600 px-8 py-3 text-lg font-bold text-white shadow hover:bg-rose-700 disabled:opacity-50"
    >
      {finished ? "All numbers called" : "Draw Number"}
    </button>
  );
}
