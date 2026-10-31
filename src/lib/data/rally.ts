import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LoAccount, LoPost, RallyCompetition, RallyPostWithLos } from "@/types/rally";

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
    .select("post:rally_posts ( id, name, kind, location, allow_draw, is_active )")
    .eq("lo_id", userId);
  if (error) throw new Error(`Could not load your posts: ${error.message}`);
  return (data as unknown as { post: LoPost | null }[]).flatMap((row) => (row.post ? [row.post] : []));
}
