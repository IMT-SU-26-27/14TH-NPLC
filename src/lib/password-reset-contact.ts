import type { ContactPerson } from "@/types/auth";

// No password reset email: participants who forget their password message this person, who resets it by hand.
// Placeholder until the committee picks the contact person.
export const PASSWORD_RESET_CONTACT: ContactPerson = {
  name: "Contact Person NPLC",
  lineId: "line-id-cp",
};

// LINE's add-friend link for a LINE ID.
export function lineProfileUrl(lineId: string): string {
  return `https://line.me/ti/p/~${encodeURIComponent(lineId)}`;
}
