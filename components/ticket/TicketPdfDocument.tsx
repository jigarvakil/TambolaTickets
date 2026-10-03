import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { TICKET_WATERMARK, watermarkFontSize } from "@/lib/site";
import { ticketId } from "@/lib/ticketSet";
import { DEFAULT_TICKET_TITLE, type Strip, type Theme, type Ticket } from "@/types/ticket";

/** Tickets per A4 page: 2 columns × 6 rows = 2 strips. */
export const TICKETS_PER_PAGE = 12;

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#64748b",
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  ticket: {
    width: "48.9%",
    position: "relative",
    borderWidth: 1.5,
    borderRadius: 3,
    padding: 4,
    overflow: "hidden",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    objectFit: "cover",
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
  },
  stamp: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  stampText: {
    fontFamily: "Helvetica-Bold",
  },
  watermark: {
    marginTop: 3,
    textAlign: "right",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  number: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
});

function PdfTicket({ ticket, theme, label }: { ticket: Ticket; theme: Theme; label: string }) {
  return (
    <View
      style={[styles.ticket, { backgroundColor: theme.background, borderColor: theme.border }]}
      wrap={false}
    >
      {theme.image && (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={theme.image} style={[styles.image, { opacity: theme.imageOpacity }]} />
      )}
      <View style={[styles.ticketHeader, { color: theme.accent }]}>
        <Text>{(theme.title ?? DEFAULT_TICKET_TITLE).toUpperCase()}</Text>
        <Text>{label}</Text>
      </View>
      <View style={{ borderLeftWidth: 0.75, borderTopWidth: 0.75, borderColor: theme.border }}>
        {ticket.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => (
              <View
                key={c}
                style={[
                  styles.cell,
                  { borderColor: theme.border },
                  cell === null ? { backgroundColor: theme.blank } : {},
                ]}
              >
                {cell !== null && (
                  <Text style={[styles.number, { color: theme.text }]}>{cell}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
      <Text style={[styles.watermark, { color: theme.accent }]}>{TICKET_WATERMARK}</Text>
      {theme.watermarkText && (
        <View style={styles.stamp}>
          <Text
            style={[
              styles.stampText,
              {
                color: theme.text,
                opacity: theme.watermarkOpacity,
                fontSize: watermarkFontSize(theme.watermarkText, 240, 56),
              },
            ]}
          >
            {theme.watermarkText}
          </Text>
        </View>
      )}
    </View>
  );
}

type Props = {
  strips: Strip[];
  theme: Theme;
  /** Set code, printed on every ticket so the board can check claims. */
  code: string;
};

export default function TicketPdfDocument({ strips, theme, code }: Props) {
  const tickets = strips.flat();
  const pages: Ticket[][] = [];
  for (let i = 0; i < tickets.length; i += TICKETS_PER_PAGE) {
    pages.push(tickets.slice(i, i + TICKETS_PER_PAGE));
  }

  return (
    <Document title={`Tambola Tickets — Set ${code}`} author="Tambola Tickets">
      {pages.map((pageTickets, p) => (
        <Page key={p} size="A4" style={styles.page}>
          <View style={styles.pageHeader}>
            <Text>
              Tambola Tickets · Set {code} · {tickets.length} tickets
            </Text>
            <Text>
              Page {p + 1} of {pages.length}
            </Text>
          </View>
          <View style={styles.grid}>
            {pageTickets.map((ticket, i) => (
              <PdfTicket
                key={i}
                ticket={ticket}
                theme={theme}
                label={ticketId(code, p * TICKETS_PER_PAGE + i + 1)}
              />
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}
