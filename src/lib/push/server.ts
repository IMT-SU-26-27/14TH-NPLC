import "server-only";
import webpush from "web-push";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerEnv } from "@/lib/server-env";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import type { PushMessage, PushPayload } from "@/types/push";

let configured: boolean | undefined;

export function isPushConfigured(): boolean {
  if (configured === undefined) {
    const env = getServerEnv();
    configured = !!(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT);
    if (configured) webpush.setVapidDetails(env.VAPID_SUBJECT!, env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, env.VAPID_PRIVATE_KEY!);
  }
  return configured;
}

// Sends one message to every device of these users, each in the language it subscribed with.
// Subscriptions the push service reports as gone (404/410) are deleted. Never throws.
export async function sendPushToUsers(userIds: string[], message: PushMessage): Promise<number> {
  const ids = [...new Set(userIds)];
  if (ids.length === 0 || !isPushConfigured()) return 0;

  const admin = createSupabaseAdminClient();
  const { data: subscriptions, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth, locale")
    .in("user_id", ids);
  if (error) {
    console.error("[push] could not load subscriptions", error.message);
    return 0;
  }

  const expired: string[] = [];
  let sent = 0;
  await Promise.all(
    (subscriptions ?? []).map(async (sub) => {
      const lang = isLocale(sub.locale) ? sub.locale : DEFAULT_LOCALE;
      const t = getT(lang);
      const payload: PushPayload = {
        title: t(message.title, message.params),
        body: t(message.body, message.params),
        url: localePath(lang, message.url),
        tag: message.tag,
      };
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), {
          TTL: 60 * 60 * 24,
          urgency: "high",
        });
        sent += 1;
      } catch (err) {
        if (err instanceof webpush.WebPushError && (err.statusCode === 404 || err.statusCode === 410)) expired.push(sub.id);
        else console.error("[push] send failed", err);
      }
    }),
  );

  if (expired.length) await admin.from("push_subscriptions").delete().in("id", expired);
  return sent;
}
