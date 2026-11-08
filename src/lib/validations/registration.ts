import { z } from "zod";

// WhatsApp number: required, the committee contacts teams on it (LINE ID is no longer asked for).
const phone = z
  .string()
  .trim()
  .min(1, "validation.phoneRequired")
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\+?[0-9]{8,15}$/, "validation.phone"));

const nisn = z.string().trim().regex(/^[0-9]{10}$/, "validation.nisn");

const fullName = z.string().trim().min(2, "validation.fullName").max(100);

export const schoolSchema = z.string().trim().min(2, "validation.school").max(120, "validation.school");

export const referralCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{8}$/, "validation.referralCode");

export const TWIBBON_PROOF_FORMATS = ["jpg", "jpeg", "png", "webp"] as const;

// Empty while the competition has no twibbon link yet; the database requires it once a link is set.
const twibbonProof = {
  twibbonProofPublicId: z.string().min(1).optional(),
  twibbonProofFormat: z.enum(TWIBBON_PROOF_FORMATS).optional(),
};

export const PAYMENT_PROOF_FORMATS_LIST = ["jpg", "jpeg", "png", "webp", "pdf"] as const;

export const createRegistrationSchema = z.object({
  competitionId: z.uuid(),
  paymentProofPublicId: z.string().min(1, "errors.proofRequired"),
  paymentProofFormat: z.enum(PAYMENT_PROOF_FORMATS_LIST, "errors.proofRequired"),
  teamName: z.string().trim().min(2, "validation.teamNameMin").max(60, "validation.teamNameMax"),
  school: schoolSchema,
  leaderName: fullName,
  leaderPhone: phone,
  leaderNisn: nisn,
  ...twibbonProof,
});

export const joinTeamSchema = z.object({
  referralCode: referralCodeSchema,
  fullName,
  nisn,
  phone,
  ...twibbonProof,
});

export const PAYMENT_PROOF_FORMATS = PAYMENT_PROOF_FORMATS_LIST;

export const submitPaymentSchema = z.object({
  registrationId: z.uuid(),
  publicId: z.string().min(1),
  format: z.enum(PAYMENT_PROOF_FORMATS),
});

export const registrationIdSchema = z.uuid();
