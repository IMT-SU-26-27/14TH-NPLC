"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/data/auth";
import { uuidSchema } from "@/lib/validations/admin";
import { focusLeaveSchema } from "@/lib/validations/cp";
import type { ActionResult } from "@/types";
import type { FocusLeaveInput } from "@/types/cp";

// A browser that flips focus in a loop should not flood the table.
const MAX_EVENTS_PER_MINUTE = 30;

// The participant's own accepted CP team, read through their session so RLS decides; only while the contest is live.
async function liveTeam() {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("cp_access");
  const row = data?.find((r) => r.session_status === "live");
  return row ? { user, competitionId: row.competition_id, registrationId: row.registration_id } : null;
}

// The participant left the contest page. Returns the row id so the return can close it.
export async function recordFocusLeave(input: FocusLeaveInput): Promise<ActionResult<{ id: string } | null>> {
  const parsed = focusLeaveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "errors.invalidRequest" };

  const team = await liveTeam();
  if (!team) return { ok: true, data: null };

  const admin = createSupabaseAdminClient();
  const { count } = await admin
    .from("cp_focus_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", team.user.id)
    .gte("left_at", new Date(Date.now() - 60_000).toISOString());
  if ((count ?? 0) >= MAX_EVENTS_PER_MINUTE) return { ok: true, data: null };

  const { data, error } = await admin
    .from("cp_focus_events")
    .insert({
      competition_id: team.competitionId,
      registration_id: team.registrationId,
      user_id: team.user.id,
      problem_id: parsed.data.problemId,
      kind: parsed.data.kind,
    })
    .select("id")
    .single();
  if (error) return { ok: false, message: "errors.generic" };
  return { ok: true, data: { id: data.id } };
}

// The participant is back on the contest page.
export async function recordFocusReturn(eventId: string): Promise<ActionResult> {
  const id = uuidSchema.safeParse(eventId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "errors.signInAgain" };

  const admin = createSupabaseAdminClient();
  await admin
    .from("cp_focus_events")
    .update({ returned_at: new Date().toISOString() })
    .eq("id", id.data)
    .eq("user_id", user.id)
    .is("returned_at", null);
  return { ok: true, data: undefined };
}

// A fresh load of a contest page: anything this participant left open (the page closed or crashed while away)
// ended now, when they came back.
export async function closeOpenFocusEvents(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") return { ok: true, data: undefined };

  const admin = createSupabaseAdminClient();
  await admin
    .from("cp_focus_events")
    .update({ returned_at: new Date().toISOString(), returned_by_reload: true })
    .eq("user_id", user.id)
    .is("returned_at", null);
  return { ok: true, data: undefined };
}
