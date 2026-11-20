import { z } from "zod";

const name = z.string().trim().min(1, "rally.eco.name").max(80, "rally.eco.name");
const money = z.coerce.number().int("rally.eco.amount").min(0, "rally.eco.amount").max(100_000_000, "rally.eco.amount");
const signedMoney = z.coerce.number().int("rally.eco.amount").min(-100_000_000, "rally.eco.amount").max(100_000_000, "rally.eco.amount");
const percent = z.coerce.number().min(0, "rally.eco.amount").max(100, "rally.eco.amount");
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);
const optionalInt = z.preprocess((v) => (v === "" || v === null ? null : v), z.coerce.number().int().min(0).nullable());

export const ecoSettingsSchema = z.object({
  startingCash: money,
  round: z.coerce.number().int().min(1).max(100),
  roundPriceStep: z.coerce.number().min(0, "rally.eco.amount").max(1000, "rally.eco.amount"),
  promoPercent: percent,
});

export const ecoItemSchema = z.object({
  id: z.uuid().optional(),
  name,
  kind: z.enum(["attack", "defense"]),
  price: money,
  power: money,
  stock: optionalInt,
  isActive: z.boolean(),
});

export const ecoLandSchema = z.object({
  id: z.uuid().optional(),
  name,
  region: z.string().trim().max(40),
  price: money,
  mapX: optionalInt,
  mapY: optionalInt,
});

export const ecoAssetSchema = z.object({
  id: z.uuid().optional(),
  name,
  price: money,
  isActive: z.boolean(),
});

export const ecoEventSchema = z.object({
  id: z.uuid().optional(),
  name,
  description: z.string().trim().max(500),
  effect: z.enum(["cash", "land_price", "asset_price"]),
  // Cash: money per team (negative = loss). Prices: percent change (-50 halves it).
  amount: z.coerce.number().min(-100_000_000, "rally.eco.amount").max(100_000_000, "rally.eco.amount"),
  region: optionalText(40),
  assetId: z.preprocess((v) => v || null, z.uuid().nullable()),
  defenseNeeded: z.coerce.number().int().min(0).max(1000),
  isActive: z.boolean(),
});

export const ecoGrantSchema = z.object({
  registrationId: z.uuid(),
  amount: signedMoney.refine((v) => v !== 0, "rally.eco.amount"),
  note: z.string().trim().max(200),
});

export const ecoBuyItemSchema = z.object({
  registrationId: z.uuid(),
  itemId: z.uuid(),
  quantity: z.coerce.number().int().min(1).max(1000),
});

export const ecoBuyLandSchema = z.object({
  registrationId: z.uuid(),
  landId: z.uuid(),
});

export const ecoTradeSchema = z.object({
  registrationId: z.uuid(),
  assetId: z.uuid(),
  // Positive buys, negative sells.
  units: z.coerce.number().int().min(-100_000).max(100_000).refine((v) => v !== 0, "rally.eco.amount"),
});

export const ecoShieldSchema = z.object({
  registrationId: z.uuid(),
  landId: z.uuid(),
  itemId: z.uuid(),
});

export const ecoAttackSchema = z.object({
  attackerId: z.uuid(),
  itemId: z.uuid(),
  targetId: z.uuid(),
  landId: z.preprocess((v) => v || null, z.uuid().nullable()),
});
