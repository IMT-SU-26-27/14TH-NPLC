import type { z } from "zod";
import type { Database } from "@/types/database";
import type {
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

type Tables = Database["public"]["Tables"];
type Functions = Database["public"]["Functions"];

export type EcoSettings = Tables["rally_eco_settings"]["Row"];
export type EcoItem = Tables["rally_eco_items"]["Row"];
export type EcoLand = Tables["rally_eco_lands"]["Row"];
export type EcoAsset = Tables["rally_eco_assets"]["Row"];
export type EcoEvent = Tables["rally_eco_events"]["Row"];
export type EcoEventRun = Tables["rally_eco_event_runs"]["Row"];
export type EcoInventoryRow = Tables["rally_eco_inventory"]["Row"];
export type EcoHoldingRow = Tables["rally_eco_holdings"]["Row"];
export type EcoLedgerEntry = Tables["rally_eco_ledger"]["Row"];

export type EcoLeaderboardRow = Functions["rally_eco_leaderboard"]["Returns"][number];
export type EcoMapLand = Functions["rally_eco_map"]["Returns"][number];
export type EcoWealthRow = Functions["rally_eco_wealth"]["Returns"][number];
export type EcoPrice = Functions["rally_eco_prices"]["Returns"][number];
export type EcoAttackOutcome = "blocked" | "land_taken" | "cash_taken";

// Everything the admin needs to set up the game.
export type EcoCatalog = {
  settings: EcoSettings | null;
  items: EcoItem[];
  lands: EcoLand[];
  assets: EcoAsset[];
  events: EcoEvent[];
};

// One team's own view: cash, what it holds, and its recent money history.
export type EcoTeamState = {
  cash: number;
  inventory: EcoInventoryRow[];
  holdings: EcoHoldingRow[];
  lands: EcoLand[];
  ledger: EcoLedgerEntry[];
};

export type EcoSettingsInput = z.infer<typeof ecoSettingsSchema>;
export type EcoItemInput = z.infer<typeof ecoItemSchema>;
export type EcoLandInput = z.infer<typeof ecoLandSchema>;
export type EcoAssetInput = z.infer<typeof ecoAssetSchema>;
export type EcoEventInput = z.infer<typeof ecoEventSchema>;
export type EcoGrantInput = z.infer<typeof ecoGrantSchema>;
export type EcoBuyItemInput = z.infer<typeof ecoBuyItemSchema>;
export type EcoBuyLandInput = z.infer<typeof ecoBuyLandSchema>;
export type EcoTradeInput = z.infer<typeof ecoTradeSchema>;
export type EcoShieldInput = z.infer<typeof ecoShieldSchema>;
export type EcoAttackInput = z.infer<typeof ecoAttackSchema>;
