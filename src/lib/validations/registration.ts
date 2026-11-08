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

// The participant's own Instagram post with the twibbon: https, instagram.com, a post or reel path.
export function isInstagramPostUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "instagram.com" || url.hostname === "www.instagram.com") &&
      /^\/(p|reel|reels)\/[A-Za-z0-9_-]+/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

// Empty while the competition has no twibbon link yet; the database requires it once a link is set.
const twibbonPostUrl = z
  .union([
    z.literal("").transform(() => undefined),
    z.string().trim().max(500, "validation.twibbonPostUrl").refine(isInstagramPostUrl, "validation.twibbonPostUrl"),
  ])
  .optional();

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
  twibbonPostUrl,
});

export const joinTeamSchema = z.object({
  referralCode: referralCodeSchema,
  fullName,
  nisn,
  phone,
  twibbonPostUrl,
});

export const PAYMENT_PROOF_FORMATS = PAYMENT_PROOF_FORMATS_LIST;

export const submitPaymentSchema = z.object({
  registrationId: z.uuid(),
  publicId: z.string().min(1),
  format: z.enum(PAYMENT_PROOF_FORMATS),
});

export const registrationIdSchema = z.uuid();
