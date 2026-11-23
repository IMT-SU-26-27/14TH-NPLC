"use server";

import { refresh, updateTag } from "next/cache";
import { COMPETITIONS_TAG } from "@/lib/data/competitions";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { hasRegistration } from "@/lib/data/registrations";
import { zipSync } from "fflate";
import { deleteAsset, privateAssetUrl } from "@/lib/cloudinary/server";
import { proofFileNames } from "@/lib/proof-file-name";
import { registrationsXlsx } from "@/lib/registrations-xlsx";
import { notifyRegistrationReviewed } from "@/lib/push/notify";
import { databaseErrorMessage, errorState, fieldErrorState, successState } from "@/lib/form";
import { localePath } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import {
  adminCreateRegistrationSchema,
  disqualifySchema,
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
  updateTag(COMPETITIONS_TAG);
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

// Disqualifies an accepted team with a reason it reads on its dashboard. Results are kept; it can be lifted.
export async function disqualifyTeam(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = disqualifySchema.safeParse({
    registrationId: formData.get("registrationId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("registrations")
    .update({ disqualification_reason: parsed.data.reason })
    .eq("id", parsed.data.registrationId);
  if (error) return errorState(databaseErrorMessage(error));

  refresh();
  return successState("admin.detail.disqualified");
}

export async function liftDisqualification(registrationId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(registrationId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("registrations").update({ disqualification_reason: null }).eq("id", id.data);
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  refresh();
  return { ok: true, data: undefined, message: "admin.detail.disqualificationLifted" };
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
  if (await hasRegistration(leader.id)) {
    return { status: "error", fieldErrors: { leaderEmail: [{ message: "admin.create.leaderAlreadyRegistered" }] } };
  }

  const { data: registration, error } = await supabase
    .from("registrations")
    .insert({ competition_id: input.competitionId, leader_id: leader.id, team_name: input.teamName, school: input.school })
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

  updateTag(COMPETITIONS_TAG);
  redirect(localePath(await getRequestLocale(), `/admin/registrations/${registration.id}`));
}

export async function adminRemoveMember(memberId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(memberId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("registration_members").delete().eq("id", id.data).select("twibbon_proof_public_id");
  if (error) return { ok: false, message: databaseErrorMessage(error) };
  if (data?.[0]?.twibbon_proof_public_id) await deleteAsset(data[0].twibbon_proof_public_id, "authenticated");

  refresh();
  return { ok: true, data: undefined };
}

export async function adminDeleteRegistration(registrationId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(registrationId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  // Read before deleting: members go with the registration.
  const { data: members } = await supabase.from("registration_members").select("twibbon_proof_public_id").eq("registration_id", id.data);
  const { data, error } = await supabase.from("registrations").delete().eq("id", id.data).select("payment_proof_public_id");
  if (error) return { ok: false, message: error.code === "23503" ? "rally.errors.teamHasResults" : databaseErrorMessage(error) };
  if (data?.[0]?.payment_proof_public_id) await deleteAsset(data[0].payment_proof_public_id, "authenticated");
  for (const member of members ?? []) {
    if (member.twibbon_proof_public_id) await deleteAsset(member.twibbon_proof_public_id, "authenticated");
  }

  updateTag(COMPETITIONS_TAG);
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

// Every team as an Excel workbook for finance (base64). The proof column names the file in the ZIP below.
export async function exportRegistrationsXlsx(): Promise<ActionResult<string>> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };

  const supabase = await createSupabaseServerClient();
  const [overview, payments] = await Promise.all([
    supabase.from("registration_overview").select("*").order("created_at"),
    supabase.from("registrations").select("id, team_name, payer_name, payment_proof_public_id, payment_proof_format"),
  ]);
  if (overview.error || payments.error) return { ok: false, message: "errors.generic" };

  const byId = new Map(payments.data.map((p) => [p.id, p]));
  const fileNames = proofFileNames(payments.data);
  const rows = overview.data.map((r) => {
    const p = r.id ? byId.get(r.id) : undefined;
    return {
      ...r,
      payer_name: p?.payer_name ?? null,
      proof_file: r.id ? (fileNames.get(r.id) ?? null) : null,
    };
  });
  // Each row links to the team's admin page, which shows the proof after an admin login (a link straight to the file
  // would have to expire). Server Action requests always carry the site's Origin.
  const origin = (await headers()).get("origin") ?? "";
  const lang = await getRequestLocale();
  return { ok: true, data: await registrationsXlsx(rows, lang, (id) => `${origin}${localePath(lang, `/admin/registrations/${id}`)}`) };
}

// Every uploaded payment proof as one ZIP (base64), each file named after its team (see proofFileNames). The server
// fetches the private files from Cloudinary itself, so no link to them ever reaches the browser.
// shortcut: builds the whole ZIP in memory, fine for a few hundred proofs; past that, stream it from a route handler.
export async function downloadPaymentProofsZip(): Promise<ActionResult<string>> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("id, team_name, payment_proof_public_id, payment_proof_format")
    .not("payment_proof_public_id", "is", null);
  if (error) return { ok: false, message: "errors.generic" };
  if (data.length === 0) return { ok: false, message: "admin.registrations.noProofs" };

  const fileNames = proofFileNames(data);
  const files: Record<string, Uint8Array> = {};
  const results = await Promise.all(
    data.map(async (r) => {
      const name = fileNames.get(r.id);
      if (!r.payment_proof_public_id || !name) return true;
      const response = await fetch(privateAssetUrl(r.payment_proof_public_id, r.payment_proof_format ?? "jpg"));
      if (!response.ok) return false;
      files[name] = new Uint8Array(await response.arrayBuffer());
      return true;
    }),
  );
  if (results.includes(false)) return { ok: false, message: "admin.registrations.proofsFailed" };

  // Images are already compressed; storing them is faster and barely bigger.
  return { ok: true, data: Buffer.from(zipSync(files, { level: 0 })).toString("base64") };
}
