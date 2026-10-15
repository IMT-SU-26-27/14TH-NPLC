"use server";

import { updateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { CONTENT_TAG } from "@/lib/data/content";
import { databaseErrorMessage, errorState, fieldErrorState, successState } from "@/lib/form";
import { aboutContentSchema, timelineEventSchema } from "@/lib/validations/content";
import { uuidSchema } from "@/lib/validations/admin";
import type { ActionResult, FormState } from "@/types";

async function isAdmin() {
  return (await getCurrentUser())?.role === "admin";
}

const NOT_ADMIN = "errors.adminOnly";

export async function saveAboutContent(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = aboutContentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrorState(parsed.error);
  const c = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("site_content")
    .update({ about_title_id: c.aboutTitleId, about_title_en: c.aboutTitleEn, about_body_id: c.aboutBodyId, about_body_en: c.aboutBodyEn })
    .eq("id", true);
  if (error) return errorState(databaseErrorMessage(error));

  updateTag(CONTENT_TAG);
  return successState("admin.content.saved");
}

export async function saveTimelineEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = timelineEventSchema.safeParse({
    id: formData.get("id") || undefined,
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn") ?? "",
    titleId: formData.get("titleId"),
    titleEn: formData.get("titleEn"),
    descriptionId: formData.get("descriptionId") ?? "",
    descriptionEn: formData.get("descriptionEn") ?? "",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const e = parsed.data;
  const row = {
    starts_on: e.startsOn,
    ends_on: e.endsOn,
    title_id: e.titleId,
    title_en: e.titleEn,
    description_id: e.descriptionId,
    description_en: e.descriptionEn,
  };

  const supabase = await createSupabaseServerClient();
  const { error } = e.id
    ? await supabase.from("timeline_events").update(row).eq("id", e.id)
    : await supabase.from("timeline_events").insert(row);
  if (error) return errorState(databaseErrorMessage(error));

  updateTag(CONTENT_TAG);
  return successState("admin.content.eventSaved");
}

export async function deleteTimelineEvent(eventId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(eventId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("timeline_events").delete().eq("id", id.data);
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  updateTag(CONTENT_TAG);
  return { ok: true, data: undefined, message: "admin.content.eventDeleted" };
}
