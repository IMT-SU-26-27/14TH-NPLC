import { EARLY_BIRD, isEarlyBird } from "@/lib/event-info";

// The amount a team pays right now. Every page that shows a price calls this, so the homepage,
// the competition cards and the payment instructions never disagree.
export function currentFee(normalFee: number, now = new Date()): number {
  return isEarlyBird(now) ? Math.min(EARLY_BIRD.fee, normalFee) : normalFee;
}
