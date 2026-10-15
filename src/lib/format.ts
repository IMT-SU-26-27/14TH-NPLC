const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatRupiah(amount: number): string {
  return amount === 0 ? "Free" : rupiah.format(amount);
}

export function formatDateTime(value: string | null): string {
  return value ? `${dateTime.format(new Date(value))} WIB` : "—";
}

export function formatTeamSize(min: number, max: number): string {
  if (min === max) return `${min} ${min === 1 ? "person" : "people"}`;
  return `${min}–${max} people`;
}

export const COMPETITION_TYPE_LABEL = {
  competitive_programming: "Competitive programming",
  logic: "Logic",
} as const;
