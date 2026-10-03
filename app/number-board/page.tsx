import type { Metadata } from "next";
import BoardGame from "@/components/board/BoardGame";

export const metadata: Metadata = {
  title: "Number Calling Board",
  description:
    "Free online Tambola number calling board. Draw numbers 1–90 at random with voice announcements and auto-call.",
};

export default function NumberBoardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <BoardGame />
    </main>
  );
}
