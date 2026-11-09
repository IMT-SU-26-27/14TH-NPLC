"use server";

import { refresh, updateTag } from "next/cache";
import { COMPETITIONS_TAG } from "@/lib/data/competitions";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { hasRegistration } from "@/lib/data/registrations";
import { deleteAsset, newRegistrationProofFolder, paymentProofFolder, signUpload, uploadErrorKey, verifyUpload } from "@/lib/cloudinary/server";
import { PAYMENT_PROOF_FORMATS_ALLOWED, PAYMENT_PROOF_MAX_BYTES } from "@/lib/upload-limits";
import { databaseErrorMessage, databaseErrorState, errorState, fieldErrorState } from "@/lib/form";
import { notifyAdminsPaymentToReview, notifyLeaderMemberJoined } from "@/lib/push/notify";
import { localePath } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
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

const PROOF_RULES = { maxBytes: PAYMENT_PROOF_MAX_BYTES, formats: PAYMENT_PROOF_FORMATS_ALLOWED };

export async function createRegistration(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = createRegistrationSchema.safeParse({
    competitionId: formData.get("competitionId"),
    paymentProofPublicId: formData.get("paymentProofPublicId"),
    paymentProofFormat: formData.get("paymentProofFormat"),
    teamName: formData.get("teamName"),
    school: formData.get("school"),
    leaderName: formData.get("leaderName"),
    leaderPhone: formData.get("leaderPhone"),
    leaderNisn: formData.get("leaderNisn"),
    twibbonPostUrl: formData.get("twibbonPostUrl") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const user = await getCurrentUser();
  if (!user) return errorState("errors.signInAgain");
  const { paymentProofPublicId: publicId } = parsed.data;
  // Read back from Cloudinary: in this user's folder, at most 5 MB, an allowed format. Rejected files are deleted.
  const proof = await verifyUpload(publicId, "authenticated", newRegistrationProofFolder(user.id), PROOF_RULES);
  if (await hasRegistration(user.id)) {
    if (proof.ok) await deleteAsset(publicId, "authenticated");
    return errorState("errors.alreadyOnTeam");
  }
  if (!proof.ok) return errorState(uploadErrorKey(proof.reason));
  const format = proof.format;

  const supabase = await createSupabaseServerClient();
  const { data: registrationId, error } = await supabase.rpc("create_registration", {
    p_competition_id: parsed.data.competitionId,
    p_team_name: parsed.data.teamName,
    p_school: parsed.data.school,
    // LINE ID is no longer collected; older teams keep theirs.
    p_line_id: null,
    p_leader_name: parsed.data.leaderName,
    p_leader_phone: parsed.data.leaderPhone,
    p_leader_nisn: parsed.data.leaderNisn,
    p_payment_proof_public_id: publicId,
    p_payment_proof_format: format,
    // The twibbon proof is a link to the Instagram post; nothing is uploaded for it any more.
    p_twibbon_post_url: parsed.data.twibbonPostUrl,
  });
  if (error) {
    await deleteAsset(publicId, "authenticated");
    return databaseErrorState(error, { "errors.duplicateNisn": "leaderNisn" });
  }

  after(() => notifyAdminsPaymentToReview(registrationId, false));
  updateTag(COMPETITIONS_TAG);
  redirect(localePath(await getRequestLocale(), "/dashboard"));
}

export async function joinTeam(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = joinTeamSchema.safeParse({
    referralCode: formData.get("referralCode"),
    fullName: formData.get("fullName"),
    nisn: formData.get("nisn"),
    phone: formData.get("phone") ?? "",
    twibbonPostUrl: formData.get("twibbonPostUrl") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const user = await getCurrentUser();
  if (!user) return errorState("errors.signInAgain");
  if (await hasRegistration(user.id)) return errorState("errors.alreadyOnTeam");

  const supabase = await createSupabaseServerClient();
  const { data: registrationId, error } = await supabase.rpc("join_team", {
    p_referral_code: parsed.data.referralCode,
    p_full_name: parsed.data.fullName,
    p_nisn: parsed.data.nisn,
    p_phone: parsed.data.phone,
    p_twibbon_post_url: parsed.data.twibbonPostUrl,
  });
  if (error) return databaseErrorState(error, { "errors.duplicateNisn": "nisn" });

  after(() => notifyLeaderMemberJoined(registrationId, parsed.data.fullName));
  redirect(localePath(await getRequestLocale(), "/dashboard"));
}

// Leader removes a member, or a member removes themselves (RLS decides which rows they may delete).
export async function removeMember(memberId: string): Promise<ActionResult> {
  const id = registrationIdSchema.safeParse(memberId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  // Members are fixed once the team is accepted (changes go through the contact person). RLS enforces the same.
  const { data: member } = await supabase.from("registration_members").select("registration:registrations ( status )").eq("id", id.data).maybeSingle();
  if (member?.registration?.status === "accepted") return { ok: false, message: "errors.membersLocked" };
  const { data, error } = await supabase.from("registration_members").delete().eq("id", id.data).select("twibbon_proof_public_id");
  if (error) return { ok: false, message: databaseErrorMessage(error) };
  if (!data?.length) return { ok: false, message: "errors.cannotRemoveMember" };
  if (data[0].twibbon_proof_public_id) await deleteAsset(data[0].twibbon_proof_public_id, "authenticated");

  refresh();
  return { ok: true, data: undefined };
}

// Signature for the payment proof uploaded with a new registration (before the team exists).
export async function getNewRegistrationUploadSignature(): Promise<ActionResult<CloudinaryUploadSignature>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "errors.signInAgain" };
  if (await hasRegistration(user.id)) return { ok: false, message: "errors.alreadyOnTeam" };
  return { ok: true, data: signUpload(newRegistrationProofFolder(user.id), "authenticated", PAYMENT_PROOF_FORMATS.join(",")) };
}

// Signature for re-uploading a rejected team's payment proof straight from the browser to Cloudinary.
export async function getPaymentUploadSignature(registrationId: string): Promise<ActionResult<CloudinaryUploadSignature>> {
  const id = registrationIdSchema.safeParse(registrationId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "errors.signInAgain" };

  const supabase = await createSupabaseServerClient();
  const { data: team } = await supabase
    .from("registrations")
    .select("leader_id, status")
    .eq("id", id.data)
    .single();
  if (!team || team.leader_id !== user.id) return { ok: false, message: "errors.leaderOnly" };
  if (team.status !== "rejected" && team.status !== "pending_payment") {
    return { ok: false, message: "errors.paymentAlreadySubmitted" };
  }

  return { ok: true, data: signUpload(paymentProofFolder(id.data), "authenticated", PAYMENT_PROOF_FORMATS.join(",")) };
}

// Attaches the uploaded proof and sends the registration for review.
export async function submitPayment(input: SubmitPaymentInput): Promise<ActionResult> {
  const parsed = submitPaymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "errors.uploadAgain" };

  const { registrationId, publicId } = parsed.data;
  const proof = await verifyUpload(publicId, "authenticated", paymentProofFolder(registrationId), PROOF_RULES);
  if (!proof.ok) return { ok: false, message: uploadErrorKey(proof.reason) };
  const format = proof.format;

  const supabase = await createSupabaseServerClient();
  const { data: previous } = await supabase
    .from("registrations")
    .select("payment_proof_public_id, status")
    .eq("id", registrationId)
    .single();

  const { data, error } = await supabase
    .from("registrations")
    .update({ payment_proof_public_id: publicId, payment_proof_format: format, status: "under_review" })
    .eq("id", registrationId)
    .select("id");
  if (error) {
    // Refused (e.g. the team quota is full): the new upload is not used anywhere.
    await deleteAsset(publicId, "authenticated");
    return { ok: false, message: databaseErrorMessage(error) };
  }
  if (!data?.length) return { ok: false, message: "errors.leaderOnly" };

  if (previous?.payment_proof_public_id && previous.payment_proof_public_id !== publicId) {
    await deleteAsset(previous.payment_proof_public_id, "authenticated");
  }
  after(() => notifyAdminsPaymentToReview(registrationId, previous?.status === "rejected"));
  updateTag(COMPETITIONS_TAG);
  refresh();
  return { ok: true, data: undefined, message: "payment.submitted" };
}
