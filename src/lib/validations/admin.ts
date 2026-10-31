import { z } from "zod";
import { lineIdSchema, schoolSchema } from "@/lib/validations/registration";

export const REGISTRATION_STATUSES = ["pending_payment", "under_review", "accepted", "rejected"] as const;

// Search params for /admin/registrations. Anything invalid falls back to "no filter".
export const registrationFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(100)
    .transform((v) => v.replace(/[,()%*\\]/g, " ").trim())
    .catch(""),
  competition: z.uuid().optional().catch(undefined),
  status: z.enum(REGISTRATION_STATUSES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export const reviewRegistrationSchema = z
  .object({
    registrationId: z.uuid(),
    status: z.enum(REGISTRATION_STATUSES),
    rejectionReason: z.string().trim().max(1000).optional(),
  })
  .refine((v) => v.status !== "rejected" || (v.rejectionReason?.length ?? 0) >= 5, {
    message: "validation.rejectionReason",
    path: ["rejectionReason"],
  });

export const updateTeamNameSchema = z.object({
  registrationId: z.uuid(),
  teamName: z.string().trim().min(2, "validation.teamNameMin").max(60, "validation.teamNameMax"),
});

export const adminCreateRegistrationSchema = z.object({
  competitionId: z.uuid("validation.chooseCompetition"),
  teamName: z.string().trim().min(2, "validation.teamNameMin").max(60, "validation.teamNameMax"),
  school: schoolSchema,
  lineId: lineIdSchema,
  leaderEmail: z.email("validation.email").trim().toLowerCase(),
  leaderName: z.string().trim().min(2, "validation.fullName").max(100),
  leaderPhone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\+?[0-9]{8,15}$/, "validation.phone")),
  leaderNisn: z.string().trim().regex(/^[0-9]{10}$/, "validation.nisn"),
});

// <input type="datetime-local"> values are entered in WIB (UTC+7).
const wibDateTime = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : new Date(`${v}:00+07:00`).toISOString()))
  .nullable();

export const competitionSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(2, "validation.nameMin").max(100),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "validation.slug"),
    type: z.enum(["competitive_programming", "logic"]),
    description: z.string().trim().max(2000),
    minMembers: z.coerce.number().int().min(1, "validation.atLeastOne").max(10, "validation.atMostTen"),
    maxMembers: z.coerce.number().int().min(1, "validation.atLeastOne").max(10, "validation.atMostTen"),
    fee: z.coerce.number().int().min(0, "validation.nonNegative"),
    registrationOpensAt: wibDateTime,
    registrationClosesAt: wibDateTime,
    isActive: z.boolean(),
  })
  .refine((v) => v.maxMembers >= v.minMembers, { message: "validation.maxGteMin", path: ["maxMembers"] })
  .refine(
    (v) => !v.registrationOpensAt || !v.registrationClosesAt || v.registrationClosesAt > v.registrationOpensAt,
    { message: "validation.closesAfterOpens", path: ["registrationClosesAt"] },
  );

export const paymentSettingsSchema = z
  .object({
    competitionId: z.uuid(),
    paymentMethod: z.enum(["qris", "bank_transfer"]),
    bankAccountNumber: z
      .string()
      .trim()
      .transform((v) => v.replace(/[\s-]/g, "")),
    bankAccountHolder: z.string().trim().max(100),
  })
  .superRefine((v, ctx) => {
    if (v.paymentMethod !== "bank_transfer") return;
    if (!/^[0-9]{6,20}$/.test(v.bankAccountNumber)) {
      ctx.addIssue({ code: "custom", message: "validation.bankAccountNumber", path: ["bankAccountNumber"] });
    }
    if (v.bankAccountHolder.length < 2) {
      ctx.addIssue({ code: "custom", message: "validation.bankAccountHolder", path: ["bankAccountHolder"] });
    }
  });

export const qrisSchema = z.object({
  competitionId: z.uuid(),
  publicId: z.string().min(1),
});

export const uuidSchema = z.uuid();
