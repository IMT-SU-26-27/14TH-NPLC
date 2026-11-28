"use server";

import { refresh } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { currentDeviceLabel, ensureDeviceId } from "@/lib/team-device";
import { uuidSchema } from "@/lib/validations/admin";
import { singleDeviceSchema, teamDeviceAnswerSchema, teamDeviceSyncSchema } from "@/lib/validations/team-device";
import type { ActionResult } from "@/types";
import type { TeamDeviceAnswerInput, TeamDeviceState, TeamDeviceStatus } from "@/types/team-device";

const OFF: TeamDeviceState = {
  status: "off",
  holderName: null,
  holderLabel: null,
  holderSince: null,
  requestName: null,
  requestLabel: null,
  requestAt: null,
};

// Heartbeat of a contest page: keeps this browser's hold on the team, or reports who holds it. request = true asks
// the active device to hand the team over.
export async function syncTeamDevice(competitionId: string, request: boolean): Promise<ActionResult<TeamDeviceState>> {
  const parsed = teamDeviceSyncSchema.safeParse({ competitionId, request });
  if (!parsed.success) return { ok: false, message: "errors.invalidRequest" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "errors.signInAgain" };
  if (user.role !== "participant") return { ok: true, data: OFF };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("team_device_sync", {
    p_competition_id: parsed.data.competitionId,
    p_device_id: await ensureDeviceId(),
    p_label: await currentDeviceLabel(),
    p_request: parsed.data.request,
  });
  const row = data?.[0];
  if (error || !row) return { ok: false, message: "errors.generic" };
  return {
    ok: true,
    data: {
      status: row.status as TeamDeviceStatus,
      holderName: row.holder_name,
      holderLabel: row.holder_label,
      holderSince: row.holder_since,
      requestName: row.request_name,
      requestLabel: row.request_label,
      requestAt: row.request_at,
    },
  };
}

// The active device answers another device's request.
export async function answerTeamDevice(input: TeamDeviceAnswerInput): Promise<ActionResult<string>> {
  const parsed = teamDeviceAnswerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "errors.invalidRequest" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "errors.signInAgain" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("team_device_answer", {
    p_competition_id: parsed.data.competitionId,
    p_device_id: await ensureDeviceId(),
    p_approve: parsed.data.approve,
  });
  if (error || !data) return { ok: false, message: "errors.generic" };
  return { ok: true, data };
}

async function isAdmin() {
  return (await getCurrentUser())?.role === "admin";
}

// Admin: free a team so its next device gets in without asking (e.g. the active laptop broke).
export async function resetTeamDevice(registrationId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: "errors.adminOnly" };
  const id = uuidSchema.safeParse(registrationId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_team_device_reset", { p_registration_id: id.data });
  if (error) return { ok: false, message: "errors.generic" };
  refresh();
  return { ok: true, data: undefined, message: "admin.devices.resetDone" };
}

// Admin: the emergency switch. Off lets every device of a team in, as before this rule.
export async function setSingleDevice(competitionId: string, enabled: boolean): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: "errors.adminOnly" };
  const parsed = singleDeviceSchema.safeParse({ competitionId, enabled });
  if (!parsed.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("competitions")
    .update({ single_device: parsed.data.enabled })
    .eq("id", parsed.data.competitionId);
  if (error) return { ok: false, message: "errors.generic" };
  refresh();
  return { ok: true, data: undefined, message: parsed.data.enabled ? "admin.devices.turnedOn" : "admin.devices.turnedOff" };
}
