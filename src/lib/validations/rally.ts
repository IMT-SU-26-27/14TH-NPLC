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
