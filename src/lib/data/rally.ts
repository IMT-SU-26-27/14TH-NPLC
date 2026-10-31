import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  LoAccount,
  LoPost,
  RallyCompetition,
  RallyFilters,
  RallyLogEntry,
  RallyLogList,
  RallyPostOption,
  RallyPostWithLos,
  RallyRecentResult,
  RallyResultList,
  RallyResultRow,
} from "@/types/rally";

const POST_SELECT = `
  id, name, kind, location, points_win, points_lose, points_draw, allow_draw, is_active,
  assignments:rally_post_assignments ( lo:profiles ( id, full_name ) )
`;

// Rally Games runs on the competition of type "logic" (Category 2).
export async function getRallyCompetition(): Promise<RallyCompetition | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("id, name")
    .eq("type", "logic")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Could not load the rally competition: ${error.message}`);
  return data;
}

export async function listRallyPosts(competitionId: string): Promise<RallyPostWithLos[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("rally_posts").select(POST_SELECT).eq("competition_id", competitionId).order("name");
  if (error) throw new Error(`Could not load the posts: ${error.message}`);
  return data as unknown as RallyPostWithLos[];
}

export async function getRallyPost(id: string): Promise<RallyPostWithLos | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("rally_posts").select(POST_SELECT).eq("id", id).maybeSingle();
  return data as unknown as RallyPostWithLos | null;
}

export async function listLoAccounts(): Promise<LoAccount[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").select("id, full_name, email").eq("role", "lo").order("full_name");
  if (error) throw new Error(`Could not load the LO accounts: ${error.message}`);
  return data;
}

// RLS limits assignments to the signed-in LO's own.
export async function listMyLoPosts(userId: string): Promise<LoPost[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("rally_post_assignments")
    .select("post:rally_posts ( id, name, kind, location, allow_draw, is_active, points_win, points_lose, points_draw )")
    .eq("lo_id", userId);
  if (error) throw new Error(`Could not load your posts: ${error.message}`);
  return (data as unknown as { post: LoPost | null }[]).flatMap((row) => (row.post ? [row.post] : []));
}

export async function listRecentRallyResults(postId: string): Promise<RallyRecentResult[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_recent_results", { p_post_id: postId });
  if (error) throw new Error(`Could not load the latest results: ${error.message}`);
  return data;
}

export const RALLY_PAGE_SIZE = 25;

export async function listRallyPostOptions(competitionId: string): Promise<RallyPostOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("rally_posts").select("id, name, allow_draw").eq("competition_id", competitionId).order("name");
  if (error) throw new Error(`Could not load the posts: ${error.message}`);
  return data;
}

// Active results only. Undone and corrected ones remain in the log.
export async function listRallyResults(filters: RallyFilters): Promise<RallyResultList> {
  const supabase = await createSupabaseServerClient();
  const from = (filters.page - 1) * RALLY_PAGE_SIZE;
  let query = supabase
    .from("rally_results")
    .select(
      `id, outcome, points, recorded_at,
       post:rally_posts ( id, name, allow_draw ),
       registration:registrations!inner ( id, team_name, school ),
       recorder:profiles!rally_results_recorded_by_fkey ( full_name )`,
      { count: "exact" },
    )
    .is("voided_at", null)
    .order("recorded_at", { ascending: false })
    .range(from, from + RALLY_PAGE_SIZE - 1);
  if (filters.post) query = query.eq("post_id", filters.post);
  if (filters.team) query = query.eq("registration_id", filters.team);
  if (filters.q) query = query.ilike("registration.team_name", `%${filters.q}%`);

  const { data, count, error } = await query;
  if (error) throw new Error(`Could not load the results: ${error.message}`);
  return { rows: data as unknown as RallyResultRow[], total: count ?? 0, page: filters.page, pageSize: RALLY_PAGE_SIZE };
}

export async function listRallyLog(filters: RallyFilters): Promise<RallyLogList> {
  const supabase = await createSupabaseServerClient();
  const from = (filters.page - 1) * RALLY_PAGE_SIZE;
  let query = supabase
    .from("rally_result_log")
    .select(
      `id, action, old_outcome, new_outcome, old_points, new_points, reason, created_at,
       post:rally_posts ( name ),
       registration:registrations!inner ( id, team_name ),
       actor:profiles!rally_result_log_actor_id_fkey ( full_name )`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + RALLY_PAGE_SIZE - 1);
  if (filters.post) query = query.eq("post_id", filters.post);
  if (filters.team) query = query.eq("registration_id", filters.team);
  if (filters.q) query = query.ilike("registration.team_name", `%${filters.q}%`);

  const { data, count, error } = await query;
  if (error) throw new Error(`Could not load the log: ${error.message}`);
  return { rows: data as unknown as RallyLogEntry[], total: count ?? 0, page: filters.page, pageSize: RALLY_PAGE_SIZE };
}
