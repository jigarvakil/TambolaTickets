"use client";

import { useEffect, useState } from "react";
import { callText, LANGUAGES, type CallLanguage } from "./numberCall";

function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Best installed voice for a BCP 47 tag: exact match, then same base language. */
export function findVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
  const norm = (s: string) => s.replace("_", "-").toLowerCase();
  const target = norm(lang);
  const base = target.split("-")[0];
  return (
    voices.find((v) => norm(v.lang) === target) ??
    voices.find((v) => norm(v.lang).split("-")[0] === base)
  );
}

/** Installed speech voices; updates when the browser finishes loading them. */
export function useVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!speechSupported()) return;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);
  return voices;
}

/** Speak a number in each language, one after another, in the given order. */
export function speakCall(n: number, languages: CallLanguage[]): void {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = synth.getVoices();
  for (const lang of languages) {
    const { speechLang } = LANGUAGES[lang];
    const utterance = new SpeechSynthesisUtterance(callText(n, lang));
    utterance.lang = speechLang;
    const voice = findVoice(voices, speechLang);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    synth.speak(utterance);
  }
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
