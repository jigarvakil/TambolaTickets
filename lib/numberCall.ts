export type CallLanguage = "en" | "hi" | "gu";

export type LanguageInfo = {
  code: CallLanguage;
  /** Name shown in settings. */
  label: string;
  /** Name in the language itself. */
  nativeLabel: string;
  /** BCP 47 tag used to pick a speech voice. */
  speechLang: string;
  /** False while a language is still "coming soon" in settings. */
  available: boolean;
};

export const LANGUAGES: Record<CallLanguage, LanguageInfo> = {
  en: { code: "en", label: "English", nativeLabel: "English", speechLang: "en-IN", available: true },
  hi: { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", speechLang: "hi-IN", available: false },
  gu: { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", speechLang: "gu-IN", available: false },
};

const EN_ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const EN_TEENS = [
  "ten", "eleven", "twelve", "thirteen", "fourteen",
  "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const EN_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** Hindi words for 0–90 (index = number). Hindi numbers are irregular, so they're listed in full. */
const HI_WORDS = [
  "शून्य", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ",
  "दस", "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस",
  "बीस", "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाईस", "उनतीस",
  "तीस", "इकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस",
  "चालीस", "इकतालीस", "बयालीस", "तैंतालीस", "चवालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास",
  "पचास", "इक्यावन", "बावन", "तिरपन", "चौवन", "पचपन", "छप्पन", "सत्तावन", "अट्ठावन", "उनसठ",
  "साठ", "इकसठ", "बासठ", "तिरसठ", "चौंसठ", "पैंसठ", "छियासठ", "सड़सठ", "अड़सठ", "उनहत्तर",
  "सत्तर", "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छिहत्तर", "सतहत्तर", "अठहत्तर", "उनासी",
  "अस्सी", "इक्यासी", "बयासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सत्तासी", "अट्ठासी", "नवासी",
  "नब्बे",
];

/** Gujarati words for 0–90 (index = number). */
const GU_WORDS = [
  "શૂન્ય", "એક", "બે", "ત્રણ", "ચાર", "પાંચ", "છ", "સાત", "આઠ", "નવ",
  "દસ", "અગિયાર", "બાર", "તેર", "ચૌદ", "પંદર", "સોળ", "સત્તર", "અઢાર", "ઓગણીસ",
  "વીસ", "એકવીસ", "બાવીસ", "તેવીસ", "ચોવીસ", "પચ્ચીસ", "છવ્વીસ", "સત્તાવીસ", "અઠ્ઠાવીસ", "ઓગણત્રીસ",
  "ત્રીસ", "એકત્રીસ", "બત્રીસ", "તેત્રીસ", "ચોત્રીસ", "પાંત્રીસ", "છત્રીસ", "સાડત્રીસ", "આડત્રીસ", "ઓગણચાલીસ",
  "ચાલીસ", "એકતાલીસ", "બેતાલીસ", "તેતાલીસ", "ચુંમાલીસ", "પિસ્તાલીસ", "છેંતાલીસ", "સુડતાલીસ", "અડતાલીસ", "ઓગણપચાસ",
  "પચાસ", "એકાવન", "બાવન", "ત્રેપન", "ચોપન", "પંચાવન", "છપ્પન", "સત્તાવન", "અઠ્ઠાવન", "ઓગણસાઠ",
  "સાઠ", "એકસઠ", "બાસઠ", "ત્રેસઠ", "ચોસઠ", "પાંસઠ", "છાસઠ", "સડસઠ", "અડસઠ", "અગણોસિત્તેર",
  "સિત્તેર", "એકોતેર", "બોતેર", "તોતેર", "ચુમોતેર", "પંચોતેર", "છોતેર", "સિત્યોતેર", "ઇઠ્યોતેર", "ઓગણએંસી",
  "એંસી", "એક્યાસી", "બ્યાસી", "ત્યાસી", "ચોર્યાસી", "પંચાસી", "છ્યાસી", "સિત્યાસી", "અઠ્યાસી", "નેવ્યાસી",
  "નેવું",
];

/** English words for 0–99, e.g. 24 → "twenty four". */
export function numberToWords(n: number): string {
  if (n < 10) return EN_ONES[n];
  if (n < 20) return EN_TEENS[n - 10];
  const tens = EN_TENS[Math.floor(n / 10)];
  return n % 10 === 0 ? tens : `${tens} ${EN_ONES[n % 10]}`;
}

function wordsFor(lang: CallLanguage, n: number): string {
  if (lang === "hi") return HI_WORDS[n];
  if (lang === "gu") return GU_WORDS[n];
  return numberToWords(n);
}

/**
 * How the caller reads a number: digits first, then the whole number.
 * en: 24 → "two four, twenty four"; 5 → "single number five"
 * hi: 24 → "दो चार, चौबीस";          5 → "पाँच"
 * gu: 24 → "બે ચાર, ચોવીસ";          5 → "પાંચ"
 */
export function callText(n: number, lang: CallLanguage = "en"): string {
  if (n < 10) return lang === "en" ? `single number ${EN_ONES[n]}` : wordsFor(lang, n);
  const digits = String(n)
    .split("")
    .map((d) => wordsFor(lang, Number(d)))
    .join(" ");
  return `${digits}, ${wordsFor(lang, n)}`;
}
