import type { z } from "zod";
import type { Enums, Tables } from "@/types/database";
import type { Locale } from "@/types/i18n";
import type {
  codeSubmissionSchema,
  focusFiltersSchema,
  focusLeaveSchema,
  problemSchema,
  sessionSchema,
  submissionFiltersSchema,
} from "@/lib/validations/cp";

export type CpLanguage = Enums<"cp_language">;
export type CpVerdict = Enums<"cp_verdict">;
export type CpSessionStatus = Enums<"cp_session_status">;
export type CpDifficulty = Enums<"cp_difficulty">;
// A submission's response as the guidebook names it.
export type CpOutcome = "accepted" | "solved" | "wrongAnswer" | "runtimeError" | "timeLimit" | "compileError" | "judgeError";
// Everything a VerdictBadge shows: a guidebook response, or a state around judging that never carries a score.
export type VerdictBadgeKind = CpOutcome | "judging" | "run" | "lateRejected";
// The contest round a session belongs to. Every session is the preliminary until the final session exists.
export type ContestRound = "preliminary" | "final";

export type CpSession = Tables<"cp_sessions">;
export type CpProblem = Tables<"cp_problems">;
export type CpTestCase = Tables<"cp_test_cases">;
export type CpScore = Tables<"cp_scores">;

export type CodeSubmissionInput = z.infer<typeof codeSubmissionSchema>;
export type ProblemInput = z.infer<typeof problemSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;

// ----- Judge0 -----

export type Judge0Run = {
  sourceCode: string;
  language: CpLanguage;
  stdin: string;
  cpuTimeLimitSeconds: number;
  memoryLimitKb: number;
};

export type Judge0Result = {
  statusId: number;
  timeSeconds: number | null;
  memoryKb: number | null;
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
};

// ----- Judging -----

export type JudgeCase = Pick<CpTestCase, "id" | "ordinal" | "input" | "expected_output" | "is_sample">;
export type JudgeProblem = Pick<CpProblem, "time_limit_ms" | "memory_limit_kb">;

export type TestOutcome = {
  testCaseId: string;
  ordinal: number;
  isSample: boolean;
  verdict: CpVerdict;
  timeMs: number | null;
  memoryKb: number | null;
  // Only filled for sample tests, so hidden test data never reaches the browser.
  input?: string;
  expectedOutput?: string;
  stdout?: string;
  stderr?: string;
};

export type JudgeSummary = {
  verdict: CpVerdict;
  passed: number;
  total: number;
  maxTimeMs: number | null;
  maxMemoryKb: number | null;
  compileOutput: string;
  tests: TestOutcome[];
};

export type SubmissionOutcome = JudgeSummary & {
  submissionId: string | null; // null for sample runs
  // What this submission did to the team total: +points (first Accepted), 0 (Solved again, judge error) or -penalty.
  score: number;
  // Accepted on a problem the team had already solved ("Yes - Solved").
  alreadySolved: boolean;
  points: number;
  // The problem's best runtime before this submission (null: not solved before, or a sample run). With
  // alreadySolved, a lower maxTimeMs means this run replaced the best runtime and memory.
  previousBestTimeMs: number | null;
  // "Submit #n": the team's nth submission on this problem (null for sample runs).
  submissionNumber: number | null;
};

// ----- Contest pages -----

export type CpAccessRow = {
  competition_id: string;
  registration_id: string;
  session_status: CpSessionStatus;
};

export type ContestProblemListItem = Pick<CpProblem, "id" | "level" | "difficulty" | "title" | "points"> & {
  // Net points on this problem (+points once solved, minus penalties); null when not tried yet.
  netPoints: number | null;
  wrongAttempts: number;
  bestTimeMs: number | null;
  bestMemoryKb: number | null;
  solved: boolean;
};

export type ContestContext = {
  competitionId: string;
  registrationId: string | null; // null for admins previewing
  teamName: string | null;
  session: CpSession;
  // When the participants' leaderboard closes for the last hour (null: not on its own).
  autoFreezeAt: string | null;
};

