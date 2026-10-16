import { z } from "zod";

// PushSubscription.toJSON() from the browser, plus the language the notifications should be written in.
export const pushSubscriptionSchema = z.object({
  endpoint: z.url().startsWith("https://").max(1000),
  keys: z.object({
    p256dh: z.string().min(1).max(200),
    auth: z.string().min(1).max(100),
  }),
  locale: z.enum(["id", "en"]),
  userAgent: z.string().max(400).optional(),
});

export const pushEndpointSchema = z.url().startsWith("https://").max(1000);
