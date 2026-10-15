import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { PublicCompetition, RegistrationWindow } from "@/types/competition";

export const COMPETITIONS_TAG = "competitions";

const PUBLIC_COLUMNS =
  "id, slug, name, type, description, min_members, max_members, fee, qris_public_id, registration_opens_at, registration_closes_at";

// Public list for the landing and register pages. Admin edits call updateTag(COMPETITIONS_TAG).
export async function getActiveCompetitions(): Promise<PublicCompetition[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(COMPETITIONS_TAG);

  const { data, error } = await createSupabasePublicClient()
    .from("competitions")
    .select(PUBLIC_COLUMNS)
    .eq("is_active", true)
    .order("created_at");
  if (error) throw new Error(`Could not load competitions: ${error.message}`);
  return data;
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