export type ProblemView = Pick<
  CpProblem,
  "id" | "competition_id" | "level" | "difficulty" | "title" | "statement" | "input_format" | "output_format" | "constraints" | "time_limit_ms" | "memory_limit_kb" | "points"
> & {
  samples: Pick<CpTestCase, "id" | "ordinal" | "input" | "expected_output">[];
};

export type RecentSubmission = {
  id: string;
  // "Submit #n" for this team on this problem, counted from the first submission.
  number: number;
  language: CpLanguage;
  verdict: CpVerdict;
  passed: number;
  total: number;
  score: number;
  already_solved: boolean;
  // Slowest test and largest memory of the submission.
  max_time_ms: number | null;
  max_memory_kb: number | null;
  created_at: string;
};

// The team's own line on the problem list summary (screen 3). Rank is null when the team is not on the
// leaderboard yet; while frozen, every value is the one at the moment it closed.
export type TeamStanding = {
  score: number;
  totalRuntimeMs: number;
  totalMemoryKb: number;
  rank: number | null;
  teamCount: number;
  frozen: boolean;
};

export type LeaderboardRow = Pick<
  CpScore,
  "registration_id" | "team_name" | "school" | "total_points" | "solved" | "total_runtime_ms" | "total_memory_kb" | "problems"
>;

// One team's result on one problem, from cp_scores.problems.
export type ProblemStatus = { solved: boolean; wrong: number };

// A leaderboard column.
export type LeaderboardProblem = Pick<CpProblem, "id" | "level" | "title">;

// ----- Contest foundation components (design v89) -----

export type LeaderboardCellSize = "sm" | "default" | "lg";

export type LeaderboardProblemCellProps = {
  status: ProblemStatus | null;
  // sm: phone list (30x24, no wrong count under the check); default: 1440 table (38x30); lg: big screen (56x40).
  size?: LeaderboardCellSize;
};

export type LeaderboardLegendProps = {
  size?: "default" | "lg";
  className?: string;
};

export type ProblemStatusBadgeProps = {
  status: ProblemStatus | null;
};

export type ScoreDeltaProps = {
  // cp_submissions.score / SubmissionOutcome.score. null: show nothing (Run, judging, refused).
  score: number | null;
  className?: string;
};

export type ContestBarView = "problems" | "problem" | "leaderboard" | "waiting";

// What the status badge says. Derived from the session (and the team) by contestBarStatus().
export type ContestBarStatus = "live" | "paused" | "ended" | "disqualified" | "scheduled" | "unscheduled";

export type ContestBarProps = {
  lang: Locale;
  context: ContestContext;
  // The page it sits on: marks the active nav item; the waiting room hides "Problems".
  view: ContestBarView;
  round?: ContestRound;
  disqualified?: boolean;
};

// One state of the result panel (board cp-02-panel-hasil) for the internal components page.
export type PanelStateFixture = {
  id: string;
  // null: the state has no verdict badge (empty panel, alerts).
  kind: VerdictBadgeKind | null;
  score: number | null;
  passed?: number;
  total?: number;
  maxTimeMs?: number;
  maxMemoryKb?: number;
  notes: { key: string; params?: Record<string, string | number> }[];
  // Shown as an Alert instead of a result (busy judge, time up, disqualified).
  alert?: "warning" | "destructive" | "default";
};

export type ContestComponentsPreviewProps = {
  lang: Locale;
};

export type ContestStatusBadgeProps = {
  status: ContestBarStatus;
};

export type ContestTimerProps = {
  competitionId: string;
  status: CpSessionStatus;
  scheduledStartAt: string | null;
  endsAt: string | null;
  pausedAt: string | null;
  // default: contest bar (28px); lg: big screen (56px).
  size?: "default" | "lg";
  // Ask the server to end the contest when the countdown reaches zero (off for previews).
  finishAtZero?: boolean;
};

