import "server-only";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import type { LangParams, Locale } from "@/types/i18n";

// The proxy keeps NEXT_LOCALE in sync with the URL, so Server Actions know which language to redirect to.
export async function getRequestLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function resolveLang(params: LangParams): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}
