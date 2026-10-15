import type { Enums, Tables } from "@/types/database";

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
  | "registration_opens_at"
  | "registration_closes_at"
>;

export type CompetitionCardProps = {
  competition: PublicCompetition;
};
