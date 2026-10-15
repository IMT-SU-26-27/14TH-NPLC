import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CompetitionOption } from "@/types/admin";
import type {
  AdminContest,
  AdminProblemDetail,
  ContestContext,
  ContestProblemListItem,
  LeaderboardRow,
  ProblemView,
  RecentSubmission,
} from "@/types/cp";

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

  const { data: session } = await supabase.from("cp_sessions").select("*").eq("competition_id", competitionId).maybeSingle();
  if (!session) return null;

  return { competitionId, registrationId, teamName, session };
}

export async function listContestProblems(competitionId: string, registrationId: string | null): Promise<ContestProblemListItem[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: problems }, { data: scores }] = await Promise.all([
    supabase
      .from("cp_problems")
      .select("id, level, title, points")
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
    .select("id, competition_id, level, title, statement, input_format, output_format, constraints, time_limit_ms, memory_limit_kb, points")
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

export async function getLeaderboard(competitionId: string): Promise<LeaderboardRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cp_scores")
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
  const [{ data: competition }, { data: session }, { data: problems }] = await Promise.all([
    supabase.from("competitions").select("id, name").eq("id", competitionId).maybeSingle(),
    supabase.from("cp_sessions").select("*").eq("competition_id", competitionId).maybeSingle(),
    supabase
      .from("cp_problems")
      .select("id, level, title, points, is_published, time_limit_ms, memory_limit_kb, cp_test_cases(count)")
      .eq("competition_id", competitionId)
      .order("level"),
  ]);
  if (!competition || !session) return null;

  return {
    competitionId: competition.id,
    competitionName: competition.name,
    session,
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
