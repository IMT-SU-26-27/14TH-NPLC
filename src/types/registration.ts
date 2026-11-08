import type { LucideIcon } from "lucide-react";
import type { z } from "zod";
import type { Enums, Tables } from "@/types/database";
import type { PublicCompetition } from "@/types/competition";
import type { CurrentUser } from "@/types/auth";
import type { CpSessionStatus } from "@/types/cp";
import type { LangParams, Locale } from "@/types/i18n";
import type {
  createRegistrationSchema,
  joinTeamSchema,
  PAYMENT_PROOF_FORMATS,
  submitPaymentSchema,
} from "@/lib/validations/registration";

export type RegistrationStatus = Enums<"registration_status">;
export type Registration = Tables<"registrations">;
export type RegistrationMember = Tables<"registration_members">;
export type RegistrationEvent = Tables<"registration_events">;

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type JoinTeamInput = z.infer<typeof joinTeamSchema>;
export type SubmitPaymentInput = z.infer<typeof submitPaymentSchema>;
export type PaymentProofFormat = (typeof PAYMENT_PROOF_FORMATS)[number];

export type TeamCompetition = Pick<
  PublicCompetition,
  "id" | "slug" | "name" | "type" | "min_members" | "max_members" | "fee" | "qris_public_id" | "payment_method" | "bank_account_number" | "bank_account_holder" | "registration_opens_at" | "registration_closes_at"
>;

export type TeamMember = Pick<
  RegistrationMember,
  "id" | "user_id" | "full_name" | "email" | "phone" | "nisn" | "is_leader" | "created_at"
> &
  Partial<Pick<RegistrationMember, "twibbon_proof_public_id" | "twibbon_proof_format" | "twibbon_post_url">>;

export type TeamEvent = Pick<RegistrationEvent, "id" | "status" | "note" | "created_at">;

// A registration as shown on the participant dashboard.
export type Team = Pick<
  Registration,
  | "id"
  | "team_name"
  | "school"
  | "line_id"
  | "referral_code"
  | "rally_qr_token"
  | "status"
  | "leader_id"
  | "payment_proof_public_id"
  | "payment_submitted_at"
  | "rejection_reason"
  | "created_at"
> & {
  competition: TeamCompetition;
  members: TeamMember[];
  events: TeamEvent[];
};

export type TeamPreview = {
  team_name: string;
  competition_name: string;
  leader_name: string;
  member_count: number;
  max_members: number;
  is_joinable: boolean;
  twibbon_url: string | null;
};

// ----- Component props -----

export type RegisterTeamFormProps = {
  competition: PublicCompetition;
  user: CurrentUser;
  qrisUrl: string | null;
  // What the team pays now, from currentFee().
  fee: number;
};

export type RegisterPageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export type RegisterSectionProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export type JoinPageProps = {
  params: LangParams;
  searchParams: Promise<{ code?: string }>;
};

export type JoinSectionProps = {
  lang: Locale;
  searchParams: Promise<{ code?: string }>;
};

export type JoinTeamFormProps = {
  referralCode: string;
  preview: TeamPreview;
  user: CurrentUser;
};

export type TwibbonProofFieldProps = {
  twibbonUrl: string | null;
  disabled: boolean;
  error: string | null;
  // Called as the visitor types, to clear a "required" error.
  onValueChange?: () => void;
};

export type JoinCodeFormProps = {
  defaultCode?: string;
  // False under a team preview, where joining is the main action and searching again is secondary.
  primary?: boolean;
};

export type DashboardPageProps = {
  params: LangParams;
  searchParams: Promise<{ notice?: string }>;
};

export type DashboardContentProps = {
  lang: Locale;
  searchParams: Promise<{ notice?: string }>;
};

export type WaGroup = {
  competition_name: string;
  wa_group_url: string;
};

export type WaGroupCardProps = {
  group: WaGroup;
  lang: Locale;
};

export type DashboardEmptyCardProps = {
  lang: Locale;
};

export type DashboardEmptyOptionProps = {
  // "A // KETUA" style label above the option.
  label: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  // leader: primary icon and button; member: lime icon and outline button.
  variant: "leader" | "member";
};

export type TeamCardProps = {
  team: Team;
  userId: string;
  qrisUrl: string | null;
  lang: Locale;
  // The CP contest state for an accepted CP team (null otherwise, or before a session exists).
  contestStatus: CpSessionStatus | null;
};

export type CpContestRefreshProps = {
  competitionId: string;
};

export type StepState = "done" | "current" | "upcoming" | "failed";

export type StepMarkerProps = {
  state: StepState;
  final?: boolean;
};

export type TimelineStep = {
  key: string;
  title: string;
  description: string;
  state: StepState;
};

export type TeamTimelineProps = {
  team: Team;
  lang: Locale;
};

export type TeamMembersProps = {
  team: Team;
  userId: string;
  canEdit: boolean;
};

export type MemberActionProps = {
  member: TeamMember;
  isSelf: boolean;
};

export type PaymentPanelProps = {
  team: Team;
  qrisUrl: string | null;
};

export type ReferralCodeProps = {
  code: string;
};

export type RegistrationStatusBadgeProps = {
  status: RegistrationStatus;
};

export type AccountCardProps = {
  user: CurrentUser;
  lang: Locale;
};

export type AccountNoteProps = {
  teamName: string;
  lang: Locale;
};

export type TeamStatusPillProps = {
  status: RegistrationStatus;
  lang: Locale;
};

export type DeleteTeamButtonProps = {
  registrationId: string;
};

export type RegistrationRealtimeProps = {
  registrationIds: string[];
};

export type RegisterSummaryProps = {
  competition: PublicCompetition;
  lang: Locale;
  // What the team pays now, from currentFee().
  fee: number;
};

export type FilePickerProps = {
  id: string;
  accept: string;
  disabled: boolean;
  invalid: boolean;
  onFileChange: (file: File | null) => void;
};

export type FormStepHeadingProps = {
  id: string;
  step: number;
  title: string;
  description?: string;
};
