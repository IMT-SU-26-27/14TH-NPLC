import type { z } from "zod";
import type { Enums, Tables } from "@/types/database";
import type { Locale } from "@/types/i18n";
import type { codeSubmissionSchema, problemSchema, sessionSchema } from "@/lib/validations/cp";

export type CpLanguage = Enums<"cp_language">;
export type CpVerdict = Enums<"cp_verdict">;
export type CpSessionStatus = Enums<"cp_session_status">;
export type CpDifficulty = Enums<"cp_difficulty">;

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
  efficiency: number;
  score: number;
  points: number;
};

// ----- Contest pages -----

export type CpAccessRow = {
  competition_id: string;
  registration_id: string;
  session_status: CpSessionStatus;
};

export type ContestProblemListItem = Pick<CpProblem, "id" | "level" | "difficulty" | "title" | "points"> & {
  bestScore: number | null;
  solved: boolean;
};

export type ContestContext = {
  competitionId: string;
  registrationId: string | null; // null for admins previewing
  teamName: string | null;
  session: CpSession;
};

export type ProblemView = Pick<
  CpProblem,
  "id" | "competition_id" | "level" | "difficulty" | "title" | "statement" | "input_format" | "output_format" | "constraints" | "time_limit_ms" | "memory_limit_kb" | "points"
> & {
  samples: Pick<CpTestCase, "id" | "ordinal" | "input" | "expected_output">[];
};

export type RecentSubmission = {
  id: string;
  language: CpLanguage;
  verdict: CpVerdict;
  passed: number;
  total: number;
  score: number;
  created_at: string;
};

export type LeaderboardRow = Pick<CpScore, "registration_id" | "team_name" | "total_points" | "solved" | "last_improved_at">;

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
  verdict: CpVerdict;
};

export type LeaderboardTableProps = {
  initialRows: LeaderboardRow[];
  competitionId: string;
  highlightRegistrationId: string | null;
};

export type ContestStatusProps = {
  competitionId: string;
  status: CpSessionStatus;
};

export type WaitingRoomProps = {
  competitionId: string;
  status: CpSessionStatus;
  scheduledStartAt: string | null;
  teamName: string | null;
};

export type ContestHeaderProps = {
  lang: Locale;
  context: ContestContext;
  showBackToProblems?: boolean;
};

export type ContestClockProps = {
  startedAt: string | null;
  endsAt: string | null;
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
