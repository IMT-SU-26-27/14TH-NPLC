"use server";

import { refresh } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { getRallyCompetition } from "@/lib/data/rally";
import { databaseErrorMessage } from "@/lib/form";
import { uuidSchema } from "@/lib/validations/admin";
import {
  ecoAssetSchema,
  ecoAttackSchema,
  ecoBuyItemSchema,
  ecoBuyLandSchema,
  ecoEventSchema,
  ecoGrantSchema,
  ecoItemSchema,
  ecoLandSchema,
  ecoSettingsSchema,
  ecoShieldSchema,
  ecoTradeSchema,
} from "@/lib/validations/rally-economy";
import type { ActionResult } from "@/types";
import type { EcoAttackOutcome } from "@/types/rally-economy";

// The database checks every call too (RLS and the rally_eco_* functions); these checks only fail fast.
// Setup (catalogue, settings, start, events, finalize) is admin only; team actions are for admins and LOs.
async function role() {
  return (await getCurrentUser())?.role;
}
const NOT_ADMIN = { ok: false, message: "errors.adminOnly" } as const;
const NOT_STAFF = { ok: false, message: "errors.permission" } as const;
const INVALID = { ok: false, message: "errors.invalidRequest" } as const;

function failed(error: { code?: string; message: string }): ActionResult<never> {
  return { ok: false, message: error.code === "23503" ? "rally.eco.inUse" : databaseErrorMessage(error) };
}

async function competitionId(): Promise<string | null> {
  return (await getRallyCompetition())?.id ?? null;
}

// ----- Setup (admin) -----

export async function saveEcoSettings(input: unknown): Promise<ActionResult> {
  if ((await role()) !== "admin") return NOT_ADMIN;
  const parsed = ecoSettingsSchema.safeParse(input);
  const id = await competitionId();
  if (!parsed.success || !id) return INVALID;
  const p = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("rally_eco_settings").upsert({
    competition_id: id,
    starting_cash: p.startingCash,
    round: p.round,
    round_price_step: p.roundPriceStep,
    promo_percent: p.promoPercent,
    attacks_open: p.attacksOpen,
    updated_at: new Date().toISOString(),
  });
  if (error) return failed(error);
  refresh();
  return { ok: true, data: undefined };
}

export async function saveEcoItem(input: unknown): Promise<ActionResult> {
  if ((await role()) !== "admin") return NOT_ADMIN;
  const parsed = ecoItemSchema.safeParse(input);
  const id = await competitionId();
  if (!parsed.success || !id) return INVALID;
  const { id: itemId, isActive, ...p } = parsed.data;
  const row = { name: p.name, kind: p.kind, price: p.price, power: p.power, stock: p.stock, is_active: isActive };
  const supabase = await createSupabaseServerClient();
  const { error } = itemId
    ? await supabase.from("rally_eco_items").update(row).eq("id", itemId)
    : await supabase.from("rally_eco_items").insert({ ...row, competition_id: id });
  if (error) return failed(error);
  refresh();
  return { ok: true, data: undefined };
}

export async function saveEcoLand(input: unknown): Promise<ActionResult> {
  if ((await role()) !== "admin") return NOT_ADMIN;
  const parsed = ecoLandSchema.safeParse(input);
  const id = await competitionId();
  if (!parsed.success || !id) return INVALID;
  const p = parsed.data;
  const row = { name: p.name, region: p.region, price: p.price, map_x: p.mapX, map_y: p.mapY };
  const supabase = await createSupabaseServerClient();
  const { error } = p.id
    ? await supabase.from("rally_eco_lands").update(row).eq("id", p.id)
    : await supabase.from("rally_eco_lands").insert({ ...row, competition_id: id });
  if (error) return failed(error);
  refresh();
  return { ok: true, data: undefined };
}

export async function saveEcoAsset(input: unknown): Promise<ActionResult> {
  if ((await role()) !== "admin") return NOT_ADMIN;
  const parsed = ecoAssetSchema.safeParse(input);
  const id = await competitionId();
  if (!parsed.success || !id) return INVALID;
  const p = parsed.data;
  const row = { name: p.name, price: p.price, is_active: p.isActive };
  const supabase = await createSupabaseServerClient();
  const { error } = p.id
    ? await supabase.from("rally_eco_assets").update(row).eq("id", p.id)
    : await supabase.from("rally_eco_assets").insert({ ...row, competition_id: id });
  if (error) return failed(error);
  refresh();
  return { ok: true, data: undefined };
}

export async function saveEcoEvent(input: unknown): Promise<ActionResult> {
  if ((await role()) !== "admin") return NOT_ADMIN;
  const parsed = ecoEventSchema.safeParse(input);
  const id = await competitionId();
  if (!parsed.success || !id) return INVALID;
  const p = parsed.data;
  const row = {
    name: p.name,
    description: p.description,
    effect: p.effect,
    amount: p.amount,
    region: p.region,
    asset_id: p.assetId,
    defense_needed: p.defenseNeeded,
    defense_item_id: p.defenseItemId,
    is_active: p.isActive,
  };
  const supabase = await createSupabaseServerClient();
  const { error } = p.id
    ? await supabase.from("rally_eco_events").update(row).eq("id", p.id)
    : await supabase.from("rally_eco_events").insert({ ...row, competition_id: id });
  if (error) return failed(error);
  refresh();
  return { ok: true, data: undefined };
}

