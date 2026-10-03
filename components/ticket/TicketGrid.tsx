import { TICKET_WATERMARK, watermarkFontSize } from "@/lib/site";
import { DEFAULT_TICKET_TITLE, type Theme, type Ticket } from "@/types/ticket";

type Props = {
  ticket: Ticket;
  theme: Theme;
  /** Ticket ID shown top-right, e.g. "7Q2K5-37". */
  label?: string;
};

export default function TicketGrid({ ticket, theme, label }: Props) {
  return (
    <div
      className="ticket relative overflow-hidden rounded-md border-2 p-1.5 shadow-sm"
      style={{ backgroundColor: theme.background, borderColor: theme.border }}
    >
      {theme.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={theme.image}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ opacity: theme.imageOpacity }}
        />
      )}
      <div className="relative">
        {label !== undefined && (
          <div
            className="mb-1 flex justify-between px-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: theme.accent }}
          >
            <span>{theme.title ?? DEFAULT_TICKET_TITLE}</span>
            <span className="tabular-nums">{label}</span>
          </div>
        )}
        <div
          className="grid grid-cols-9 border-l border-t"
          style={{ borderColor: theme.border }}
        >
          {ticket.flatMap((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`flex aspect-square items-center justify-center border-b border-r text-sm font-bold tabular-nums sm:text-base ${
                  cell === null ? "ticket-blank" : ""
                }`}
                style={{
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: cell === null ? theme.blank : undefined,
                }}
              >
                {cell}
              </div>
            )),
          )}
        </div>
        <p
          className="mt-1 text-right text-xs font-bold tracking-wide"
          style={{ color: theme.accent }}
        >
          {TICKET_WATERMARK}
        </p>
      </div>
      {theme.watermarkText && (
        <svg
          viewBox="0 0 300 110"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <text
            x="150"
            y="55"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={watermarkFontSize(theme.watermarkText, 280, 64)}
            fontWeight={800}
            fill={theme.text}
            opacity={theme.watermarkOpacity}
          >
            {theme.watermarkText}
          </text>
        </svg>
      )}
    </div>
  );
}
