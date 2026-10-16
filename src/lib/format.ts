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

// With seconds, for judging records where the order of submissions matters.
export function formatTimestamp(value: string, lang: Locale): string {
  const formatted = new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    dateStyle: "medium",
    timeStyle: "medium",
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

// Scores in the locale's own decimal style, at most two decimals: "95", "95,5" (id) / "95.5" (en).
export function formatScore(value: number, lang: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[lang], { maximumFractionDigits: 2 }).format(value);
}

// 3725 -> "01:02:05". Hours keep counting past 24 (a contest is at most 48 hours).
export function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

// 9000 -> "2 jam 30 menit" / "2 h 30 min".
export function formatDuration(seconds: number, lang: Locale): string {
  const t = getT(lang);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [
    h > 0 && t("cp.duration.hours", { count: h }),
    m > 0 && t("cp.duration.minutes", { count: m }),
    s > 0 && t("cp.duration.seconds", { count: s }),
  ].filter(Boolean);
  return parts.join(" ");
}
