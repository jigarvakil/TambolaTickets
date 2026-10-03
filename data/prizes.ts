export type Prize = {
  name: string;
  /** Other names the same pattern goes by. */
  aliases?: string[];
  description: string;
  category: "classic" | "lines" | "patterns" | "column" | "special";
};

export const prizeCategories: Record<Prize["category"], string> = {
  classic: "Classic prizes",
  lines: "Line prizes",
  patterns: "Shape and pattern prizes",
  column: "Column prizes",
  special: "Special and bonus prizes",
};

export const prizes: Prize[] = [
  {
    name: "Early Five",
    aliases: ["Quick Five", "Jaldi Five"],
    description: "The first player to mark any 5 numbers anywhere on their ticket.",
    category: "classic",
  },
  {
    name: "Early Seven",
    description: "Same idea as Early Five, but the player needs any 7 numbers marked.",
    category: "classic",
  },
  {
    name: "Full House",
    aliases: ["Housie", "Jackpot"],
    description:
      "All 15 numbers on the ticket are marked. Usually the biggest prize and the one that ends the game.",
    category: "classic",
  },
  {
    name: "Second Full House",
    description: "Play continues after the first Full House; the next ticket to complete wins this.",
    category: "classic",
  },
  {
    name: "Top Line",
    aliases: ["First Line"],
    description: "All 5 numbers in the top row are marked.",
    category: "lines",
  },
  {
    name: "Middle Line",
    aliases: ["Centre Line", "Second Line"],
    description: "All 5 numbers in the middle row are marked.",
    category: "lines",
  },
  {
    name: "Bottom Line",
    aliases: ["Third Line"],
    description: "All 5 numbers in the bottom row are marked.",
    category: "lines",
  },
  {
    name: "Any Two Lines",
    description: "Any two complete rows on the same ticket.",
    category: "lines",
  },
  {
    name: "Four Corners",
    description:
      "The first and last numbers of the top row plus the first and last numbers of the bottom row.",
    category: "patterns",
  },
  {
    name: "King's Corners",
    description: "The four corners plus the middle number of the middle row.",
    category: "patterns",
  },
  {
    name: "Queen's Corners",
    description: "The four corners plus the first and last numbers of the middle row.",
    category: "patterns",
  },
  {
    name: "Star",
    description: "The four corners together with the centre number of the ticket.",
    category: "patterns",
  },
  {
    name: "Pyramid",
    description:
      "The middle number of the top row, the 2nd, 3rd and 4th numbers of the middle row, and all 5 numbers of the bottom row, forming a triangle.",
    category: "patterns",
  },
  {
    name: "Bamboo",
    description:
      "The 3rd number in each of the three rows — a vertical stick running down the middle of the ticket.",
    category: "patterns",
  },
  {
    name: "Cross",
    description:
      "The middle number of the top row, the full middle row, and the middle number of the bottom row.",
    category: "patterns",
  },
  {
    name: "Young Half",
    aliases: ["First Half"],
    description: "Every number from 1 to 45 that appears on the ticket is marked.",
    category: "column",
  },
  {
    name: "Old Half",
    aliases: ["Second Half"],
    description: "Every number from 46 to 90 that appears on the ticket is marked.",
    category: "column",
  },
  {
    name: "Breakfast",
    description: "All numbers on the ticket from the first three columns (1–29) are marked.",
    category: "column",
  },
  {
    name: "Lunch",
    description: "All numbers on the ticket from the middle three columns (30–59) are marked.",
    category: "column",
  },
  {
    name: "Dinner",
    description: "All numbers on the ticket from the last three columns (60–90) are marked.",
    category: "column",
  },
  {
    name: "Odd Numbers",
    description: "Every odd number on the ticket is marked.",
    category: "special",
  },
  {
    name: "Even Numbers",
    description: "Every even number on the ticket is marked.",
    category: "special",
  },
  {
    name: "Unlucky One",
    aliases: ["Bad Luck"],
    description:
      "Awarded to the ticket that still has the most unmarked numbers when someone wins Full House.",
    category: "special",
  },
  {
    name: "Snowball",
    description:
      "A jackpot that is only won if Full House is completed within a set number of calls. If nobody manages it, the pot rolls over to the next game and keeps growing.",
    category: "special",
  },
];