export type AdminProblemRow = Pick<CpProblem, "id" | "level" | "difficulty" | "title" | "points" | "is_published" | "time_limit_ms" | "memory_limit_kb"> & {
  testCaseCount: number;
};

export type AdminProblemDetail = CpProblem & {
  testCases: Pick<CpTestCase, "id" | "ordinal" | "input" | "expected_output" | "is_sample">[];
};

export type AdminContest = {
  competitionId: string;
  competitionName: string;
  session: CpSession;
  autoFreezeAt: string | null;
  problems: AdminProblemRow[];
};

// ----- Component props -----

export type CpPageProps = {
  params: Promise<{ lang: string }>;
};

export type CpProblemPageProps = {
  params: Promise<{ lang: string; id: string }>;
};

export type ProblemWorkspaceProps = {
  problemId: string;
  statement: React.ReactNode;
  recent: RecentSubmission[];
  cooldownSeconds: number;
};

export type ProblemStatementProps = {
  problem: ProblemView;
  lang: Locale;
};

export type CodeEditorPanelProps = {
  language: CpLanguage;
  onLanguageChange: (language: CpLanguage) => void;
  code: string;
  onCodeChange: (code: string) => void;
  onReset: () => void;
  onRun: () => void;
  onSubmit: () => void;
  running: boolean;
  submitting: boolean;
  cooldownLeft: number;
};

export type ResultsPanelProps = {
  result: SubmissionOutcome | null;
  recent: RecentSubmission[];
  pending: boolean;
};

export type DifficultyBadgeProps = {
  difficulty: CpDifficulty;
  label: string;
};

export type VerdictBadgeProps = {
  kind: VerdictBadgeKind;
  className?: string;
};

// One test case's raw Judge0 verdict (admin submission detail, verdict guide).
export type TestVerdictBadgeProps = {
  verdict: CpVerdict;
};

export type LeaderboardTableProps = {
  initialRows: LeaderboardRow[];
  // Published problems in level order, one column each.
  problems: LeaderboardProblem[];
  competitionId: string;
  highlightRegistrationId: string | null;
  // Who is looking: admins always get live scores; participants get the snapshot while frozen.
  viewer: "admin" | "participant";
  frozenAt: string | null;
  // The current freeze came from the last-hour cut-off, not from an admin.
  frozenAuto: boolean;
  // When the participants' leaderboard closes on its own (null: not on its own).
  autoFreezeAt: string | null;
};

export type LeaderboardFreezeButtonProps = {
  competitionId: string;
  frozen: boolean;
};

export type AdminLeaderboardCardProps = {
  contest: AdminContest;
  rows: LeaderboardRow[];
};

export type ContestStatusProps = {
  competitionId: string;
  status: CpSessionStatus;
};

export type WaitingRoomProps = {
  competitionId: string;
  status: CpSessionStatus;
  scheduledStartAt: string | null;
  durationSeconds: number | null;
  teamName: string | null;
};

export type ContestHeaderProps = {
  lang: Locale;
  context: ContestContext;
  showBackToProblems?: boolean;
};

export type ContestClockProps = {
  competitionId: string;
  status: CpSessionStatus;
  endsAt: string | null;
  pausedAt: string | null;
};

export type ProblemListProps = {
  problems: ContestProblemListItem[];
  lang: Locale;
};

export type ProblemFormProps = {
  competitionId: string;
  problem: AdminProblemDetail | null;
};

export type ContestTransition = {
  to: CpSessionStatus;
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  destructive?: boolean;
};

export type ContestTransitionButtonProps = {
  competitionId: string;
  transition: ContestTransition;
};

export type ContestControlProps = {
  contest: AdminContest;
};

export type AdminProblemsTableProps = {
  contest: AdminContest;
  lang: Locale;
};

export type AdminCpPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ competition?: string }>;
};

