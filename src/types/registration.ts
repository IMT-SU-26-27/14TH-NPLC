import type { z } from "zod";
import type { Enums, Tables } from "@/types/database";
import type { PublicCompetition } from "@/types/competition";
import type { CurrentUser } from "@/types/auth";
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
  "id" | "slug" | "name" | "type" | "min_members" | "max_members" | "fee" | "qris_public_id"
>;

export type TeamMember = Pick<
  RegistrationMember,
  "id" | "user_id" | "full_name" | "email" | "phone" | "nisn" | "is_leader" | "created_at"
>;

export type TeamEvent = Pick<RegistrationEvent, "id" | "status" | "note" | "created_at">;

// A registration as shown on the participant dashboard.
export type Team = Pick<
  Registration,
  | "id"
  | "team_name"
  | "referral_code"
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
};

// ----- Component props -----

export type RegisterTeamFormProps = {
  competition: PublicCompetition;
  user: CurrentUser;
};

export type RegisterPageProps = {
  params: Promise<{ slug: string }>;
};

export type JoinPageProps = {
  searchParams: Promise<{ code?: string }>;
};

export type JoinSectionProps = {
  searchParams: Promise<{ code?: string }>;
};

export type JoinTeamFormProps = {
  referralCode: string;
  preview: TeamPreview;
  user: CurrentUser;
};

export type JoinCodeFormProps = {
  defaultCode?: string;
};

export type DashboardPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

export type TeamCardProps = {
  team: Team;
  userId: string;
  qrisUrl: string | null;
};

export type TeamTimelineProps = {
  team: Team;
};

export type TeamMembersProps = {
  team: Team;
  userId: string;
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
};

export type DeleteTeamButtonProps = {
  registrationId: string;
};

export type RegistrationRealtimeProps = {
  registrationIds: string[];
};
