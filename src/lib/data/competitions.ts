import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { PublicCompetition, RegistrationWindow } from "@/types/competition";

export const COMPETITIONS_TAG = "competitions";

const PUBLIC_COLUMNS =
  "id, slug, name, type, description, description_en, min_members, max_members, max_teams, fee, twibbon_url, qris_public_id, payment_method, bank_account_number, bank_account_holder, registration_opens_at, registration_closes_at";

// Public list for the landing and register pages. Admin edits call updateTag(COMPETITIONS_TAG).
export async function getActiveCompetitions(): Promise<PublicCompetition[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(COMPETITIONS_TAG);

  const { data, error } = await createSupabasePublicClient()
    .from("competitions")
    .select(PUBLIC_COLUMNS)
    .eq("is_active", true)
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(`Could not load competitions: ${error.message}`);
  return data;
}

// Teams that take a place (every status but rejected), by competition id. Cached with the competitions: the actions
// that add, reopen or remove a team call updateTag(COMPETITIONS_TAG).
export async function getCompetitionTeamCounts(): Promise<Record<string, number>> {
  "use cache";
  cacheLife("minutes");
  cacheTag(COMPETITIONS_TAG);

  const { data, error } = await createSupabasePublicClient().rpc("competition_team_counts");
  if (error) throw new Error(`Could not load team counts: ${error.message}`);
  return Object.fromEntries(data.map((row) => [row.competition_id, row.team_count]));
}

// Full once the teams that are not rejected reach max_teams. Null means no limit.
export function isQuotaFull(competition: Pick<PublicCompetition, "id" | "max_teams">, counts: Record<string, number>): boolean {
  return competition.max_teams !== null && (counts[competition.id] ?? 0) >= competition.max_teams;
}

export async function getActiveCompetitionBySlug(slug: string): Promise<PublicCompetition | null> {
  const competitions = await getActiveCompetitions();
  return competitions.find((c) => c.slug === slug) ?? null;
}

export function isRegistrationOpen(competition: RegistrationWindow, now = new Date()): boolean {
  const opens = competition.registration_opens_at ? new Date(competition.registration_opens_at) : null;
  const closes = competition.registration_closes_at ? new Date(competition.registration_closes_at) : null;
  return (!opens || now >= opens) && (!closes || now < closes);
}
