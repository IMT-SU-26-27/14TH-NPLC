import { INTL_LOCALE } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/types/i18n";

export function formatRupiah(amount: number, lang: Locale): string {
  // Registering always means paying, so 0 means the admin hasn't set the fee yet.
  if (amount === 0) return getT(lang)("common.feeTba");
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export function formatDateTime(value: string | null, lang: Locale): string {
  if (!value) return "—";
  const formatted = new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
  return `${formatted} WIB`;
}

export function formatTeamSize(min: number, max: number, lang: Locale): string {
  const t = getT(lang);
  return min === max ? t("competition.person", { count: min }) : t("competition.people", { min, max });
}

// Value for <input type="datetime-local">, in WIB.
export function toWibInputValue(value: string | null): string {
  if (!value) return "";
  const wib = new Date(new Date(value).getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 16);
}

// "12 Nov 2026" or "12–14 Nov 2026" for date-only values (no time zone shift).
export function formatDateRange(start: string, end: string | null, lang: Locale): string {
  const fmt = new Intl.DateTimeFormat(INTL_LOCALE[lang], { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const from = new Date(`${start}T00:00:00Z`);
  if (!end || end === start) return fmt.format(from);
  return fmt.formatRange(from, new Date(`${end}T00:00:00Z`));
}
