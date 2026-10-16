"use server";

import { after } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notifyContestStatus } from "@/lib/push/notify";
import { uuidSchema } from "@/lib/validations/admin";
import type { ActionResult } from "@/types";

// Called by the contest timer when it reaches zero. The database only ends the contest if its end
// time has really passed, so it is safe for any signed-in participant or admin to call.
// Everyone's pages then move on through Realtime on cp_sessions.
export async function finishContestIfTimeUp(competitionId: string): Promise<ActionResult<{ ended: boolean }>> {
  const id = uuidSchema.safeParse(competitionId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { data: ended, error } = await supabase.rpc("cp_finish_if_time_up", { p_competition_id: id.data });
  if (error) return { ok: false, message: "errors.generic" };

  if (ended) after(() => notifyContestStatus(id.data, "ended", false));
  return { ok: true, data: { ended: !!ended } };
}
