import { z } from "zod";

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\+?[0-9]{8,15}$/, "validation.phone"));

const nisn = z.string().trim().regex(/^[0-9]{10}$/, "validation.nisn");

const fullName = z.string().trim().min(2, "validation.fullName").max(100);

export const schoolSchema = z.string().trim().min(2, "validation.school").max(120, "validation.school");

// LINE IDs are 4-20 characters and case-insensitive. People often paste them with a leading @.
export const lineIdSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/^@/, "").toLowerCase())
  .pipe(z.string().regex(/^[a-z0-9._-]{4,20}$/, "validation.lineId"));

export const referralCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{8}$/, "validation.referralCode");

export const PAYMENT_PROOF_FORMATS_LIST = ["jpg", "jpeg", "png", "webp", "pdf"] as const;

export const createRegistrationSchema = z.object({
  competitionId: z.uuid(),
  paymentProofPublicId: z.string().min(1, "errors.proofRequired"),
  paymentProofFormat: z.enum(PAYMENT_PROOF_FORMATS_LIST, "errors.proofRequired"),
  teamName: z.string().trim().min(2, "validation.teamNameMin").max(60, "validation.teamNameMax"),
  school: schoolSchema,
  lineId: lineIdSchema,
  leaderName: fullName,
  leaderPhone: phone,
  leaderNisn: nisn,
});

export const joinTeamSchema = z.object({
  referralCode: referralCodeSchema,
  fullName,
  nisn,
  phone: z.union([z.literal("").transform(() => undefined), phone]).optional(),
});

export const PAYMENT_PROOF_FORMATS = PAYMENT_PROOF_FORMATS_LIST;

export const submitPaymentSchema = z.object({
  registrationId: z.uuid(),
  publicId: z.string().min(1),
  format: z.enum(PAYMENT_PROOF_FORMATS),
});

export const registrationIdSchema = z.uuid();
