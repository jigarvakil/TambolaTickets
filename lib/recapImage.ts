import { formatAmount, type TrackedPrize } from "./prizeTracker";
import { TICKET_WATERMARK } from "./site";

const W = 1080;
const H = 1350;
const FONT = "Arial, Helvetica, sans-serif";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

/** Shorten `text` with an ellipsis so it fits in `maxWidth`. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

/**
 * Draw a shareable summary of the game: logo, call count, the 1–90 board
 * and the prize winners. Returns a PNG blob.
 */
export async function createRecapImage(drawn: number[], prizes: TrackedPrize[]): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fff7ed");
  bg.addColorStop(1, "#ffffff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Logo
  const logo = await loadImage("/logo.png");
  if (logo) {
    const lw = 540;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, (W - lw) / 2, 40, lw, lh);
  }

  // Title
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#0f172a";
  ctx.font = `800 56px ${FONT}`;
  ctx.fillText("Game Recap", W / 2, 300);
  ctx.fillStyle = "#64748b";
  ctx.font = `500 30px ${FONT}`;
  const date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  ctx.fillText(`${date}  ·  ${drawn.length} of 90 numbers called`, W / 2, 348);

  // 1–90 board
  const called = new Set(drawn);
  const last = drawn[drawn.length - 1];
  const pitch = 74;
  const size = 66;
  const gridX = (W - pitch * 10 + (pitch - size)) / 2;
  const gridY = 390;
  ctx.textBaseline = "middle";
  ctx.font = `700 28px ${FONT}`;
  for (let n = 1; n <= 90; n++) {
    const x = gridX + ((n - 1) % 10) * pitch;
    const y = gridY + Math.floor((n - 1) / 10) * pitch;
    ctx.fillStyle = n === last ? "#fbbf24" : called.has(n) ? "#e11d48" : "#f1f5f9";
    roundRect(ctx, x, y, size, size, 10);
    ctx.fillStyle = n === last ? "#0f172a" : called.has(n) ? "#ffffff" : "#94a3b8";
    ctx.fillText(String(n), x + size / 2, y + size / 2 + 1);
  }

  // Winners
  const winners = prizes.filter((p) => p.winner);
  const listTop = gridY + pitch * 9 + 70;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#0f172a";
  ctx.font = `800 36px ${FONT}`;
  ctx.fillText(winners.length > 0 ? "Winners" : "No prizes awarded yet", 90, listTop);

  const twoCols = winners.length > 4;
  const colWidth = twoCols ? 430 : 900;
  const perCol = twoCols ? Math.ceil(winners.length / 2) : winners.length;
  winners.slice(0, 10).forEach((p, i) => {
    const col = twoCols ? Math.floor(i / perCol) : 0;
    const row = twoCols ? i % perCol : i;
    const x = 90 + col * 470;
    const y = listTop + 52 + row * 44;
    const who = [p.winner!.name, p.winner!.ticket].filter(Boolean).join(" · ");
    ctx.fillStyle = "#047857";
    ctx.font = `700 28px ${FONT}`;
    const label = `🏆 ${p.name}${p.amount ? ` ${formatAmount(p.amount)}` : ""}`;
    ctx.fillText(fit(ctx, label, colWidth), x, y);
    const labelWidth = Math.min(ctx.measureText(label).width, colWidth);
    if (who && labelWidth < colWidth - 40) {
      ctx.fillStyle = "#334155";
      ctx.font = `500 26px ${FONT}`;
      ctx.fillText(fit(ctx, ` — ${who}`, colWidth - labelWidth), x + labelWidth, y);
    }
  });

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#e11d48";
  ctx.font = `700 28px ${FONT}`;
  ctx.fillText(TICKET_WATERMARK, W / 2, H - 36);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image"))), "image/png"),
  );
}
