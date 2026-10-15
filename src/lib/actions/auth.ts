"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { nextPathSchema, signInSchema, signUpSchema } from "@/lib/validations/auth";
import { errorState, fieldErrorState, successState } from "@/lib/form";
import type { FormState } from "@/types";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return errorState("Confirm your email first. Check your inbox for the link we sent.");
    }
    return errorState("Wrong email or password");
  }

  redirect(nextPathSchema.parse(formData.get("next")));
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const origin = (await headers()).get("origin") ?? "";
  const next = nextPathSchema.parse(formData.get("next"));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists") return errorState("An account with this email already exists. Sign in instead.");
    if (error.code === "weak_password") return errorState("Choose a stronger password");
    return errorState(error.message);
  }

  // Email confirmation off: the user is signed in straight away.
  if (data.session) redirect(next);

  return successState(`We sent a confirmation link to ${parsed.data.email}. Open it to activate your account.`);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
