import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Competition } from "@/types/competition";
import type {
  AdminTeam,
  CompetitionOption,
  CompetitionStats,
  RegistrationFilters,
  RegistrationList,
  RegistrationTrend,
} from "@/types/admin";

// Every function here relies on the caller having passed requireAdmin(); RLS also limits non-admins.

export const PAGE_SIZE = 25;

export async function getCompetitionStats(): Promise<CompetitionStats[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("competition_stats").select("*").order("name");
  if (error) throw new Error(`Could not load stats: ${error.message}`);
  return data;
}

export async function listCompetitionOptions(): Promise<CompetitionOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("competitions").select("id, name").order("created_at");
  if (error) throw new Error(`Could not load competitions: ${error.message}`);
  return data;
}

export async function listCompetitions(): Promise<Competition[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("competitions").select("*").order("created_at");
  if (error) throw new Error(`Could not load competitions: ${error.message}`);
  return data;
}

export async function getCompetition(id: string): Promise<Competition | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("competitions").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function listRegistrations(filters: RegistrationFilters): Promise<RegistrationList> {
  const supabase = await createSupabaseServerClient();
  const from = (filters.page - 1) * PAGE_SIZE;

  let query = supabase
    .from("registration_overview")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (filters.competition) query = query.eq("competition_id", filters.competition);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.q) {
    const like = `%${filters.q}%`;
    query = query.or(
      ["team_name", "school", "leader_name", "leader_email", "leader_nisn", "leader_phone", "referral_code"]
        .map((column) => `${column}.ilike.${like}`)
        .join(","),
    );
  }

  const { data, count, error } = await query;
  if (error) throw new Error(`Could not load registrations: ${error.message}`);
  return { rows: data, total: count ?? 0, page: filters.page, pageSize: PAGE_SIZE };
}

export async function getRegistrationDetail(id: string): Promise<AdminTeam | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("registrations")
    .select(
      `id, team_name, school, line_id, referral_code, status, leader_id, payment_proof_public_id, payment_proof_format, payment_submitted_at,
       rejection_reason, reviewed_at, created_at,
       competition:competitions ( id, slug, name, type, min_members, max_members, fee, qris_public_id, payment_method, bank_account_number, bank_account_holder, registration_opens_at, registration_closes_at ),
       members:registration_members ( id, user_id, full_name, email, phone, nisn, is_leader, created_at ),
       events:registration_events ( id, status, note, created_at )`,
    )
    .eq("id", id)
    .order("is_leader", { referencedTable: "members", ascending: false })
    .order("created_at", { referencedTable: "members" })
    .order("created_at", { referencedTable: "events" })
    .maybeSingle();
  return data as unknown as AdminTeam | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const wibDay = (iso: string | number) => new Date(new Date(iso).getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10);

// New registrations per WIB day per competition, zero-filled over the last `days` days.
export async function getRegistrationTrend(days = 30): Promise<RegistrationTrend> {
  const supabase = await createSupabaseServerClient();
  const since = new Date(Date.now() - (days - 1) * DAY_MS);
  const sinceDay = wibDay(since.getTime());

  const [{ data: competitions, error: cError }, { data: rows, error: rError }] = await Promise.all([
    // Stable order so each competition keeps its colour: competitive programming first, then by age.
    supabase.from("competitions").select("id, name").order("type").order("created_at").order("slug"),
    supabase
      .from("registrations")
      .select("competition_id, created_at")
      .gte("created_at", new Date(`${sinceDay}T00:00:00+07:00`).toISOString()),
  ]);
  if (cError) throw new Error(`Could not load competitions: ${cError.message}`);
  if (rError) throw new Error(`Could not load registrations: ${rError.message}`);

  const series = competitions.map((c, i) => ({ id: c.id, name: c.name, key: `c${i + 1}` }));
  const keyFor = new Map(series.map((s) => [s.id, s.key]));

  const points = Array.from({ length: days }, (_, i) => {
    const point: Record<string, string | number> = { date: wibDay(since.getTime() + i * DAY_MS) };
    for (const s of series) point[s.key] = 0;
    return point;
  });
  const indexOf = new Map(points.map((p, i) => [p.date as string, i]));

  for (const row of rows) {
    const i = indexOf.get(wibDay(row.created_at));
    const key = keyFor.get(row.competition_id);
    if (i !== undefined && key) points[i][key] = (points[i][key] as number) + 1;
  }

  const total = rows.length;
  return { series, points, total, days };
}
