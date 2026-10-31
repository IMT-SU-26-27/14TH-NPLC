import type { z } from "zod";
import type { Database, Enums, Tables } from "@/types/database";
import type { LangParams, Locale } from "@/types/i18n";
import type { loAccountSchema, rallyFiltersSchema, rallyLookupSchema, rallyPostSchema, rallyRecordSchema } from "@/lib/validations/rally";

export type RallyPost = Tables<"rally_posts">;
export type RallyPostKind = Enums<"rally_post_kind">;
export type RallyPostInput = z.infer<typeof rallyPostSchema>;
export type LoAccountInput = z.infer<typeof loAccountSchema>;

export type RallyCompetition = Pick<Tables<"competitions">, "id" | "name">;
export type LoAccount = Pick<Tables<"profiles">, "id" | "full_name" | "email">;

export type RallyPostWithLos = Pick<
  RallyPost,
  "id" | "name" | "kind" | "location" | "points_win" | "points_lose" | "points_draw" | "allow_draw" | "is_active"
> & {
  assignments: { lo: Pick<LoAccount, "id" | "full_name"> | null }[];
};

export type LoPost = Pick<
  RallyPost,
  "id" | "name" | "kind" | "location" | "allow_draw" | "is_active" | "points_win" | "points_lose" | "points_draw"
>;

export type RallyPostsTableProps = {
  posts: RallyPostWithLos[];
  lang: Locale;
};

export type RallyPostFormProps = {
  post?: RallyPostWithLos;
  loAccounts: LoAccount[];
};

export type RallyPostEditSectionProps = {
  params: Promise<{ lang: string; id?: string }>;
};

export type LoAccountsCardProps = {
  accounts: LoAccount[];
  lang: Locale;
};

export type QrScannerProps = {
  paused?: boolean;
  onDetect: (text: string) => void;
  onError: (message: string) => void;
};

export type ScanTestPanelProps = {
  expected: string;
};

export type ScanTestDetection = {
  text: string;
  elapsedMs: number;
};

export type RallyTeamQrProps = {
  token: string;
  referralCode: string;
  lang: Locale;
};

export type RallyQrRegenerateButtonProps = {
  registrationId: string;
};

type RallyFunctions = Database["public"]["Functions"];

export type RallyOutcome = Enums<"rally_outcome">;
export type RallyLookup = RallyFunctions["rally_lookup_team"]["Returns"][number];
export type RallyRecorded = RallyFunctions["rally_record_result"]["Returns"][number];
export type RallyRecentResult = RallyFunctions["rally_recent_results"]["Returns"][number];
export type RallyLookupInput = z.infer<typeof rallyLookupSchema>;
export type RallyRecordInput = z.infer<typeof rallyRecordSchema>;

// What the LO's screen is showing.
export type RallyStationView =
  | { step: "scan" }
  | { step: "looking" }
  | { step: "team"; team: RallyLookup; requestId: string; saving: RallyOutcome | null }
  | { step: "saved"; team: RallyLookup; result: RallyRecorded; undoing: boolean };

export type LoStationProps = {
  post: LoPost;
  recent: RallyRecentResult[];
};

export type LoPostPageProps = {
  params: Promise<{ lang: string; id: string }>;
};

export type LoScanStepProps = {
  busy: boolean;
  error: string | null;
  onCode: (code: string) => void;
};

export type LoTeamStepProps = {
  post: LoPost;
  team: RallyLookup;
  saving: RallyOutcome | null;
  error: string | null;
  onRecord: (outcome: RallyOutcome) => void;
  onUndo: (resultId: string) => void;
  onNext: () => void;
};

export type LoSavedStepProps = {
  team: RallyLookup;
  result: RallyRecorded;
  undoing: boolean;
  error: string | null;
  onUndo: () => void;
  onNext: () => void;
};

export type LoUndoButtonProps = {
  until: string;
  pending: boolean;
  onUndo: () => void;
};

export type LoRecentResultsProps = {
  results: RallyRecentResult[];
};

export type LoOutcomeBadgeProps = {
  outcome: RallyOutcome;
  points: number;
};

export type RallyFilters = z.infer<typeof rallyFiltersSchema>;
export type RallyLogAction = Enums<"rally_log_action">;
export type RallyPostOption = Pick<RallyPost, "id" | "name" | "allow_draw">;

export type RallyResultRow = Pick<Tables<"rally_results">, "id" | "outcome" | "points" | "recorded_at"> & {
  post: RallyPostOption;
  registration: Pick<Tables<"registrations">, "id" | "team_name" | "school">;
  recorder: Pick<Tables<"profiles">, "full_name"> | null;
  corrector: Pick<Tables<"profiles">, "full_name"> | null;
};

export type RallyLogEntry = Pick<
  Tables<"rally_result_log">,
  "id" | "action" | "old_outcome" | "new_outcome" | "old_points" | "new_points" | "reason" | "created_at"
> & {
  post: Pick<RallyPost, "name">;
  registration: Pick<Tables<"registrations">, "id" | "team_name">;
  actor: Pick<Tables<"profiles">, "full_name"> | null;
};

export type RallyResultList = { rows: RallyResultRow[]; total: number; page: number; pageSize: number };
export type RallyLogList = { rows: RallyLogEntry[]; total: number; page: number; pageSize: number };

export type RallySearchParams = Promise<Record<string, string | string[] | undefined>>;

export type RallyListPageProps = {
  params: LangParams;
  searchParams: RallySearchParams;
};

export type RallyListSectionProps = {
  lang: Locale;
  searchParams: RallySearchParams;
};

export type RallyFiltersFormProps = {
  filters: RallyFilters;
  posts: RallyPostOption[];
  resetHref: string;
};

export type RallyResultsTableProps = {
  list: RallyResultList;
  filters: RallyFilters;
  lang: Locale;
};

export type RallyLogTableProps = {
  list: RallyLogList;
  filters: RallyFilters;
  lang: Locale;
};

export type RallyResultActionsProps = {
  result: RallyResultRow;
};
