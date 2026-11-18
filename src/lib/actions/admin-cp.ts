"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { notifyContestStatus } from "@/lib/push/notify";
import { databaseErrorMessage, errorState, fieldErrorState, successState } from "@/lib/form";
import { contestStatusSchema, finalistsSchema, leaderboardFreezeSchema, problemSchema, sessionSchema } from "@/lib/validations/cp";
import { uuidSchema } from "@/lib/validations/admin";
import type { ActionResult, FieldErrors, FormState } from "@/types";
import type { CpSessionStatus, ProblemInput } from "@/types/cp";

async function isAdmin() {
  return (await getCurrentUser())?.role === "admin";
}

const NOT_ADMIN = "errors.adminOnly";

// Saves a problem and replaces its test cases in one transaction (admin_save_problem).
export async function saveProblem(input: ProblemInput): Promise<ActionResult<{ id: string }> & { fieldErrors?: FieldErrors }> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const parsed = problemSchema.safeParse(input);
  if (!parsed.success) {
    const state = fieldErrorState(parsed.error);
    return { ok: false, message: state.message!, fieldErrors: state.fieldErrors };
  }
  const p = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_save_problem", {
    p_problem: {
      id: p.id,
      competition_id: p.competitionId,
      round: p.round,
      level: p.level,
      difficulty: p.difficulty,
      title: p.title,
      statement: p.statement,
      input_format: p.inputFormat,
      output_format: p.outputFormat,
      constraints: p.constraints,
      time_limit_ms: p.timeLimitMs,
      memory_limit_kb: p.memoryLimitKb,
      points: p.points,
      is_published: p.isPublished,
    },
    p_test_cases: p.testCases.map((t) => ({ input: t.input, expected_output: t.expectedOutput, is_sample: t.isSample })),
  });
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  refresh();
  return { ok: true, data: { id: data }, message: "admin.cp.problemSaved" };
}

export async function deleteProblem(problemId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(problemId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("cp_problems").delete().eq("id", id.data);
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  refresh();
  return { ok: true, data: undefined, message: "admin.cp.problemDeleted" };
}

export async function updateSessionSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return errorState(NOT_ADMIN);
  const parsed = sessionSchema.safeParse({
    competitionId: formData.get("competitionId"),
    scheduledStartAt: formData.get("scheduledStartAt") ?? "",
    durationHours: formData.get("durationHours") || 0,
    durationMinutes: formData.get("durationMinutes") || 0,
    durationSeconds: formData.get("durationSeconds") || 0,
    cooldownSeconds: formData.get("cooldownSeconds"),
    wrongPenalty: formData.get("wrongPenalty"),
    penalizeCompileError: formData.get("penalizeCompileError") === "on",
  });
  if (!parsed.success) return fieldErrorState(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("cp_sessions")
    .update({
      scheduled_start_at: parsed.data.scheduledStartAt,
      // While the contest runs, the cp_sessions_set_end trigger moves the end time to match.
      duration_seconds: parsed.data.duration,
      submission_cooldown_seconds: parsed.data.cooldownSeconds,
      // Applies to submissions from now on; earlier ones keep the score they got.
      wrong_penalty: parsed.data.wrongPenalty,
      penalize_compile_error: parsed.data.penalizeCompileError,
    })
    .eq("competition_id", parsed.data.competitionId);
  if (error) return errorState(databaseErrorMessage(error));

  refresh();
  return successState("admin.cp.settingsSaved");
}

// Start / pause / resume / end / reset the contest. Participants' pages react through Realtime on cp_sessions.
export async function setContestStatus(competitionId: string, status: CpSessionStatus): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const parsed = contestStatusSchema.safeParse({ competitionId, status });
  if (!parsed.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { data: before, error: readError } = await supabase
    .from("cp_sessions")
    .select("status, duration_seconds")
    .eq("competition_id", competitionId)
    .maybeSingle();
  if (readError) return { ok: false, message: databaseErrorMessage(readError) };
  // A fresh start needs a duration: the timer and the automatic end are based on it.
  if (status === "live" && before?.status !== "paused" && !before?.duration_seconds) {
    return { ok: false, message: "admin.cp.durationRequired" };
  }
  // The cp_sessions_prepare trigger handles the timestamps (and pushes the scheduled end back on resume).
  // Resetting to "not started" also unfreezes the leaderboard.
  const { error } = await supabase
    .from("cp_sessions")
    .update(status === "scheduled" ? { status, leaderboard_frozen_at: null } : { status })
    .eq("competition_id", competitionId);
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  refresh();
  const resumed = status === "live" && before?.status === "paused";
  if (before?.status !== status) after(() => notifyContestStatus(competitionId, status, resumed));
  const message = resumed
    ? "admin.cp.resumed"
    : { live: "admin.cp.started", paused: "admin.cp.pausedDone", ended: "admin.cp.ended", scheduled: "admin.cp.resetDone" }[status];
  return { ok: true, data: undefined, message };
}

// Freeze: participants keep seeing the standings from this moment (a snapshot is taken by a trigger)
// while scoring goes on. Unfreeze: they see the live standings again. Admins always see live scores.
export async function setLeaderboardFrozen(competitionId: string, frozen: boolean): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const parsed = leaderboardFreezeSchema.safeParse({ competitionId, frozen });
  if (!parsed.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("cp_sessions")
    .update({ leaderboard_frozen_at: parsed.data.frozen ? new Date().toISOString() : null })
    .eq("competition_id", parsed.data.competitionId);
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  refresh();
  return { ok: true, data: undefined, message: parsed.data.frozen ? "admin.cp.leaderboardFrozenDone" : "admin.cp.leaderboardUnfrozenDone" };
}

// ----- Final round -----

// Replaces the competition's finalists with the picked teams.
export async function saveFinalists(competitionId: string, registrationIds: string[]): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const parsed = finalistsSchema.safeParse({ competitionId, registrationIds });
  if (!parsed.success) return { ok: false, message: "errors.invalidRequest" };
  const { competitionId: id, registrationIds: ids } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const remove = supabase.from("cp_finalists").delete().eq("competition_id", id);
  const { error: deleteError } = await (ids.length ? remove.not("registration_id", "in", `(${ids.join(",")})`) : remove);
  if (deleteError) return { ok: false, message: databaseErrorMessage(deleteError) };
  if (ids.length) {
    const { error } = await supabase
      .from("cp_finalists")
      .upsert(ids.map((registration_id) => ({ registration_id, competition_id: id })), { ignoreDuplicates: true });
    if (error) return { ok: false, message: databaseErrorMessage(error) };
  }

  refresh();
  return { ok: true, data: undefined, message: "admin.cp.final.saved" };
}

// Lets the teams see whether they made the final (/cp/result), or hides it again.
export async function setFinalistsAnnounced(competitionId: string, announced: boolean): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(competitionId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("cp_sessions")
    .update({ finalists_announced_at: announced ? new Date().toISOString() : null })
    .eq("competition_id", id.data);
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  refresh();
  return { ok: true, data: undefined, message: announced ? "admin.cp.final.announcedDone" : "admin.cp.final.hiddenDone" };
}

// Archives the preliminary standings, resets every score and moves the session to the final (cp_start_final).
export async function startFinalRound(competitionId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN };
  const id = uuidSchema.safeParse(competitionId);
  if (!id.success) return { ok: false, message: "errors.invalidRequest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("cp_start_final", { p_competition_id: id.data });
  if (error) return { ok: false, message: databaseErrorMessage(error) };

  refresh();
  return { ok: true, data: undefined, message: "admin.cp.final.started" };
}
