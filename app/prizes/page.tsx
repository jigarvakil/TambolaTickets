import type { Metadata } from "next";
import ContentPage from "@/components/ui/ContentPage";
import { prizeCategories, prizes, type Prize } from "@/data/prizes";

export const metadata: Metadata = {
  title: "Tambola Prizes and Winning Patterns",
  description:
    "Every popular Tambola (Housie) prize explained: Early Five, lines, corners, Full House, Pyramid, Bamboo, Breakfast, Lunch, Dinner and more.",
};

const CATEGORY_ORDER = Object.keys(prizeCategories) as Prize["category"][];

export default function PrizesPage() {
  return (
    <ContentPage
      title="Tambola Prizes"
      intro="Pick a handful of these before the game starts. Small groups often play Early Five, the three lines and Full House; bigger events add patterns for extra fun."
    >
      {CATEGORY_ORDER.map((category) => (
        <section key={category}>
          <h2>{prizeCategories[category]}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {prizes
              .filter((p) => p.category === category)
              .map((prize) => (
                <article
                  key={prize.name}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <h3 className="font-bold text-slate-900">{prize.name}</h3>
                  {prize.aliases && (
                    <p className="text-xs text-slate-500">Also called {prize.aliases.join(", ")}</p>
                  )}
                  <p className="mt-2 text-sm">{prize.description}</p>
                </article>
              ))}
          </div>
        </section>
      ))}
    </ContentPage>
  );
}
