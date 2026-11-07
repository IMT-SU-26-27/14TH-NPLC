"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { nextPathSchema, signInSchema, signUpSchema } from "@/lib/validations/auth";
import { errorState, fieldErrorState } from "@/lib/form";
import { localePath } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import type { FormState } from "@/types";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Only accounts made while "Confirm email" was still on. No email is sent, so the committee activates them.
    if (error.code === "email_not_confirmed") return errorState("auth.errors.notActivated");
    return errorState("auth.errors.wrongCredentials");
  }

  // LO accounts only have the post pages. Going there directly keeps the URL right, unlike a second redirect from the proxy.
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  const target = profile?.role === "lo" ? "/lo" : nextPathSchema.parse(formData.get("next"));
  redirect(localePath(await getRequestLocale(), target));
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const next = localePath(await getRequestLocale(), nextPathSchema.parse(formData.get("next")));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });

  if (error) {
    if (error.code === "user_already_exists") return errorState("auth.errors.userExists");
    if (error.code === "weak_password") return errorState("auth.errors.weakPassword");
    return errorState(error.message);
  }

  // "Confirm email" is off in Supabase Auth, so sign-up returns a session and the user is signed in straight away.
  // No session means Auth still asks for confirmation, which this site never sends.
  if (!data.session) return errorState("auth.errors.notActivated");
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(localePath(await getRequestLocale(), "/"));
}
