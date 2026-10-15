import type { Enums, Tables } from "@/types/database";
import type { Locale } from "@/types/i18n";

export type Competition = Tables<"competitions">;
export type CompetitionType = Enums<"competition_type">;

export type PublicCompetition = Pick<
  Competition,
  | "id"
  | "slug"
  | "name"
  | "type"
  | "description"
  | "min_members"
  | "max_members"
  | "fee"
  | "qris_public_id"
  | "payment_method"
  | "bank_account_number"
  | "bank_account_holder"
  | "registration_opens_at"
  | "registration_closes_at"
>;

export type PaymentMethod = Competition["payment_method"];

export type PaymentDetails = Pick<Competition, "name" | "fee" | "payment_method" | "bank_account_number" | "bank_account_holder">;

export type PaymentInstructionsProps = {
  details: PaymentDetails;
  qrisUrl: string | null;
};

export type RegistrationWindow = Pick<Competition, "registration_opens_at" | "registration_closes_at">;

export type CompetitionCardProps = {
  competition: PublicCompetition;
  lang: Locale;
};
