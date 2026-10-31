import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import type { Team, TeamPreview } from "@/types/registration";

const TEAM_SELECT = `
  id, team_name, referral_code, status, leader_id, payment_proof_public_id, payment_submitted_at, rejection_reason, created_at,
  competition:competitions ( id, slug, name, type, min_members, max_members, fee, qris_public_id, payment_method, bank_account_number, bank_account_holder, registration_opens_at, registration_closes_at ),
  members:registration_members ( id, user_id, full_name, email, phone, nisn, is_leader, created_at ),
  events:registration_events ( id, status, note, created_at ),
  mine:registration_members!inner ()
`;

// Every team the signed-in user belongs to; leaders are members too.
// Filtered on membership because RLS also lets admins read every team. `mine` narrows the rows, `members` still lists the whole team.
export const getMyTeams = cache(async (): Promise<Team[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(TEAM_SELECT)
    .eq("mine.user_id", user.id)
    .order("created_at", { ascending: false })
    .order("is_leader", { referencedTable: "members", ascending: false })
    .order("created_at", { referencedTable: "members" })
    .order("created_at", { referencedTable: "events" });
  if (error) throw new Error(`Could not load your teams: ${error.message}`);
  return data as unknown as Team[];
});

// One account can be on only one team across all competitions.
export async function hasRegistration(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("registration_members")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw new Error(`Could not check your registration: ${error.message}`);
  return (count ?? 0) > 0;
}

export async function previewTeam(referralCode: string): Promise<TeamPreview | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("preview_team", { p_referral_code: referralCode });
  if (error) throw new Error(`Could not look up the team: ${error.message}`);
  return data?.[0] ?? null;
}
