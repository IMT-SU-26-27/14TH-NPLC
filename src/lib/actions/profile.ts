"use server";

import { refresh } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { databaseErrorMessage, errorState, fieldErrorState, successState } from "@/lib/form";
import { changePasswordSchema, profileSchema } from "@/lib/validations/profile";
import type { FormState } from "@/types";

// Only the account name. Team member rows keep the name given when joining each team.
export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = profileSchema.safeParse({ fullName: formData.get("fullName") });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return errorState("errors.signInAgain");

  const { error } = await supabase.from("profiles").update({ full_name: parsed.data.fullName }).eq("id", user.id);
  if (error) return errorState(databaseErrorMessage(error));

  refresh();
  return successState("profile.saved");
}

// Signed-in password change. The current password is checked first, so an unlocked
// device left open can't be used to take over the account.
export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return errorState("errors.signInAgain");

  const { error: wrong } = await supabase.auth.signInWithPassword({ email: user.email, password: parsed.data.currentPassword });
  if (wrong) {
    return { status: "error", fieldErrors: { currentPassword: [{ message: "profile.wrongCurrentPassword" }] } };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return errorState("auth.errors.samePassword");
    if (error.code === "weak_password") return errorState("auth.errors.weakPassword");
    return errorState(error.message);
  }
  return successState("profile.passwordChanged");
}
