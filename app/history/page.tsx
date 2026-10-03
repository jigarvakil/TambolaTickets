import type { Metadata } from "next";
import ContentPage from "@/components/ui/ContentPage";

export const metadata: Metadata = {
  title: "History of Tambola and Housie",
  description:
    "Where Tambola came from: its roots in Italian lotto, its spread through Europe and the British armed forces, and how it became a favourite at Indian parties and clubs.",
};

export default function HistoryPage() {
  return (
    <ContentPage
      title="A Short History of Tambola"
      intro="Tambola, Housie and 90-ball bingo are all branches of the same family tree, one that stretches back almost five hundred years."
    >
      <section>
        <h2>Italian beginnings</h2>
        <p>
          The game&apos;s earliest ancestor is the Italian state lottery, which took shape in the
          1500s. Numbers were drawn at random and players won if they had picked the right ones.
          Over time a home version grew out of it, played with cards and drawn tokens around the
          family table — a tradition still alive in Italy as tombola, especially at Christmas.
        </p>
      </section>

      <section>
        <h2>Across Europe</h2>
        <p>
          By the 1700s a version called <em>le lotto</em> was popular in France, played on cards
          with three rows and nine columns — the same layout used on Tambola tickets today. In
          the 1800s German schools even used lotto-style games to drill spelling, arithmetic and
          history.
        </p>
      </section>

      <section>
        <h2>&ldquo;Housey-Housey&rdquo; and the forces</h2>
        <p>
          The game travelled widely with the British armed forces, where it was known as
          housey-housey and was one of the few games of chance permitted to soldiers and sailors.
          It later became the staple of bingo halls across the UK.
        </p>
      </section>

      <section>
        <h2>Bingo in the United States</h2>
        <p>
          In America the game took a different turn. It became known as bingo, and the most
          common version uses 75 numbers on a 5×5 card with a free centre square — a different
          ticket from the 90-ball, 3×9 format used in Tambola.
        </p>
      </section>

      <section>
        <h2>Tambola in India</h2>
        <p>
          In India the 90-ball game took root as Tambola or Housie and became a fixture of social
          life: kitty parties, club evenings, housing society events, weddings, and festivals like
          Diwali and New Year. Indian games are known for their long and creative prize lists —
          Early Five, corners, Breakfast, Lunch and Dinner and more — which keep everyone in the
          game until the very end.
        </p>
        <p>
          Today the game has moved online as well, with printable tickets and virtual calling
          boards making it easy to play with family and friends anywhere.
        </p>
      </section>

      <section>
        <h2>One game, many names</h2>
        <ul>
          <li><strong>Tambola</strong> — the most common name in India.</li>
          <li><strong>Housie</strong> — used in India, Australia and New Zealand.</li>
          <li><strong>90-ball bingo</strong> — the usual name in the UK and Ireland.</li>
          <li><strong>Tombola</strong> — the Italian family game.</li>
        </ul>
      </section>
    </ContentPage>
  );
}
