"use server";

import { refresh } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/data/auth";
import { Judge0Error, runOnJudge0, verdictFor } from "@/lib/judge0/server";
import { computeEfficiency, computeScore } from "@/lib/cp/scoring";
import { codeSubmissionSchema } from "@/lib/validations/cp";
import type { ActionResult } from "@/types";
import type { CodeSubmissionInput, JudgeCase, JudgeProblem, JudgeSummary, SubmissionOutcome, TestOutcome } from "@/types/cp";

const MESSAGE_LIMIT = 4000;
const trim = (text: string) => (text.length > MESSAGE_LIMIT ? `${text.slice(0, MESSAGE_LIMIT)}\n…` : text);

// Runs the code against each case on Judge0. Hidden cases never carry their data back to the browser.
async function judge(input: CodeSubmissionInput, problem: JudgeProblem, cases: JudgeCase[]): Promise<JudgeSummary> {
  const results = await runOnJudge0(
    cases.map((c) => ({
      sourceCode: input.sourceCode,
      language: input.language,
      stdin: c.input,
      cpuTimeLimitSeconds: problem.time_limit_ms / 1000,
      memoryLimitKb: problem.memory_limit_kb,
    })),
  );

  const tests: TestOutcome[] = cases.map((c, i) => {
    const r = results[i];
    const verdict = verdictFor(r, c.expected_output);
    return {
      testCaseId: c.id,
      ordinal: c.ordinal,
      isSample: c.is_sample,
      verdict,
      timeMs: r.timeSeconds === null ? null : Math.round(r.timeSeconds * 1000),
      memoryKb: r.memoryKb,
      // Judge0's own failures (internal / exec format) carry server paths, not anything the player wrote.
      ...(c.is_sample
        ? {
            input: c.input,
            expectedOutput: c.expected_output,
            stdout: trim(r.stdout),
            stderr: verdict === "internal_error" || verdict === "exec_format_error" ? "" : trim(r.stderr || r.message),
          }
        : {}),
    };
  });

  const passed = tests.filter((t) => t.verdict === "accepted").length;
  const firstFailure = tests.find((t) => t.verdict !== "accepted");
  const times = tests.map((t) => t.timeMs).filter((v): v is number => v !== null);
  const memories = tests.map((t) => t.memoryKb).filter((v): v is number => v !== null);

  return {
    verdict: firstFailure?.verdict ?? "accepted",
    passed,
    total: tests.length,
    maxTimeMs: times.length ? Math.max(...times) : null,
    maxMemoryKb: memories.length ? Math.max(...memories) : null,
    compileOutput: trim(results.find((r) => r.compileOutput)?.compileOutput ?? ""),
    tests,
  };
}

// Loads the problem through the user's own session, so RLS decides whether the contest is live for them.
async function loadAccess(problemId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "errors.signInAgain" } as const;

  const supabase = await createSupabaseServerClient();
  const { data: problem } = await supabase
    .from("cp_problems")
    .select("id, competition_id, points, time_limit_ms, memory_limit_kb")
    .eq("id", problemId)
    .maybeSingle();
  if (!problem) return { error: "cp.errors.notAvailable" } as const;

  const { data: access } = await supabase.rpc("cp_access");
  const row = access?.find((r) => r.competition_id === problem.competition_id);
  if (user.role !== "admin" && (!row || row.session_status !== "live")) return { error: "cp.errors.notLive" } as const;

  return { user, problem, registrationId: row?.registration_id ?? null } as const;
}

// "Run" button: sample tests only, nothing is recorded.
export async function runSamples(input: CodeSubmissionInput): Promise<ActionResult<SubmissionOutcome>> {
  const parsed = codeSubmissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const access = await loadAccess(parsed.data.problemId);
  if ("error" in access) return { ok: false, message: access.error! };

  const supabase = await createSupabaseServerClient();
  const { data: samples } = await supabase
    .from("cp_test_cases")
    .select("id, ordinal, input, expected_output, is_sample")
    .eq("problem_id", access.problem.id)
    .eq("is_sample", true)
    .order("ordinal");
  if (!samples?.length) return { ok: false, message: "cp.errors.noSamples" };

  try {
    const summary = await judge(parsed.data, access.problem, samples);
    return { ok: true, data: { ...summary, submissionId: null, efficiency: 0, score: 0, points: access.problem.points } };
  } catch (error) {
    return { ok: false, message: error instanceof Judge0Error ? "cp.errors.judgeUnavailable" : "errors.generic" };
  }
}

