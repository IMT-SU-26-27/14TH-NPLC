import { en } from "@/lib/i18n/dictionaries/en";
import { id } from "@/lib/i18n/dictionaries/id";
import { translate } from "@/lib/i18n/translate";
import type { Dictionary, Locale, TranslateParams } from "@/types/i18n";

const DICTIONARIES: Record<Locale, Dictionary> = { id, en };

export function getDictionary(lang: Locale): Dictionary {
  return DICTIONARIES[lang];
}

// Server-side shortcut: const t = getT(lang); t("auth.signIn")
export function getT(lang: Locale) {
  const dict = DICTIONARIES[lang];
  return (key: string, params?: TranslateParams) => translate(dict, key, params);
}
