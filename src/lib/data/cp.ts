import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CompetitionOption } from "@/types/admin";
import type {
  AdminContest,
  AdminProblemDetail,
  AdminSubmissionDetail,
  AdminSubmissionList,
  ProblemOption,
  SubmissionFilters,
  ContestContext,
  ContestProblemListItem,
  CpSessionStatus,
  FocusEventRow,
  FocusFilters,
  FocusSummaryRow,
  LeaderboardRow,
  ProblemView,
  RecentSubmission,
} from "@/types/cp";

// The contest state of one CP competition, for the dashboard's contest button. Null when there is no session yet.
export async function getCpSessionStatus(competitionId: string): Promise<CpSessionStatus | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("cp_sessions").select("status").eq("competition_id", competitionId).maybeSingle();
  return data?.status ?? null;
}

// The CP competition the signed-in user plays in (participants), or the first CP competition (admins).
// RLS keeps participants to their own accepted team and its competition.
export async function getContestContext(isAdmin: boolean): Promise<ContestContext | null> {
  const supabase = await createSupabaseServerClient();

  let competitionId: string | null = null;
  let registrationId: string | null = null;
  let teamName: string | null = null;

  if (!isAdmin) {
    const { data: access } = await supabase.rpc("cp_access");
    const row = access?.find((r) => r.session_status === "live") ?? access?.[0];
    if (!row) return null;
    competitionId = row.competition_id;
    registrationId = row.registration_id;
    const { data: team } = await supabase.from("registrations").select("team_name").eq("id", row.registration_id).single();
    teamName = team?.team_name ?? null;
  } else {
    const { data } = await supabase
      .from("competitions")
      .select("id")
      .eq("type", "competitive_programming")
      .order("created_at")
      .limit(1)
      .maybeSingle();
    competitionId = data?.id ?? null;
  }
  if (!competitionId) return null;

  // Closes the participants' leaderboard for the last hour if that time has come (before the session is read).
  const { data: autoFreezeAt } = await supabase.rpc("cp_leaderboard_freeze_check", { p_competition_id: competitionId });
  const { data: session } = await supabase.from("cp_sessions").select("*").eq("competition_id", competitionId).maybeSingle();
  if (!session) return null;

  return { competitionId, registrationId, teamName, session, autoFreezeAt: autoFreezeAt ?? null };
}

export async function listContestProblems(competitionId: string, registrationId: string | null): Promise<ContestProblemListItem[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: problems }, { data: scores }] = await Promise.all([
    supabase
      .from("cp_problems")
      .select("id, level, difficulty, title, points")
      .eq("competition_id", competitionId)
      .eq("is_published", true)
      .order("level"),
    registrationId
      ? supabase.from("cp_problem_scores").select("problem_id, best_score, solved").eq("registration_id", registrationId)
      : Promise.resolve({ data: [] as { problem_id: string; best_score: number; solved: boolean }[] }),
  ]);
  const byProblem = new Map((scores ?? []).map((s) => [s.problem_id, s]));
  return (problems ?? []).map((p) => ({
    ...p,
    bestScore: byProblem.get(p.id)?.best_score ?? null,
    solved: byProblem.get(p.id)?.solved ?? false,
  }));
}

// Participants only see published problems while the contest is live (RLS), and only sample tests.
export async function getProblemView(problemId: string): Promise<ProblemView | null> {
  const supabase = await createSupabaseServerClient();
  const { data: problem } = await supabase
    .from("cp_problems")
    .select("id, competition_id, level, difficulty, title, statement, input_format, output_format, constraints, time_limit_ms, memory_limit_kb, points")
    .eq("id", problemId)
    .maybeSingle();
  if (!problem) return null;

  const { data: samples } = await supabase
    .from("cp_test_cases")
    .select("id, ordinal, input, expected_output")
    .eq("problem_id", problemId)
    .eq("is_sample", true)
    .order("ordinal");

  return { ...problem, samples: samples ?? [] };
}

export async function getRecentSubmissions(problemId: string, registrationId: string): Promise<RecentSubmission[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cp_submissions")
    .select("id, language, verdict, passed, total, score, created_at")
    .eq("problem_id", problemId)
    .eq("registration_id", registrationId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

// "live" reads cp_scores (admins, or participants while not frozen); "snapshot" reads the standings
// captured when the admin froze the leaderboard. RLS enforces the same rules.
export async function getLeaderboard(competitionId: string, source: "live" | "snapshot" = "live"): Promise<LeaderboardRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from(source === "live" ? "cp_scores" : "cp_leaderboard_snapshots")
    .select("registration_id, team_name, total_points, solved, last_improved_at")
    .eq("competition_id", competitionId)
    .order("total_points", { ascending: false })
    .order("last_improved_at", { ascending: true, nullsFirst: false });
  return data ?? [];
}

// ----- Admin -----

export async function listCpCompetitions(): Promise<CompetitionOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("competitions").select("id, name").eq("type", "competitive_programming").order("created_at");
  return data ?? [];
}

