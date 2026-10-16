"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, newPasswordSchema, nextPathSchema, signInSchema, signUpSchema } from "@/lib/validations/auth";
import { errorState, fieldErrorState, successState } from "@/lib/form";
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

// Always reports success, so the form can't be used to find out which emails have an account.
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const origin = (await headers()).get("origin") ?? "";
  const next = localePath(await getRequestLocale(), "/reset-password");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
  });
  if (error?.code === "over_email_send_rate_limit") return errorState("auth.errors.rateLimited");

  return { status: "success", message: "auth.resetEmailSent", params: { email: parsed.data.email } };
}

// Second half of the reset: the recovery link signed the user in, now they choose a new password.
export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return errorState("auth.recoveryLinkInvalid");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return errorState("auth.errors.samePassword");
    if (error.code === "weak_password") return errorState("auth.errors.weakPassword");
    return errorState(error.message);
  }
  return successState("auth.passwordUpdated");
}
