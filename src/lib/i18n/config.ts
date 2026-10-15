import type { Locale } from "@/types/i18n";

export const LOCALES = ["id", "en"] as const;
export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_LABEL: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

export const INTL_LOCALE: Record<Locale, string> = {
  id: "id-ID",
  en: "en-GB",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

// "/dashboard" -> "/id/dashboard". Paths that already carry a locale are returned unchanged.
export function localePath(lang: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const first = clean.split("/")[1];
  if (isLocale(first)) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

// "/en/dashboard?x=1" -> "/dashboard?x=1"
export function stripLocale(path: string): string {
  const [, first, ...rest] = path.split("/");
  if (!isLocale(first)) return path;
  return `/${rest.join("/")}`;
}
