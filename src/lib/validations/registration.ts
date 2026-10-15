import { z } from "zod";

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\+?[0-9]{8,15}$/, "Enter a phone number like 081234567890"));

const nisn = z.string().trim().regex(/^[0-9]{10}$/, "NISN is exactly 10 digits");

const fullName = z.string().trim().min(2, "Enter the full name").max(100);

export const referralCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{8}$/, "Team codes are 8 letters and numbers");

export const createRegistrationSchema = z.object({
  competitionId: z.uuid(),
  teamName: z.string().trim().min(2, "Use at least 2 characters").max(60, "Use at most 60 characters"),
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

export const PAYMENT_PROOF_FORMATS = ["jpg", "jpeg", "png", "webp", "pdf"] as const;

export const submitPaymentSchema = z.object({
  registrationId: z.uuid(),
  publicId: z.string().min(1),
  format: z.enum(PAYMENT_PROOF_FORMATS),
});

export const registrationIdSchema = z.uuid();
