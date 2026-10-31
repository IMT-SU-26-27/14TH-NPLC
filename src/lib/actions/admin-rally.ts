"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { getRallyCompetition } from "@/lib/data/rally";
import { databaseErrorMessage, errorState, fieldErrorState, successState } from "@/lib/form";
import { localePath } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { uuidSchema } from "@/lib/validations/admin";
import { loAccountSchema, rallyPostSchema } from "@/lib/validations/rally";
import type { ActionResult, FormState } from "@/types";

async function isAdmin() {
  return (await getCurrentUser())?.role === "admin";
}

const NOT_ADMIN = "errors.adminOnly";

export async function saveRallyPost(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = rallyPostSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    kind: formData.get("kind"),
    location: formData.get("location") ?? "",
    pointsWin: formData.get("pointsWin"),
    pointsLose: formData.get("pointsLose"),
    pointsDraw: formData.get("pointsDraw"),
    allowDraw: formData.get("allowDraw") === "on",
    isActive: formData.get("isActive") === "on",
    loIds: formData.getAll("loIds"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const p = parsed.data;

  const row = {
    name: p.name,
    kind: p.kind,
    location: p.location,
    points_win: p.pointsWin,
    points_lose: p.pointsLose,
    points_draw: p.pointsDraw,
    allow_draw: p.allowDraw,
    is_active: p.isActive,
  };

  const supabase = await createSupabaseServerClient();
  let postId = p.id;
  if (postId) {
    const { error } = await supabase.from("rally_posts").update(row).eq("id", postId);
    if (error) return errorState(databaseErrorMessage(error));
  } else {
    const competition = await getRallyCompetition();
    if (!competition) return errorState("rally.admin.noCompetitionTitle");
    const { data, error } = await supabase.from("rally_posts").insert({ ...row, competition_id: competition.id }).select("id").single();
    if (error) return errorState(databaseErrorMessage(error));
    postId = data.id;
  }

  // Add first, then remove: a failure halfway leaves extra access to fix, never a post without its LO.
  if (p.loIds.length > 0) {
    const { error } = await supabase
      .from("rally_post_assignments")
      .upsert(p.loIds.map((lo_id) => ({ post_id: postId, lo_id })), { onConflict: "post_id,lo_id", ignoreDuplicates: true });
    if (error) return errorState(databaseErrorMessage(error));
  }
  const removal = supabase.from("rally_post_assignments").delete().eq("post_id", postId);
  const { error: removeError } = await (p.loIds.length > 0 ? removal.not("lo_id", "in", `(${p.loIds.join(",")})`) : removal);
  if (removeError) return errorState(databaseErrorMessage(removeError));

  redirect(localePath(await getRequestLocale(), "/admin/rally"));
}

export async function deleteRallyPost(postId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(postId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("rally_posts").delete().eq("id", id.data);
  if (error) return { ok: false, message: error.code === "23503" ? "rally.errors.postHasResults" : databaseErrorMessage(error) };

  redirect(localePath(await getRequestLocale(), "/admin/rally"));
}

export async function createLoAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = loAccountSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { fullName, email, password } = parsed.data;

  // Creating a confirmed account and setting its role both need the service role.
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
  if (error || !data.user) {
    if (error?.code === "email_exists") return { status: "error", fieldErrors: { email: [{ message: "rally.admin.loEmailTaken" }] } };
    return errorState(error?.message ?? "errors.generic");
  }

  const { error: roleError } = await admin.from("profiles").update({ role: "lo" }).eq("id", data.user.id);
  if (roleError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return errorState(databaseErrorMessage(roleError));
  }

  refresh();
  return successState("rally.admin.loCreated");
}

export async function deleteLoAccount(userId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(userId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  // Checked here because the service role bypasses RLS: this must never delete a participant or admin.
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", id.data).maybeSingle();
  if (profile?.role !== "lo") return { ok: false, message: "errors.invalidRequest" };

  // Results keep who recorded them, so an LO with history stays. Remove them from their posts instead.
  const { count } = await admin.from("rally_result_log").select("id", { count: "exact", head: true }).eq("actor_id", id.data);
  if (count) return { ok: false, message: "rally.errors.loHasResults" };

  const { error } = await admin.auth.admin.deleteUser(id.data);
  if (error) return { ok: false, message: error.message };

  refresh();
  return { ok: true, data: undefined, message: "rally.admin.loDeleted" };
}
