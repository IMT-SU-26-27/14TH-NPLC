"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { deleteAsset, privateAssetUrl } from "@/lib/cloudinary/server";
import { notifyRegistrationReviewed } from "@/lib/push/notify";
import { databaseErrorMessage, errorState, fieldErrorState, successState } from "@/lib/form";
import { localePath } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import {
  adminCreateRegistrationSchema,
  reviewRegistrationSchema,
  updateTeamNameSchema,
  uuidSchema,
} from "@/lib/validations/admin";
import type { ActionResult, FormState } from "@/types";

async function isAdmin() {
  return (await getCurrentUser())?.role === "admin";
}

const NOT_ADMIN = "errors.adminOnly";

export async function reviewRegistration(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = reviewRegistrationSchema.safeParse({
    registrationId: formData.get("registrationId"),
    status: formData.get("status"),
    rejectionReason: formData.get("rejectionReason") ?? undefined,
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const { registrationId, status, rejectionReason } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("registrations")
    .update({ status, rejection_reason: status === "rejected" ? rejectionReason : null })
    .eq("id", registrationId);
  if (error) return errorState(databaseErrorMessage(error));

  if (status === "accepted" || status === "rejected") after(() => notifyRegistrationReviewed(registrationId));
  refresh();
  return successState(
    status === "accepted" ? "admin.detail.accepted" : status === "rejected" ? "admin.detail.rejected" : "admin.detail.statusUpdated",
  );
}

export async function updateTeamName(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = updateTeamNameSchema.safeParse({
    registrationId: formData.get("registrationId"),
    teamName: formData.get("teamName"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("registrations")
    .update({ team_name: parsed.data.teamName })
    .eq("id", parsed.data.registrationId);
  if (error) return errorState(databaseErrorMessage(error));

  refresh();
  return successState("admin.detail.renamed");
}

export async function adminCreateRegistration(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = adminCreateRegistrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrorState(parsed.error);
  const input = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data: leader } = await supabase.from("profiles").select("id, email").eq("email", input.leaderEmail).maybeSingle();
  if (!leader) {
    return { status: "error", fieldErrors: { leaderEmail: [{ message: "admin.create.noLeaderAccount" }] } };
  }

  const { data: registration, error } = await supabase
    .from("registrations")
    .insert({ competition_id: input.competitionId, leader_id: leader.id, team_name: input.teamName })
    .select("id")
    .single();
  if (error) return errorState(databaseErrorMessage(error));

  const { error: memberError } = await supabase.from("registration_members").insert({
    registration_id: registration.id,
    competition_id: input.competitionId,
    user_id: leader.id,
    is_leader: true,
    full_name: input.leaderName,
    email: leader.email,
    phone: input.leaderPhone,
    nisn: input.leaderNisn,
  });
  if (memberError) {
    await supabase.from("registrations").delete().eq("id", registration.id);
    return errorState(databaseErrorMessage(memberError));
  }

  redirect(localePath(await getRequestLocale(), `/admin/registrations/${registration.id}`));
}

export async function adminRemoveMember(memberId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(memberId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("registration_members").delete().eq("id", id.data);
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  refresh();
  return { ok: true, data: undefined };
}

export async function adminDeleteRegistration(registrationId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(registrationId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("registrations").delete().eq("id", id.data).select("payment_proof_public_id");
  if (error) return { ok: false, message: databaseErrorMessage(error) };
  if (data?.[0]?.payment_proof_public_id) await deleteAsset(data[0].payment_proof_public_id, "authenticated");

  redirect(localePath(await getRequestLocale(), "/admin/registrations"));
}

// Short-lived link to the private payment proof.
export async function getPaymentProofUrl(registrationId: string): Promise<ActionResult<string>> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(registrationId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("registrations")
    .select("payment_proof_public_id, payment_proof_format")
    .eq("id", id.data)
    .single();
  if (!data?.payment_proof_public_id || !data.payment_proof_format) return { ok: false, message: "admin.detail.noProof" };

  return { ok: true, data: privateAssetUrl(data.payment_proof_public_id, data.payment_proof_format) };
}
