import type { CurrentUser } from "@/types/auth";

// Web push for participants (dashboard prompt and the Profile switch). Off for the launch: it is not in design v86
// (07 Dashboard, 12 Profile) and has not been tested end to end yet. Admins keep it, so they hear about new
// payment proofs. With it off, participants never register the service worker or see a permission prompt; the
// server still sends to whoever is subscribed, which is then only admins.
export const PARTICIPANT_PUSH_ENABLED = false;

export function pushEnabledFor(role: CurrentUser["role"]): boolean {
  return PARTICIPANT_PUSH_ENABLED || role === "admin";
}
