import type { CommitteeContact } from "@/types/landing";

// Event facts the homepage shows that the database doesn't store yet.
// Fill in the nulls when the committee confirms them; the page hides what is still missing.

// Early bird price from the Figma "05 // Biaya" section. The registration form still charges
// competitions.fee, so keep this in sync with whatever the committee sets there.
export const EARLY_BIRD = {
  fee: 85_000,
  // Date-only, WIB. The price is valid through the whole last day.
  startsOn: "2026-11-10",
  endsOn: "2026-11-23",
} as const;

export const GUIDEBOOK_URL: string | null = null;

// WhatsApp number in international format without "+" or spaces, e.g. "6281234567890".
export const COMMITTEE_CONTACT: CommitteeContact = {
  name: null,
  whatsapp: null,
};

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