// "Submit" button: every test case, scored and recorded for the team.
export async function submitSolution(input: CodeSubmissionInput): Promise<ActionResult<SubmissionOutcome>> {
  const parsed = codeSubmissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const access = await loadAccess(parsed.data.problemId);
  if ("error" in access) return { ok: false, message: access.error! };
  if (!access.registrationId) return { ok: false, message: "cp.errors.adminPreview" };
  const { problem, registrationId, user } = access;

  const admin = createSupabaseAdminClient();

  // Cooldown checked before spending Judge0 time; the database trigger checks it again on insert.
  const [{ data: session }, { data: last }] = await Promise.all([
    admin.from("cp_sessions").select("submission_cooldown_seconds, scheduled_end_at").eq("competition_id", problem.competition_id).single(),
    admin
      .from("cp_submissions")
      .select("created_at")
      .eq("registration_id", registrationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  // Strict deadline on arrival; the database allows a short grace only for code already being judged.
  if (session?.scheduled_end_at && Date.now() >= new Date(session.scheduled_end_at).getTime()) {
    return { ok: false, message: "cp.errors.timeUp" };
  }
  const cooldown = session?.submission_cooldown_seconds ?? 0;
  if (last) {
    const wait = Math.ceil(cooldown - (Date.now() - new Date(last.created_at).getTime()) / 1000);
    if (wait > 0) return { ok: false, message: "cp.errors.cooldown", params: { seconds: wait } };
  }

  const { data: cases } = await admin
    .from("cp_test_cases")
    .select("id, ordinal, input, expected_output, is_sample")
    .eq("problem_id", problem.id)
    .order("ordinal");
  if (!cases?.length) return { ok: false, message: "cp.errors.notAvailable" };

  let summary: JudgeSummary;
  try {
    summary = await judge(parsed.data, problem, cases);
  } catch (error) {
    return { ok: false, message: error instanceof Judge0Error ? "cp.errors.judgeUnavailable" : "errors.generic" };
  }

  const efficiency =
    summary.passed > 0 ? computeEfficiency(summary.maxTimeMs, problem.time_limit_ms, summary.maxMemoryKb, problem.memory_limit_kb) : 0;
  const score = computeScore(problem.points, summary.passed, summary.total, efficiency);

  const { data: submission, error } = await admin
    .from("cp_submissions")
    .insert({
      problem_id: problem.id,
      registration_id: registrationId,
      user_id: user.id,
      language: parsed.data.language,
      source_code: parsed.data.sourceCode,
      verdict: summary.verdict,
      passed: summary.passed,
      total: summary.total,
      max_time_ms: summary.maxTimeMs,
      max_memory_kb: summary.maxMemoryKb,
      efficiency,
      score,
      compile_output: summary.compileOutput || null,
    })
    .select("id")
    .single();
  if (error) {
    if (error.message.startsWith("Please wait")) return { ok: false, message: "cp.errors.cooldown", params: { seconds: cooldown } };
    if (error.message.startsWith("The contest is not running")) return { ok: false, message: "cp.errors.notLive" };
    if (error.message.startsWith("The contest time is over")) return { ok: false, message: "cp.errors.timeUp" };
    return { ok: false, message: "errors.generic" };
  }

  await admin.from("cp_submission_results").insert(
    summary.tests.map((t) => ({
      submission_id: submission.id,
      test_case_id: t.testCaseId,
      verdict: t.verdict,
      time_ms: t.timeMs,
      memory_kb: t.memoryKb,
      message: t.isSample ? t.stderr || null : null,
    })),
  );

  refresh();
  return { ok: true, data: { ...summary, submissionId: submission.id, efficiency, score, points: problem.points } };
}
