"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { COMPETITIONS_TAG } from "@/lib/data/competitions";
import { assetExists, deleteAsset, QRIS_FOLDER, signUpload } from "@/lib/cloudinary/server";
import { databaseErrorMessage, errorState, fieldErrorState, successState } from "@/lib/form";
import { localePath } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { competitionSchema, paymentSettingsSchema, qrisSchema, uuidSchema } from "@/lib/validations/admin";
import type { ActionResult, FormState } from "@/types";
import type { CloudinaryUploadSignature } from "@/types/cloudinary";
import type { QrisInput } from "@/types/admin";

async function isAdmin() {
  return (await getCurrentUser())?.role === "admin";
}

const NOT_ADMIN = "errors.adminOnly";

export async function saveCompetition(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = competitionSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    type: formData.get("type"),
    description: formData.get("description") ?? "",
    minMembers: formData.get("minMembers"),
    maxMembers: formData.get("maxMembers"),
    fee: formData.get("fee"),
    registrationOpensAt: formData.get("registrationOpensAt") ?? "",
    registrationClosesAt: formData.get("registrationClosesAt") ?? "",
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const c = parsed.data;

  const row = {
    name: c.name,
    slug: c.slug,
    type: c.type,
    description: c.description,
    min_members: c.minMembers,
    max_members: c.maxMembers,
    fee: c.fee,
    registration_opens_at: c.registrationOpensAt,
    registration_closes_at: c.registrationClosesAt,
    is_active: c.isActive,
  };

  const supabase = await createSupabaseServerClient();
  const { data, error } = c.id
    ? await supabase.from("competitions").update(row).eq("id", c.id).select("id, type").single()
    : await supabase.from("competitions").insert(row).select("id, type").single();
  if (error) return errorState(databaseErrorMessage(error));

  // Every CP competition needs a session row for the admin's start/stop control.
  if (data.type === "competitive_programming") {
    await supabase.from("cp_sessions").upsert({ competition_id: data.id }, { onConflict: "competition_id", ignoreDuplicates: true });
  }

  updateTag(COMPETITIONS_TAG);
  redirect(localePath(await getRequestLocale(), "/admin/competitions"));
}

export async function deleteCompetition(competitionId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(competitionId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("competitions").delete().eq("id", id.data).select("qris_public_id");
  if (error) {
    if (error.code === "23503") return { ok: false, message: "admin.competitions.hasRegistrations" };
    return { ok: false, message: databaseErrorMessage(error) };
  }
  if (data?.[0]?.qris_public_id) await deleteAsset(data[0].qris_public_id, "upload");

  updateTag(COMPETITIONS_TAG);
  redirect(localePath(await getRequestLocale(), "/admin/competitions"));
}

// How participants pay for a competition: its QRIS image, or a transfer to a BCA account.
export async function savePaymentSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = paymentSettingsSchema.safeParse({
    competitionId: formData.get("competitionId"),
    paymentMethod: formData.get("paymentMethod"),
    bankAccountNumber: formData.get("bankAccountNumber") ?? "",
    bankAccountHolder: formData.get("bankAccountHolder") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const p = parsed.data;
  const isBank = p.paymentMethod === "bank_transfer";

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("competitions")
    .update({
      payment_method: p.paymentMethod,
      // Keep the saved account when switching to QRIS, so switching back doesn't lose it.
      ...(isBank ? { bank_account_number: p.bankAccountNumber, bank_account_holder: p.bankAccountHolder } : {}),
    })
    .eq("id", p.competitionId);
  if (error) return errorState(databaseErrorMessage(error));

  updateTag(COMPETITIONS_TAG);
  refresh();
  return successState("admin.payment.saved");
}

export async function getQrisUploadSignature(): Promise<ActionResult<CloudinaryUploadSignature>> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  return { ok: true, data: signUpload(QRIS_FOLDER, "upload", "jpg,jpeg,png,webp") };
}

export async function setCompetitionQris(input: QrisInput): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const parsed = qrisSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "errors.uploadFailed" };
  const { competitionId, publicId } = parsed.data;

  if (!publicId.startsWith(`${QRIS_FOLDER}/`) || !(await assetExists(publicId, "upload"))) {
    return { ok: false, message: "errors.uploadMissing" };
  }

  const supabase = await createSupabaseServerClient();
  const { data: previous } = await supabase.from("competitions").select("qris_public_id").eq("id", competitionId).single();
  const { error } = await supabase.from("competitions").update({ qris_public_id: publicId }).eq("id", competitionId);
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  if (previous?.qris_public_id && previous.qris_public_id !== publicId) await deleteAsset(previous.qris_public_id, "upload");
  updateTag(COMPETITIONS_TAG);
  refresh();
  return { ok: true, data: undefined, message: "admin.competitions.qrisUpdated" };
}
