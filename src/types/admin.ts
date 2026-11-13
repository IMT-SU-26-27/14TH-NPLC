import type { z } from "zod";
import type { Tables } from "@/types/database";
import type { Competition } from "@/types/competition";
import type { RegistrationStatus, Team } from "@/types/registration";
import type { LangParams, Locale } from "@/types/i18n";
import type { competitionSchema, qrisSchema, registrationFiltersSchema } from "@/lib/validations/admin";

export type RegistrationFilters = z.infer<typeof registrationFiltersSchema>;
export type CompetitionInput = z.infer<typeof competitionSchema>;

export type CompetitionStats = Tables<"competition_stats">;
export type RegistrationRow = Tables<"registration_overview">;

export type RegistrationList = {
  rows: RegistrationRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminTeam = Team & {
  payment_proof_format: string | null;
  reviewed_at: string | null;
};

export type CompetitionOption = Pick<Competition, "id" | "name">;

export type TrendSeries = {
  id: string;
  name: string;
  // Recharts dataKey and chart token slot: c1 -> --chart-1, c2 -> --chart-2 (fixed order by creation).
  key: string;
};

export type RegistrationTrend = {
  series: TrendSeries[];
  points: Record<string, string | number>[];
  total: number;
  days: number;
};

// ----- Component props -----

export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;

export type AdminRegistrationsPageProps = {
  params: LangParams;
  searchParams: AdminSearchParams;
};

export type RegistrationsSectionProps = {
  lang: Locale;
  searchParams: AdminSearchParams;
};

export type AdminIdPageProps = {
  params: Promise<{ lang: string; id: string }>;
};

// Dynamic [id] routes read params inside <Suspense>, so sections receive the promise and resolve the language themselves.
export type AdminIdSectionProps = {
  params: Promise<{ lang: string; id: string }>;
};

export type RegistrationFiltersFormProps = {
  filters: RegistrationFilters;
  competitions: CompetitionOption[];
};

export type RegistrationsTableProps = {
  list: RegistrationList;
  filters: RegistrationFilters;
  lang: Locale;
};

export type StatsCardsProps = {
  stats: CompetitionStats[];
  lang: Locale;
};

export type RegistrationTrendChartProps = {
  trend: RegistrationTrend;
};

export type DisqualificationFormProps = {
  registrationId: string;
  disqualifiedAt: string | null;
  reason: string | null;
};

export type ReviewFormProps = {
  registrationId: string;
  status: RegistrationStatus;
  rejectionReason: string | null;
  memberCount: number;
  minMembers: number;
  maxMembers: number;
};

export type TeamNameFormProps = {
  registrationId: string;
  teamName: string;
};

export type AdminMembersTableProps = {
  team: AdminTeam;
};

export type AdminCreateRegistrationFormProps = {
  competitions: CompetitionOption[];
};

export type CompetitionFormProps = {
  competition: Competition | null;
};

export type CompetitionEditSectionProps = {
  params: Promise<{ lang: string; id?: string }>;
};

export type CompetitionsTableProps = {
  competitions: AdminCompetition[];
  // Teams that take a place (not rejected), by competition id.
  teamCounts: Record<string, number>;
  lang: Locale;
};

export type QrisUploaderProps = {
  competitionId: string;
  qrisUrl: string | null;
};

export type AdminDeleteButtonProps = {
  id: string;
  label: string;
  target: "registration" | "competition" | "rallyPost" | "loAccount";
};

export type AdminRemoveMemberButtonProps = {
  memberId: string;
  name: string;
};

export type PaymentProofButtonProps = {
  registrationId: string;
};

export type QrisInput = z.infer<typeof qrisSchema>;

// Admin list: every column but the WhatsApp group link, which only the admin form reads (through a function).
export type AdminCompetition = Omit<Competition, "wa_group_url">;

export type PaymentSettingsCardProps = {
  competitions: AdminCompetition[];
  lang: Locale;
};

export type PaymentSettingsDialogProps = {
  competition: AdminCompetition;
  qrisUrl: string | null;
};

export type AdminTwibbonProofsProps = {
  team: AdminTeam;
  lang: Locale;
};
