"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/data/auth";
import { isPushConfigured, sendPushToUsers } from "@/lib/push/server";
import { pushEndpointSchema, pushSubscriptionSchema } from "@/lib/validations/push";
import type { ActionResult } from "@/types";
import type { PushSubscriptionInput } from "@/types/push";

// Saves this browser's subscription for the signed-in user. Written with the service role because
// the endpoint may still belong to another account that used this browser before; it moves to this one.
export async function savePushSubscription(input: PushSubscriptionInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "errors.signInAgain" };
  const parsed = pushSubscriptionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "errors.invalidRequest" };
  const { endpoint, keys, locale, userAgent } = parsed.data;

  const { error } = await createSupabaseAdminClient()
    .from("push_subscriptions")
    .upsert(
      { user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, locale, user_agent: userAgent ?? null },
      { onConflict: "endpoint" },
    );
  if (error) {
    console.error("[push] save failed", error.message);
    return { ok: false, message: "push.saveFailed" };
  }
  return { ok: true, data: undefined, message: "push.enabled" };
}

export async function removePushSubscription(endpoint: string): Promise<ActionResult> {
  const parsed = pushEndpointSchema.safeParse(endpoint);
  if (!parsed.success) return { ok: false, message: "errors.invalidRequest" };

  // RLS: users can only delete their own rows.
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", parsed.data);
  if (error) return { ok: false, message: "push.saveFailed" };
  return { ok: true, data: undefined, message: "push.disabled" };
}

export async function sendTestPush(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "errors.signInAgain" };
  if (!isPushConfigured()) return { ok: false, message: "push.notConfigured" };

  const sent = await sendPushToUsers([user.id], { title: "push.testTitle", body: "push.testBody", url: "/profile", tag: "test" });
  if (sent === 0) return { ok: false, message: "push.testNoDevice" };
  return { ok: true, data: undefined, message: "push.testSent" };
}
