"use server";

import { refresh } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { databaseErrorMessage } from "@/lib/form";
import { uuidSchema } from "@/lib/validations/admin";
import { rallyLookupSchema, rallyRecordSchema } from "@/lib/validations/rally";
import type { ActionResult } from "@/types";
import type { RallyLookup, RallyLookupInput, RallyRecordInput, RallyRecorded } from "@/types/rally";

// The RPCs check the LO's assignment, the team and the post in the database. These only validate the input.

export async function lookupRallyTeam(input: RallyLookupInput): Promise<ActionResult<RallyLookup>> {
  const parsed = rallyLookupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_lookup_team", { p_post_id: parsed.data.postId, p_code: parsed.data.code });
  if (error) return { ok: false, message: databaseErrorMessage(error) };
  if (!data?.[0]) return { ok: false, message: "rally.errors.teamNotFound" };
  return { ok: true, data: data[0] };
}

export async function recordRallyResult(input: RallyRecordInput): Promise<ActionResult<RallyRecorded>> {
  const parsed = rallyRecordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_record_result", {
    p_post_id: parsed.data.postId,
    p_registration_id: parsed.data.registrationId,
    p_outcome: parsed.data.outcome,
    p_client_request_id: parsed.data.clientRequestId,
  });
  if (error) return { ok: false, message: databaseErrorMessage(error) };
  if (!data?.[0]) return { ok: false, message: "errors.generic" };

  refresh();
  return { ok: true, data: data[0] };
}

export async function undoRallyResult(resultId: string): Promise<ActionResult> {
  const id = uuidSchema.safeParse(resultId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("rally_undo_result", { p_result_id: id.data });
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  refresh();
  return { ok: true, data: undefined };
}
