"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { assetExists, deleteAsset, paymentProofFolder, signUpload } from "@/lib/cloudinary/server";
import { databaseErrorMessage, errorState, fieldErrorState } from "@/lib/form";
import {
  createRegistrationSchema,
  joinTeamSchema,
  PAYMENT_PROOF_FORMATS,
  registrationIdSchema,
  submitPaymentSchema,
} from "@/lib/validations/registration";
import type { ActionResult, FormState } from "@/types";
import type { CloudinaryUploadSignature } from "@/types/cloudinary";
import type { SubmitPaymentInput } from "@/types/registration";

export async function createRegistration(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = createRegistrationSchema.safeParse({
    competitionId: formData.get("competitionId"),
    teamName: formData.get("teamName"),
    leaderName: formData.get("leaderName"),
    leaderPhone: formData.get("leaderPhone"),
    leaderNisn: formData.get("leaderNisn"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("create_registration", {
    p_competition_id: parsed.data.competitionId,
    p_team_name: parsed.data.teamName,
    p_leader_name: parsed.data.leaderName,
    p_leader_phone: parsed.data.leaderPhone,
    p_leader_nisn: parsed.data.leaderNisn,
  });
  if (error) return errorState(databaseErrorMessage(error));

  redirect("/dashboard");
}

export async function joinTeam(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = joinTeamSchema.safeParse({
    referralCode: formData.get("referralCode"),
    fullName: formData.get("fullName"),
    nisn: formData.get("nisn"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("join_team", {
    p_referral_code: parsed.data.referralCode,
    p_full_name: parsed.data.fullName,
    p_nisn: parsed.data.nisn,
    p_phone: parsed.data.phone,
  });
  if (error) return errorState(databaseErrorMessage(error));

  redirect("/dashboard");
}

// Leader removes a member, or a member removes themselves (RLS decides which rows they may delete).
export async function removeMember(memberId: string): Promise<ActionResult> {
  const id = registrationIdSchema.safeParse(memberId);
  if (!id.success) return { ok: false, message: "Invalid member" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("registration_members").delete().eq("id", id.data).select("id");
  if (error) return { ok: false, message: databaseErrorMessage(error) };
  if (!data?.length) return { ok: false, message: "You can't remove this member right now" };

  refresh();
  return { ok: true, data: undefined };
}

export async function deleteRegistration(registrationId: string): Promise<ActionResult> {
  const id = registrationIdSchema.safeParse(registrationId);
  if (!id.success) return { ok: false, message: "Invalid team" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("registrations")
    .delete()
    .eq("id", id.data)
    .select("payment_proof_public_id");
  if (error) return { ok: false, message: databaseErrorMessage(error) };
  if (!data?.length) return { ok: false, message: "Only the leader can delete a team before payment is submitted" };

  if (data[0].payment_proof_public_id) await deleteAsset(data[0].payment_proof_public_id, "authenticated");
  refresh();
  return { ok: true, data: undefined };
}

// Signature for uploading this team's payment proof straight from the browser to Cloudinary.
export async function getPaymentUploadSignature(registrationId: string): Promise<ActionResult<CloudinaryUploadSignature>> {
  const id = registrationIdSchema.safeParse(registrationId);
  if (!id.success) return { ok: false, message: "Invalid team" };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in again to upload" };

  const supabase = await createSupabaseServerClient();
  const { data: team } = await supabase
    .from("registrations")
    .select("leader_id, status")
    .eq("id", id.data)
    .single();
  if (!team || team.leader_id !== user.id) return { ok: false, message: "Only the team leader can upload the payment proof" };
  if (team.status !== "pending_payment" && team.status !== "rejected") {
    return { ok: false, message: "Payment was already submitted for this team" };
  }

  return { ok: true, data: signUpload(paymentProofFolder(id.data), "authenticated", PAYMENT_PROOF_FORMATS.join(",")) };
}

// Attaches the uploaded proof and sends the registration for review.
export async function submitPayment(input: SubmitPaymentInput): Promise<ActionResult> {
  const parsed = submitPaymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Upload the payment proof again" };

  const { registrationId, publicId, format } = parsed.data;
  if (!publicId.startsWith(`${paymentProofFolder(registrationId)}/`) || !(await assetExists(publicId, "authenticated"))) {
    return { ok: false, message: "We couldn't find that upload. Try uploading the proof again." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: previous } = await supabase
    .from("registrations")
    .select("payment_proof_public_id")
    .eq("id", registrationId)
    .single();

  const { data, error } = await supabase
    .from("registrations")
    .update({ payment_proof_public_id: publicId, payment_proof_format: format, status: "under_review" })
    .eq("id", registrationId)
    .select("id");
  if (error) return { ok: false, message: databaseErrorMessage(error) };
  if (!data?.length) return { ok: false, message: "Only the team leader can submit the payment" };

  if (previous?.payment_proof_public_id && previous.payment_proof_public_id !== publicId) {
    await deleteAsset(previous.payment_proof_public_id, "authenticated");
  }
  refresh();
  return { ok: true, data: undefined, message: "Payment submitted. An admin will review it soon." };
}
