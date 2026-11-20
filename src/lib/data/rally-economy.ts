import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  EcoCatalog,
  EcoLeaderboardRow,
  EcoMapLand,
  EcoPrice,
  EcoTeamState,
  EcoWealthRow,
} from "@/types/rally-economy";

// The full setup for the admin. Events come back only for admins (RLS); everyone else gets an empty list.
export async function getEcoCatalog(competitionId: string): Promise<EcoCatalog> {
  const supabase = await createSupabaseServerClient();
  const [settings, items, lands, assets, events] = await Promise.all([
    supabase.from("rally_eco_settings").select("*").eq("competition_id", competitionId).maybeSingle(),
    supabase.from("rally_eco_items").select("*").eq("competition_id", competitionId).order("created_at"),
    supabase.from("rally_eco_lands").select("*").eq("competition_id", competitionId).order("name"),
    supabase.from("rally_eco_assets").select("*").eq("competition_id", competitionId).order("name"),
    supabase.from("rally_eco_events").select("*").eq("competition_id", competitionId).order("created_at"),
  ]);
  const error = settings.error ?? items.error ?? lands.error ?? assets.error ?? events.error;
  if (error) throw new Error(`Could not load the economy game: ${error.message}`);
  return {
    settings: settings.data,
    items: items.data ?? [],
    lands: lands.data ?? [],
    assets: assets.data ?? [],
    events: events.data ?? [],
  };
}

export async function getEcoLeaderboard(competitionId: string): Promise<EcoLeaderboardRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_leaderboard", { p_competition_id: competitionId });
  if (error) throw new Error(`Could not load the economy leaderboard: ${error.message}`);
  return data;
}

export async function getEcoMap(competitionId: string): Promise<EcoMapLand[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_map", { p_competition_id: competitionId });
  if (error) throw new Error(`Could not load the land map: ${error.message}`);
  return data;
}

// Staff see every team; a participant only their own.
export async function getEcoWealth(competitionId: string): Promise<EcoWealthRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_wealth", { p_competition_id: competitionId });
  if (error) throw new Error(`Could not load team wealth: ${error.message}`);
  return data;
}

// Current prices after the round step and promo.
export async function getEcoPrices(competitionId: string): Promise<EcoPrice[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_prices", { p_competition_id: competitionId });
  if (error) throw new Error(`Could not load prices: ${error.message}`);
  return data;
}

// RLS limits every read to staff or the team's own members.
export async function getEcoTeamState(registrationId: string): Promise<EcoTeamState> {
  const supabase = await createSupabaseServerClient();
  const [inventory, holdings, lands, ledger] = await Promise.all([
    supabase.from("rally_eco_inventory").select("*").eq("registration_id", registrationId).gt("quantity", 0),
    supabase.from("rally_eco_holdings").select("*").eq("registration_id", registrationId).gt("units", 0),
    supabase.from("rally_eco_lands").select("*").eq("owner_registration_id", registrationId).order("name"),
    supabase.from("rally_eco_ledger").select("*").eq("registration_id", registrationId).order("created_at", { ascending: false }),
  ]);
  const error = inventory.error ?? holdings.error ?? lands.error ?? ledger.error;
  if (error) throw new Error(`Could not load the team's economy: ${error.message}`);
  const entries = ledger.data ?? [];
  return {
    cash: entries.reduce((sum, e) => sum + e.amount, 0),
    inventory: inventory.data ?? [],
    holdings: holdings.data ?? [],
    lands: lands.data ?? [],
    ledger: entries.slice(0, 50),
  };
}
