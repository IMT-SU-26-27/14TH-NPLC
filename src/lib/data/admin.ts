import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Competition } from "@/types/competition";
import type {
  AdminCompetition,
  AdminTeam,
  CompetitionOption,
  CompetitionStats,
  RegistrationFilters,
  RegistrationList,
  RegistrationTrend,
  SchoolStatRow,
  SchoolStats,
} from "@/types/admin";

// Every function here relies on the caller having passed requireAdmin(); RLS also limits non-admins.

export const PAGE_SIZE = 10;

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

// Every column the API can read: wa_group_url is left out on purpose (see migration 20261109120000).
const ADMIN_COMPETITION_COLUMNS =
  "id, slug, name, type, description, description_en, min_members, max_members, max_teams, fee, qris_public_id, twibbon_url, payment_method, bank_account_number, bank_account_holder, registration_opens_at, registration_closes_at, is_active, sort_order, created_at, updated_at";

export async function listCompetitions(): Promise<AdminCompetition[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("competitions").select(ADMIN_COMPETITION_COLUMNS).order("created_at");
  if (error) throw new Error(`Could not load competitions: ${error.message}`);
  return data;
}

// Teams that take a place (not rejected), by competition id, inactive competitions included.
export async function getTeamCounts(): Promise<Record<string, number>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("competition_team_counts");
  if (error) throw new Error(`Could not load team counts: ${error.message}`);
  return Object.fromEntries(data.map((row) => [row.competition_id, row.team_count]));
}

// The WhatsApp group link is not readable through the table (column privileges); admin_competition_wa_group_url()
// returns it after checking is_admin(). If that call fails the page fails too, rather than showing an empty link
// field that would erase the saved link on the next save.
export async function getCompetition(id: string): Promise<Competition | null> {
  const supabase = await createSupabaseServerClient();
  const [{ data, error }, { data: waGroupUrl, error: waError }] = await Promise.all([
    supabase.from("competitions").select(ADMIN_COMPETITION_COLUMNS).eq("id", id).maybeSingle(),
    supabase.rpc("admin_competition_wa_group_url", { p_competition_id: id }),
  ]);
  if (error) throw new Error(`Could not load the competition: ${error.message}`);
  if (waError) throw new Error(`Could not load the WhatsApp group link: ${waError.message}`);
  return data ? { ...data, wa_group_url: waGroupUrl ?? null } : null;
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
  // A page past the last one (e.g. ?page=3 after a filter leaves one page) is "range not satisfiable": show no rows.
  if (error?.code === "PGRST103") return { rows: [], total: 0, page: filters.page, pageSize: PAGE_SIZE };
  if (error) throw new Error(`Could not load registrations: ${error.message}`);
  return { rows: data, total: count ?? 0, page: filters.page, pageSize: PAGE_SIZE };
}

export async function getRegistrationDetail(id: string): Promise<AdminTeam | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("registrations")
    .select(
      `id, team_name, school, line_id, referral_code, rally_qr_token, status, leader_id, payment_proof_public_id, payment_proof_format, payment_submitted_at, payer_name,
       rejection_reason, reviewed_at, disqualified_at, disqualification_reason, created_at,
       competition:competitions ( id, slug, name, type, min_members, max_members, fee, qris_public_id, payment_method, bank_account_number, bank_account_holder, registration_opens_at, registration_closes_at ),
       members:registration_members ( id, user_id, full_name, email, phone, nisn, is_leader, created_at, twibbon_proof_public_id, twibbon_proof_format, twibbon_post_url ),
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
// Teams that take a place (not rejected) and their people, per school, split by competition. School is free text,
// so names are grouped ignoring case and extra spaces; "SMAN 1" and "SMA Negeri 1" stay two schools.
export async function getSchoolStats(): Promise<SchoolStats> {
  const supabase = await createSupabaseServerClient();
  const [{ data: competitions, error: cError }, { data: rows, error: rError }] = await Promise.all([
    // Same stable order as the trend chart, so each competition keeps its colour.
    supabase.from("competitions").select("id, name").order("type").order("created_at").order("slug"),
    supabase.from("registration_overview").select("competition_id, school, member_count").neq("status", "rejected"),
  ]);
  if (cError) throw new Error(`Could not load competitions: ${cError.message}`);
  if (rError) throw new Error(`Could not load registrations: ${rError.message}`);

  const series = competitions.map((c, i) => ({ id: c.id, name: c.name, key: `c${i + 1}` }));
  const keyFor = new Map(series.map((s) => [s.id, s.key]));
  const bySchool = new Map<string, SchoolStatRow>();

  for (const row of rows) {
    const name = row.school?.trim().replace(/\s+/g, " ") ?? "";
    const id = name.toLowerCase();
    let school = bySchool.get(id);
    if (!school) {
      school = { school: name, teams: 0, people: 0, ...Object.fromEntries(series.flatMap((s) => [[s.key, 0], [`${s.key}People`, 0]])) };
      bySchool.set(id, school);
    }
    const key = row.competition_id ? keyFor.get(row.competition_id) : undefined;
    if (key) {
      school[key] = Number(school[key]) + 1;
      school[`${key}People`] = Number(school[`${key}People`]) + (row.member_count ?? 0);
    }
    school.teams += 1;
    school.people += row.member_count ?? 0;
  }

  // Most teams first; the unnamed group (teams from before the school field) last.
  const schools = [...bySchool.values()].sort(
    (a, b) => Number(a.school === "") - Number(b.school === "") || b.teams - a.teams || b.people - a.people || a.school.localeCompare(b.school),
  );
  return { series, schools };
}

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