export type AdminCpSectionProps = {
  lang: Locale;
  searchParams: Promise<{ competition?: string }>;
};

export type AdminProblemPageProps = {
  params: Promise<{ lang: string; id?: string }>;
  searchParams: Promise<{ competition?: string }>;
};

export type DeleteProblemButtonProps = {
  problemId: string;
};

export type TestCaseDraft = {
  key: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
};

// ----- Admin submissions -----

export type SubmissionFilters = z.infer<typeof submissionFiltersSchema>;

export type CpSubmission = Tables<"cp_submissions">;

export type AdminSubmissionRow = Pick<
  CpSubmission,
  "id" | "registration_id" | "language" | "verdict" | "already_solved" | "passed" | "total" | "score" | "max_time_ms" | "max_memory_kb" | "created_at"
> & {
  problem: Pick<CpProblem, "id" | "level" | "title">;
  team: { team_name: string };
};

export type AdminSubmissionList = {
  rows: AdminSubmissionRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProblemOption = Pick<CpProblem, "id" | "level" | "title">;

export type AdminSubmissionResult = {
  id: number;
  verdict: CpVerdict;
  time_ms: number | null;
  memory_kb: number | null;
  message: string | null;
  test: Pick<CpTestCase, "ordinal" | "is_sample"> | null;
};

export type AdminSubmissionDetail = CpSubmission & {
  problem: Pick<CpProblem, "id" | "level" | "title" | "competition_id" | "time_limit_ms" | "memory_limit_kb" | "points">;
  team: { id: string; team_name: string };
  submitter: { full_name: string; email: string } | null;
  results: AdminSubmissionResult[];
};

export type AdminSubmissionsPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export type AdminSubmissionsSectionProps = {
  lang: Locale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export type AdminSubmissionPageProps = {
  params: Promise<{ lang: string; id: string }>;
};

export type SubmissionFiltersFormProps = {
  filters: SubmissionFilters;
  competitionId: string;
  problems: ProblemOption[];
};

export type AdminSubmissionsTableProps = {
  list: AdminSubmissionList;
  filters: SubmissionFilters;
  competitionId: string;
  lang: Locale;
};

export type SubmissionCodeViewerProps = {
  code: string;
  language: CpLanguage;
  label: string;
};

// ----- Verdict guide -----

export type VerdictGuideState = {
  open: boolean;
  target: CpVerdict | null;
  onOpenChange: (open: boolean) => void;
};

export type VerdictGuideProps = {
  className?: string;
};

export type VerdictGuideEntry = {
  title: string;
  description: string;
  causes?: string[];
  fixes?: string[];
};

// ----- Leaving the contest page -----

export type CpFocusKind = Enums<"cp_focus_kind">;
export type FocusLeaveInput = z.infer<typeof focusLeaveSchema>;
export type FocusFilters = z.infer<typeof focusFiltersSchema>;

export type FocusSummaryRow = {
  registrationId: string;
  teamName: string;
  events: number;
  totalMs: number;
  longestMs: number | null;
  tabHidden: number;
  windowBlur: number;
  fullscreenExit: number;
  openEvents: number;
  lastLeftAt: string;
};

export type FocusEventRow = {
  id: string;
  kind: CpFocusKind;
  leftAt: string;
  returnedAt: string | null;
  returnedByReload: boolean;
  durationMs: number | null;
  memberName: string | null;
  problemTitle: string | null;
};

export type FocusAwayState = {
  kind: CpFocusKind;
  startedAt: number;
  // Resolves to the recorded row id (null when the server refused it, e.g. the contest is not live).
  id: Promise<string | null>;
};

export type AdminFocusPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export type AdminFocusSectionProps = {
  lang: Locale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export type FocusFiltersFormProps = {
  filters: FocusFilters;
  competitionId: string;
};

export type FocusKindBadgeProps = {
  kind: CpFocusKind;
  label: string;
};

export type StillAwayBadgeProps = {
  label: string;
};
