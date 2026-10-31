import type { z } from "zod";
import type { Database, Enums, Tables } from "@/types/database";
import type { Locale } from "@/types/i18n";
import type { loAccountSchema, rallyLookupSchema, rallyPostSchema, rallyRecordSchema } from "@/lib/validations/rally";

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
