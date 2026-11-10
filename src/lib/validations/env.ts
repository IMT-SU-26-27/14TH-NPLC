import { z } from "zod";

// Web push asks for a contact as "mailto:…" or "https://…". A bare email address is accepted and gets "mailto:".
const vapidSubject = z
  .string()
  .trim()
  .transform((v) => (v.includes("@") && !/^(mailto:|https:\/\/)/.test(v) ? `mailto:${v}` : v))
  .pipe(z.string().regex(/^(mailto:|https:\/\/)/));

// Web push is optional and must never stop the rest of the site (registration uploads, judging): a missing or broken
// VAPID value only turns push off. Without the keys the notification switch is hidden and nothing is sent.
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional().catch(undefined),
});

export const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  JUDGE0_URL: z.url(),
  JUDGE0_AUTH_TOKEN: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1).optional().catch(undefined),
  VAPID_SUBJECT: vapidSubject.optional().catch(undefined),
});
