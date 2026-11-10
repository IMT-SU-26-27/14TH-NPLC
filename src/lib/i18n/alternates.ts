import type { Metadata } from "next";
import { LOCALES } from "@/lib/i18n/config";

// hreflang links for a public page: the same page in every language, e.g. /id/login <-> /en/login.
// `path` is the route without the language prefix ("" for Home).
export function languageAlternates(path: string): Metadata["alternates"] {
  return { languages: Object.fromEntries(LOCALES.map((lang) => [lang, `/${lang}${path}`])) };
}
