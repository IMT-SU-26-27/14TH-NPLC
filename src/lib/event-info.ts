// Event facts the website shows that the database doesn't store yet.
// Fill in the nulls when the committee confirms them; the page hides what is still missing.

// Early bird price from the design's "05 // Biaya" section. The amount to pay comes from
// currentFee() in src/lib/pricing.ts, so the homepage and the registration form always agree.
export const EARLY_BIRD = {
  fee: 85_000,
  // Date-only, WIB. The price is valid through the whole last day.
  startsOn: "2026-11-10",
  endsOn: "2026-11-23",
} as const;

export const GUIDEBOOK_URL: string | null = null;

// One contact person per competition. `label` is the short competition name shown in every language;
// `whatsapp` is the international format without "+" or spaces.
export const COMMITTEE_CONTACTS = [
  { label: "Programming", name: "Jae", whatsapp: "6281232626369", display: "0812-3262-6369" },
  { label: "Rally", name: "Caca", whatsapp: "6289506677376", display: "0895-0667-7376" },
] as const;

export const INSTAGRAM = {
  handle: "@ucnplc",
  url: "https://www.instagram.com/ucnplc/",
} as const;

// End of the early bird's last day in WIB, as an instant.
export function earlyBirdEndsAt(): Date {
  return new Date(`${EARLY_BIRD.endsOn}T23:59:59+07:00`);
}

export function isEarlyBird(now: Date): boolean {
  return now >= new Date(`${EARLY_BIRD.startsOn}T00:00:00+07:00`) && now <= earlyBirdEndsAt();
}

export function whatsappUrl(number: string): string {
  return `https://wa.me/${number}`;
}