const DELETABLE = {
  item: "rally_eco_items",
  land: "rally_eco_lands",
  asset: "rally_eco_assets",
  event: "rally_eco_events",
} as const;

// Anything already used in the game (bought, owned, run) is kept; the database refuses with a foreign key error.
export async function deleteEcoEntry(kind: keyof typeof DELETABLE, entryId: string): Promise<ActionResult> {
  if ((await role()) !== "admin") return NOT_ADMIN;
  const id = uuidSchema.safeParse(entryId);
  if (!id.success || !(kind in DELETABLE)) return INVALID;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from(DELETABLE[kind]).delete().eq("id", id.data);
  if (error) return failed(error);
  refresh();
  return { ok: true, data: undefined };
}

// ----- Game control (admin) -----

// Returns how many teams got their starting cash.
export async function startEcoGame(): Promise<ActionResult<number>> {
  if ((await role()) !== "admin") return NOT_ADMIN;
  const id = await competitionId();
  if (!id) return INVALID;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_start", { p_competition_id: id });
  if (error) return failed(error);
  refresh();
  return { ok: true, data };
}

// Returns how many teams, lands or assets the event changed.
export async function triggerEcoEvent(eventId: string): Promise<ActionResult<number>> {
  if ((await role()) !== "admin") return NOT_ADMIN;
  const id = uuidSchema.safeParse(eventId);
  if (!id.success) return INVALID;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_trigger_event", { p_event_id: id.data });
  if (error) return failed(error);
  refresh();
  return { ok: true, data };
}

export async function finalizeEcoGame(): Promise<ActionResult> {
  if ((await role()) !== "admin") return NOT_ADMIN;
  const id = await competitionId();
  if (!id) return INVALID;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("rally_eco_finalize", { p_competition_id: id });
  if (error) return failed(error);
  refresh();
  return { ok: true, data: undefined };
}

// ----- Team actions (admin or LO). Each returns the team's cash afterwards. -----

async function isStaff() {
  const r = await role();
  return r === "admin" || r === "lo";
}

export async function grantEcoMoney(input: unknown): Promise<ActionResult<number>> {
  if (!(await isStaff())) return NOT_STAFF;
  const parsed = ecoGrantSchema.safeParse(input);
  if (!parsed.success) return INVALID;
  const p = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_grant", { p_registration_id: p.registrationId, p_amount: p.amount, p_note: p.note });
  if (error) return failed(error);
  return { ok: true, data };
}

export async function buyEcoItem(input: unknown): Promise<ActionResult<number>> {
  if (!(await isStaff())) return NOT_STAFF;
  const parsed = ecoBuyItemSchema.safeParse(input);
  if (!parsed.success) return INVALID;
  const p = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_buy_item", {
    p_registration_id: p.registrationId,
    p_item_id: p.itemId,
    p_quantity: p.quantity,
  });
  if (error) return failed(error);
  return { ok: true, data };
}

export async function buyEcoLand(input: unknown): Promise<ActionResult<number>> {
  if (!(await isStaff())) return NOT_STAFF;
  const parsed = ecoBuyLandSchema.safeParse(input);
  if (!parsed.success) return INVALID;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_buy_land", {
    p_registration_id: parsed.data.registrationId,
    p_land_id: parsed.data.landId,
  });
  if (error) return failed(error);
  return { ok: true, data };
}

export async function tradeEcoAsset(input: unknown): Promise<ActionResult<number>> {
  if (!(await isStaff())) return NOT_STAFF;
  const parsed = ecoTradeSchema.safeParse(input);
  if (!parsed.success) return INVALID;
  const p = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_trade_asset", {
    p_registration_id: p.registrationId,
    p_asset_id: p.assetId,
    p_units: p.units,
  });
  if (error) return failed(error);
  return { ok: true, data };
}

// Returns the land's shield afterwards.
export async function shieldEcoLand(input: unknown): Promise<ActionResult<number>> {
  if (!(await isStaff())) return NOT_STAFF;
  const parsed = ecoShieldSchema.safeParse(input);
  if (!parsed.success) return INVALID;
  const p = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_shield_land", {
    p_registration_id: p.registrationId,
    p_land_id: p.landId,
    p_item_id: p.itemId,
  });
  if (error) return failed(error);
  return { ok: true, data };
}

export async function attackEcoTeam(input: unknown): Promise<ActionResult<EcoAttackOutcome>> {
  if (!(await isStaff())) return NOT_STAFF;
  const parsed = ecoAttackSchema.safeParse(input);
  if (!parsed.success) return INVALID;
  const p = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rally_eco_attack", {
    p_attacker_id: p.attackerId,
    p_item_id: p.itemId,
    p_target_id: p.targetId,
    p_land_id: p.landId,
  });
  if (error) return failed(error);
  return { ok: true, data: data as EcoAttackOutcome };
}
