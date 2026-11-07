import { z } from "zod";
import type { FieldErrors, FormState } from "@/types";

// Server Actions return dictionary keys; client components translate them with useI18n().

export const initialFormState: FormState = { status: "idle" };

export function fieldErrorState(error: z.ZodError, message = "validation.fixFields"): FormState {
  const fieldErrors: FieldErrors = {};
  for (const [field, messages] of Object.entries(z.flattenError(error).fieldErrors)) {
    fieldErrors[field] = (messages as string[] | undefined)?.map((m) => ({ message: m }));
  }
  return { status: "error", message, fieldErrors };
}

export function errorState(message: string): FormState {
  return { status: "error", message };
}

export function successState(message: string): FormState {
  return { status: "success", message };
}

// Messages raised by the schema's RAISE EXCEPTION statements, matched by prefix.
const RAISED: [string, string][] = [
  ["You are already on a team", "errors.alreadyOnTeam"],
  ["The leader is already on this team", "errors.alreadyOnTeam"],
  ["Registration for this competition is closed", "errors.registrationClosed"],
  ["No team has this code", "errors.teamNotFound"],
  ["This team is no longer accepting members", "errors.teamNotAccepting"],
  ["This team already has the maximum", "errors.teamFull"],
  ["The team name cannot be changed", "errors.teamNameLocked"],
  ["This registration can no longer be edited", "errors.registrationLocked"],
  ["Only an admin can", "errors.adminOnly"],
  ["Admins only", "errors.adminOnly"],
  ["Upload the payment proof before submitting", "errors.proofRequired"],
  ["School and LINE ID are required", "validation.fixFields"],
  ["Upload the twibbon proof before submitting", "errors.twibbonRequired"],
  ["LO accounts cannot join a team", "errors.loCannotJoin"],
  ["You are not assigned to this post", "rally.errors.notAssigned"],
  ["The Rally session is not open", "rally.errors.sessionNotOpen"],
  ["This post is not active", "rally.errors.postInactive"],
  ["No team matches this code", "rally.errors.teamNotFound"],
  ["This team is not in this competition", "rally.errors.wrongCompetition"],
  ["This team has not been accepted", "rally.errors.notAccepted"],
  ["This post does not allow a draw", "rally.errors.noDraw"],
  ["This team already has a result at this post", "rally.errors.duplicate"],
  ["Only the LO who recorded a result can undo it", "rally.errors.notOwner"],
  ["This result was already cancelled", "rally.errors.alreadyCancelled"],
  ["The undo window has passed", "rally.errors.undoExpired"],
  ["A reason is required", "rally.errors.reasonRequired"],
  ["The new result is the same as the old one", "rally.errors.sameOutcome"],
  ["Only LO accounts can be assigned to a post", "errors.invalidRequest"],
  ["This competition needs", "errors.teamSize"],
  ["A team needs exactly one leader", "errors.teamSize"],
  ["The team leader cannot be removed", "errors.leaderProtected"],
  ["Sign in to", "errors.signInAgain"],
];

// Maps Postgres errors (RAISE EXCEPTION, constraints) to a dictionary key.
// Unknown messages pass through unchanged and are shown as-is.
export function databaseErrorMessage(error: { code?: string; message: string }): string {
  const raised = RAISED.find(([prefix]) => error.message.startsWith(prefix));
  if (raised) return raised[1];
  if (error.code === "23505") {
    if (error.message.includes("nisn")) return "errors.duplicateNisn";
    if (error.message.includes("email")) return "errors.duplicateEmail";
    if (error.message.includes("team_name")) return "errors.duplicateTeamName";
    if (error.message.includes("competition_level")) return "errors.duplicateLevel";
    if (error.message.includes("slug")) return "errors.duplicateSlug";
    if (error.message.includes("rally_posts_competition_name")) return "errors.duplicateRallyPost";
    if (error.message.includes("members_user") || error.message.includes("competition_leader")) return "errors.alreadyOnTeam";
  }
  if (error.code === "42501") return "errors.permission";
  return error.message;
}
