import { z } from "zod";

const points = z.coerce.number().int("validation.rallyPoints").min(0, "validation.rallyPoints").max(100000, "validation.rallyPoints");

export const rallyPostSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "validation.rallyPostName").max(80, "validation.rallyPostName"),
  kind: z.enum(["physical", "digital"]),
  location: z
    .string()
    .trim()
    .max(120)
    .transform((v) => v || null),
  pointsWin: points,
  pointsLose: points,
  pointsDraw: points,
  allowDraw: z.boolean(),
  isActive: z.boolean(),
  loIds: z.array(z.uuid()),
});

export const loAccountSchema = z.object({
  fullName: z.string().trim().min(2, "validation.fullName").max(100),
  email: z.email("validation.email").trim().toLowerCase(),
  password: z.string().min(8, "validation.passwordMin").max(72),
});

export const rallyOutcomeSchema = z.enum(["win", "lose", "draw"]);

export const rallyLookupSchema = z.object({
  postId: z.uuid(),
  code: z.string().trim().min(1, "rally.errors.teamNotFound").max(100, "rally.errors.teamNotFound"),
});

export const rallyRecordSchema = z.object({
  postId: z.uuid(),
  registrationId: z.uuid(),
  outcome: rallyOutcomeSchema,
  clientRequestId: z.uuid(),
});

const reason = z.string().trim().min(5, "rally.errors.reasonRequired").max(500, "rally.errors.reasonRequired");

export const rallyCorrectionSchema = z.object({
  resultId: z.uuid(),
  outcome: rallyOutcomeSchema,
  reason,
});

export const rallyDeleteResultSchema = z.object({
  resultId: z.uuid(),
  reason,
});

// Search params for the results and log pages. Anything invalid falls back to "no filter".
export const rallyFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(100)
    .transform((v) => v.replace(/[,()%*\\]/g, " ").trim())
    .catch(""),
  post: z.uuid().optional().catch(undefined),
  team: z.uuid().optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});
