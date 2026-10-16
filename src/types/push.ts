import type { z } from "zod";
import type { pushSubscriptionSchema } from "@/lib/validations/push";
import type { ActionResult } from "@/types";
import type { TranslateParams } from "@/types/i18n";

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

// Title and body are dictionary keys, translated per device into the language it subscribed with.
export type PushMessage = {
  title: string;
  body: string;
  params?: TranslateParams;
  url: string; // path without the language prefix, e.g. "/dashboard"
  tag?: string; // a newer notification with the same tag replaces the older one
};

// What the service worker (public/sw.js) receives.
export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

// "off": the server has no VAPID keys, so push is not offered at all.
export type PushSupport = "checking" | "off" | "unsupported" | "needs-install" | "supported";

export type PushPromptProps = {
  hasTeams: boolean;
};

export type PushNotificationsState = {
  support: PushSupport;
  permission: NotificationPermission | null;
  subscribed: boolean;
  busy: boolean;
  enable: () => Promise<ActionResult>;
  disable: () => Promise<ActionResult>;
};
