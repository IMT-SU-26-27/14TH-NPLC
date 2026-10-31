import type { z } from "zod";
import type { Enums, Tables } from "@/types/database";
import type { Locale } from "@/types/i18n";
import type { loAccountSchema, rallyPostSchema } from "@/lib/validations/rally";

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

export type LoPost = Pick<RallyPost, "id" | "name" | "kind" | "location" | "allow_draw" | "is_active">;

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