export async function getAdminContest(competitionId: string): Promise<AdminContest | null> {
  const supabase = await createSupabaseServerClient();
  const { data: autoFreezeAt } = await supabase.rpc("cp_leaderboard_freeze_check", { p_competition_id: competitionId });
  const [{ data: competition }, { data: session }, { data: problems }] = await Promise.all([
    supabase.from("competitions").select("id, name").eq("id", competitionId).maybeSingle(),
    supabase.from("cp_sessions").select("*").eq("competition_id", competitionId).maybeSingle(),
    supabase
      .from("cp_problems")
      .select("id, level, difficulty, title, points, is_published, time_limit_ms, memory_limit_kb, cp_test_cases(count)")
      .eq("competition_id", competitionId)
      .order("level"),
  ]);
  if (!competition || !session) return null;

  return {
    competitionId: competition.id,
    competitionName: competition.name,
    session,
    autoFreezeAt: autoFreezeAt ?? null,
    problems: (problems ?? []).map(({ cp_test_cases, ...p }) => ({
      ...p,
      testCaseCount: (cp_test_cases as unknown as { count: number }[])[0]?.count ?? 0,
    })),
  };
}

export async function getAdminProblem(problemId: string): Promise<AdminProblemDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cp_problems")
    .select("*, testCases:cp_test_cases(id, ordinal, input, expected_output, is_sample)")
    .eq("id", problemId)
    .order("ordinal", { referencedTable: "cp_test_cases" })
    .maybeSingle();
  return data as unknown as AdminProblemDetail | null;
}

const SUBMISSIONS_PAGE_SIZE = 30;

// Every team's submissions in one competition, newest first. Admin only (RLS returns a team's own rows otherwise).
export async function listAdminSubmissions(competitionId: string, filters: SubmissionFilters): Promise<AdminSubmissionList> {
  const supabase = await createSupabaseServerClient();
  const from = (filters.page - 1) * SUBMISSIONS_PAGE_SIZE;

  let query = supabase
    .from("cp_submissions")
    .select(
      `id, registration_id, language, verdict, passed, total, score, max_time_ms, max_memory_kb, created_at,
       problem:cp_problems!inner ( id, level, title, competition_id ),
       team:registrations!inner ( team_name )`,
      { count: "exact" },
    )
    .eq("problem.competition_id", competitionId)
    .order("created_at", { ascending: false })
    .range(from, from + SUBMISSIONS_PAGE_SIZE - 1);

  if (filters.problem) query = query.eq("problem_id", filters.problem);
  if (filters.team) query = query.eq("registration_id", filters.team);
  if (filters.verdict) query = query.eq("verdict", filters.verdict);
  if (filters.q) query = query.ilike("team.team_name", `%${filters.q}%`);

  const { data, count, error } = await query;
  if (error) throw new Error(`Could not load submissions: ${error.message}`);
  return {
    rows: (data ?? []) as unknown as AdminSubmissionList["rows"],
    total: count ?? 0,
    page: filters.page,
    pageSize: SUBMISSIONS_PAGE_SIZE,
  };
}

export async function listProblemOptions(competitionId: string): Promise<ProblemOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("cp_problems").select("id, level, title").eq("competition_id", competitionId).order("level");
  return data ?? [];
}

// The full record of one judged submission: code, compiler output and every test result (hidden ones included).
export async function getAdminSubmission(submissionId: string): Promise<AdminSubmissionDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cp_submissions")
    .select(
      `*,
       problem:cp_problems ( id, level, title, competition_id, time_limit_ms, memory_limit_kb, points ),
       team:registrations ( id, team_name ),
       submitter:profiles ( full_name, email ),
       results:cp_submission_results ( id, verdict, time_ms, memory_kb, message, test:cp_test_cases ( ordinal, is_sample ) )`,
    )
    .eq("id", submissionId)
    .maybeSingle();
  if (!data) return null;

  const submission = data as unknown as AdminSubmissionDetail;
  submission.results.sort((a, b) => (a.test?.ordinal ?? 0) - (b.test?.ordinal ?? 0));
  return submission;
}

// ----- Leaving the contest page (Admin -> CP -> Activity) -----

// One row per team that left the contest page, teams still away first, then the longest total time away.
export async function listFocusSummary(competitionId: string, filters: FocusFilters): Promise<FocusSummaryRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("admin_cp_focus_summary", {
    p_competition_id: competitionId,
    p_kind: filters.kind ?? null,
    p_min_ms: filters.min * 1000,
  });
  return (data ?? []).map((r) => ({
    registrationId: r.registration_id,
    teamName: r.team_name,
    events: Number(r.events),
    totalMs: Number(r.total_ms),
    longestMs: r.longest_ms === null ? null : Number(r.longest_ms),
    tabHidden: Number(r.tab_hidden),
    windowBlur: Number(r.window_blur),
    fullscreenExit: Number(r.fullscreen_exit),
    openEvents: Number(r.open_events),
    lastLeftAt: r.last_left_at,
  }));
}

// Every time one team left the contest page, newest first, with the same filters as the summary.
export async function listTeamFocusEvents(competitionId: string, filters: FocusFilters & { team: string }): Promise<FocusEventRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("cp_focus_events")
    .select("id, kind, left_at, returned_at, returned_by_reload, duration_ms, member:profiles ( full_name, email ), problem:cp_problems ( level, title )")
    .eq("competition_id", competitionId)
    .eq("registration_id", filters.team)
    .order("left_at", { ascending: false })
    .limit(500);
  if (filters.kind) query = query.eq("kind", filters.kind);
  if (filters.min > 0) query = query.or(`returned_at.is.null,duration_ms.gte.${filters.min * 1000}`);
  const { data } = await query;
  return (data ?? []).map((e) => ({
    id: e.id,
    kind: e.kind,
    leftAt: e.left_at,
    returnedAt: e.returned_at,
    returnedByReload: e.returned_by_reload,
    durationMs: e.duration_ms,
    memberName: e.member ? e.member.full_name || e.member.email : null,
    problemTitle: e.problem ? `${e.problem.level}. ${e.problem.title}` : null,
  }));
}
