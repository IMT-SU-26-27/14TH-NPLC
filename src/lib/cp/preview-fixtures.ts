import { formatSeconds } from "@/lib/format";
import type { CpSession, PanelStateFixture } from "@/types/cp";
import type { Locale } from "@/types/i18n";

// Example data for the internal components page (/admin/cp/components). Not real teams or results.

export const PREVIEW_PENALTY = 10;

// The moment the preview is rendered; contest times are placed around it.
export function previewNow(): number {
  return Date.now();
}

// Every result panel state from board cp-02-panel-hasil, in the board's order. Text keys are the ones the real
// panel uses (cp.contest.panel.*), with the session's penalty filled in.
export function panelStateFixtures(lang: Locale): PanelStateFixture[] {
  const s = (ms: number) => formatSeconds(ms, lang);
  const down = { key: "cp.contest.panel.scoreDown", params: { penalty: PREVIEW_PENALTY } };
  return [
    { id: "empty", kind: null, score: null, notes: [{ key: "cp.contest.panel.empty" }, { key: "cp.contest.panel.emptyLead" }] },
    {
      id: "runPassed",
      kind: "run",
      score: null,
      passed: 2,
      total: 2,
      notes: [{ key: "cp.contest.panel.samplesPassed", params: { passed: 2, total: 2 } }, { key: "cp.contest.panel.runNoteSubmit" }],
    },
    {
      id: "runSampleFailed",
      kind: "run",
      score: null,
      notes: [{ key: "cp.contest.panel.samplesPassed", params: { passed: 1, total: 2 } }, { key: "cp.contest.panel.runUnchanged" }],
    },
    {
      id: "runCompileError",
      kind: "run",
      score: null,
      notes: [{ key: "cp.contest.panel.compileFailed" }, { key: "cp.contest.panel.runUnchanged" }],
    },
    {
      id: "judging",
      kind: "judging",
      score: null,
      notes: [{ key: "cp.contest.panel.judgingTitle" }, { key: "cp.contest.panel.judgingLead" }],
    },
    {
      id: "judgeBusy",
      kind: "judging",
      score: null,
      alert: "warning",
      notes: [{ key: "cp.contest.panel.busyTitle" }, { key: "cp.contest.panel.busyLead", params: { number: 3 } }],
    },
    {
      id: "accepted",
      kind: "accepted",
      score: 100,
      passed: 10,
      total: 10,
      maxTimeMs: 210,
      maxMemoryKb: 18842,
      notes: [{ key: "cp.contest.panel.scoreUpTotals", params: { points: 100 } }],
    },
    {
      id: "solvedFaster",
      kind: "solved",
      score: 0,
      passed: 10,
      total: 10,
      maxTimeMs: 150,
      maxMemoryKb: 17613,
      notes: [{ key: "cp.contest.panel.solvedFaster", params: { before: s(210), after: s(150) } }],
    },
    {
      id: "solvedNotFaster",
      kind: "solved",
      score: 0,
      passed: 10,
      total: 10,
      maxTimeMs: 640,
      maxMemoryKb: 30515,
      notes: [{ key: "cp.contest.panel.solvedNotFaster", params: { best: s(150) } }],
    },
    {
      id: "wrongHidden",
      kind: "wrongAnswer",
      score: -PREVIEW_PENALTY,
      passed: 8,
      total: 10,
      maxTimeMs: 190,
      maxMemoryKb: 18534,
      notes: [{ key: "cp.contest.panel.wrongHidden", params: { tests: "#6, #8" } }, down],
    },
    {
      id: "wrongSample",
      kind: "wrongAnswer",
      score: -PREVIEW_PENALTY,
      passed: 9,
      total: 10,
      notes: [{ key: "cp.contest.panel.wrongSample", params: { test: 2 } }, down],
    },
    {
      id: "runtimeError",
      kind: "runtimeError",
      score: -PREVIEW_PENALTY,
      passed: 9,
      total: 10,
      notes: [{ key: "cp.contest.panel.runtimeError", params: { test: 4, code: 139 } }, down],
    },
    {
      id: "timeLimit",
      kind: "timeLimit",
      score: -PREVIEW_PENALTY,
      passed: 6,
      total: 10,
      notes: [{ key: "cp.contest.panel.timeLimit", params: { limit: s(1000), tests: "#7–#10" } }, down],
    },
    {
      id: "compileError",
      kind: "compileError",
      score: -PREVIEW_PENALTY,
      notes: [{ key: "cp.contest.panel.compileFailedNoTests" }, down],
    },
    {
      id: "compileErrorFree",
      kind: "compileError",
      score: 0,
      notes: [{ key: "cp.contest.panel.compileFailedNoTests" }, { key: "cp.contest.panel.noPenalty" }],
    },
    { id: "judgeError", kind: "judgeError", score: null, notes: [{ key: "cp.contest.panel.judgeError" }] },
    {
      id: "timeUpJudging",
      kind: "judging",
      score: null,
      notes: [{ key: "cp.contest.panel.stillJudgingTitle" }, { key: "cp.contest.panel.stillJudgingLead" }],
    },
    {
      id: "timeUpResult",
      kind: "accepted",
      score: 100,
      passed: 10,
      total: 10,
      maxTimeMs: 180,
      maxMemoryKb: 18022,
      notes: [{ key: "cp.contest.panel.scoreUp", params: { points: 100 } }, { key: "cp.contest.panel.sentBeforeEnd" }],
    },
    {
      id: "lateRejected",
      kind: "lateRejected",
      score: null,
      notes: [{ key: "cp.contest.panel.lateTitle" }, { key: "cp.contest.panel.lateLead" }, { key: "cp.contest.panel.lateNote" }],
    },
    { id: "timeUpClosed", kind: null, score: null, alert: "default", notes: [{ key: "cp.contest.panel.timeUpAlert" }] },
    { id: "disqualified", kind: null, score: null, alert: "destructive", notes: [{ key: "cp.contest.panel.disqualified" }] },
  ];
}

// A contest session in a given state, for the contest bar previews.
export function previewSession(now: number, overrides: Partial<CpSession>): CpSession {
  const hour = 3_600_000;
  return {
    id: "00000000-0000-4000-8000-000000000001",
    competition_id: "00000000-0000-4000-8000-000000000002",
    created_at: new Date(now - 24 * hour).toISOString(),
    updated_at: new Date(now).toISOString(),
    duration_seconds: 7200,
    started_at: new Date(now - 0.6 * hour).toISOString(),
    started_by: null,
    scheduled_start_at: new Date(now - 0.6 * hour).toISOString(),
    scheduled_end_at: new Date(now + 1.4 * hour).toISOString(),
    ended_at: null,
    paused_at: null,
    paused_seconds: 0,
    leaderboard_frozen_at: null,
    leaderboard_frozen_auto: false,
    leaderboard_released_at: null,
    status: "live",
    penalize_compile_error: true,
    submission_cooldown_seconds: 15,
    wrong_penalty: PREVIEW_PENALTY,
    ...overrides,
  };
}
