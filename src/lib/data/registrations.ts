import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Team, TeamPreview } from "@/types/registration";

const TEAM_SELECT = `
  id, team_name, referral_code, status, leader_id, payment_proof_public_id, payment_submitted_at, rejection_reason, created_at,
  competition:competitions ( id, slug, name, type, min_members, max_members, fee, qris_public_id, registration_opens_at, registration_closes_at ),
  members:registration_members ( id, user_id, full_name, email, phone, nisn, is_leader, created_at ),
  events:registration_events ( id, status, note, created_at )
`;

// Every team the signed-in user leads or belongs to (RLS limits the rows).
export async function getMyTeams(): Promise<Team[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(TEAM_SELECT)
    .order("created_at", { ascending: false })
    .order("is_leader", { referencedTable: "members", ascending: false })
    .order("created_at", { referencedTable: "members" })
    .order("created_at", { referencedTable: "events" });
  if (error) throw new Error(`Could not load your teams: ${error.message}`);
  return data as unknown as Team[];
}

export async function previewTeam(referralCode: string): Promise<TeamPreview | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("preview_team", { p_referral_code: referralCode });
  if (error) throw new Error(`Could not look up the team: ${error.message}`);
  return data?.[0] ?? null;
}
