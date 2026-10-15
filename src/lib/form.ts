import { z } from "zod";
import type { FieldErrors, FormState } from "@/types";

export const initialFormState: FormState = { status: "idle" };

export function fieldErrorState(error: z.ZodError, message = "Please fix the highlighted fields"): FormState {
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

// Maps Postgres errors raised by the schema (RAISE EXCEPTION, constraints) to a readable message.
export function databaseErrorMessage(error: { code?: string; message: string }): string {
  if (error.code === "23505") {
    if (error.message.includes("nisn")) return "This NISN is already registered in this competition";
    if (error.message.includes("email")) return "This email is already registered in this competition";
    if (error.message.includes("team_name")) return "That team name is already taken in this competition";
    if (error.message.includes("competition_level")) return "Another problem already uses this level number";
    if (error.message.includes("slug")) return "Another competition already uses this slug";
  }
  if (error.code === "42501" && error.message.includes("row-level security")) {
    return "You don't have permission to do that";
  }
  return error.message;
}
