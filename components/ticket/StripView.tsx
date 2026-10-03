import type { Strip, Theme } from "@/types/ticket";
import { ticketId } from "@/lib/ticketSet";
import TicketGrid from "./TicketGrid";

type Props = {
  strip: Strip;
  theme: Theme;
  /** Set code the strip belongs to. */
  code: string;
  /** Serial number of the strip's first ticket. */
  firstSerial: number;
};

export default function StripView({ strip, theme, code, firstSerial }: Props) {
  return (
    <div className="strip grid gap-3 sm:grid-cols-2">
      {strip.map((ticket, i) => (
        <TicketGrid
          key={i}
          ticket={ticket}
          theme={theme}
          label={ticketId(code, firstSerial + i)}
        />
      ))}
    </div>
  );
}
