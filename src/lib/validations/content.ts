import { z } from "zod";

export const aboutContentSchema = z.object({
  aboutTitleId: z.string().trim().max(120),
  aboutTitleEn: z.string().trim().max(120),
  aboutBodyId: z.string().trim().max(5000),
  aboutBodyEn: z.string().trim().max(5000),
});

export const timelineEventSchema = z
  .object({
    id: z.uuid().optional(),
    startsOn: z.iso.date("validation.date"),
    endsOn: z.union([z.literal("").transform(() => null), z.iso.date("validation.date")]),
    titleId: z.string().trim().min(1, "validation.titleId").max(120),
    titleEn: z.string().trim().min(1, "validation.titleEn").max(120),
    descriptionId: z.string().trim().max(1000),
    descriptionEn: z.string().trim().max(1000),
    // "all": every competition (stored as null).
    competitionType: z.enum(["all", "competitive_programming", "logic"]).transform((v) => (v === "all" ? null : v)),
  })
  .refine((v) => !v.endsOn || v.endsOn >= v.startsOn, { message: "validation.endsOnAfterStartsOn", path: ["endsOn"] });
