"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, newPasswordSchema, nextPathSchema, signInSchema, signUpSchema } from "@/lib/validations/auth";
import { errorState, fieldErrorState, successState } from "@/lib/form";
import { localePath } from "@/lib/i18n/config";
import { originFromHeaders } from "@/lib/request-origin";
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
    // Only accounts made while "Confirm email" was still on. No confirmation email is sent, so the committee activates them.
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
  // No session means Auth still asks for confirmation, which this site never sends (SMTP is for password resets only).
  if (!data.session) return errorState("auth.errors.notActivated");
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(localePath(await getRequestLocale(), "/"));
}

// The only email the site sends. Always reports success, so the form can't be used to find out which emails have an account.
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fieldErrorState(parsed.error);

  // The browser sends Origin on the action POST; the Host header is the fallback
  // when it is absent, so the reset link never points at the container's address.
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") || originFromHeaders(requestHeaders);
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
