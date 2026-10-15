"use server";

import { headers } from "next/headers";
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
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return errorState("auth.errors.emailNotConfirmed");
    }
    return errorState("auth.errors.wrongCredentials");
  }

  redirect(localePath(await getRequestLocale(), nextPathSchema.parse(formData.get("next"))));
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
  const next = localePath(await getRequestLocale(), nextPathSchema.parse(formData.get("next")));
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
    if (error.code === "user_already_exists") return errorState("auth.errors.userExists");
    if (error.code === "weak_password") return errorState("auth.errors.weakPassword");
    return errorState(error.message);
  }

  // Email confirmation off: the user is signed in straight away.
  if (data.session) redirect(next);

  return { status: "success", message: "auth.checkEmail", params: { email: parsed.data.email } };
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(localePath(await getRequestLocale(), "/"));
}
