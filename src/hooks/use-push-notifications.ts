"use client";

import { useEffect, useState } from "react";
import { publicEnv } from "@/lib/env";
import { needsHomeScreenInstall, SERVICE_WORKER_URL, subscriptionInput, vapidKeyToBytes } from "@/lib/push/client";
import { removePushSubscription, savePushSubscription } from "@/lib/actions/push";
import { useI18n } from "@/hooks/use-i18n";
import type { ActionResult } from "@/types";
import type { PushNotificationsState, PushSupport } from "@/types/push";

const VAPID_KEY = publicEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Web push for this browser: registers the service worker, and turns this device's subscription on or off.
export function usePushNotifications(): PushNotificationsState {
  const { lang } = useI18n();
  const [support, setSupport] = useState<PushSupport>("checking");
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      const capable = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!VAPID_KEY) return { support: "off" as PushSupport, sub: null };
      if (!capable) return { support: (needsHomeScreenInstall() ? "needs-install" : "unsupported") as PushSupport, sub: null };
      const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: "/", updateViaCache: "none" });
      const sub = await registration.pushManager.getSubscription();
      // Re-save an existing subscription: keeps its language current and moves it to whoever is
      // signed in now if someone else used this browser before.
      if (sub && Notification.permission === "granted") await savePushSubscription(subscriptionInput(sub, lang));
      return { support: "supported" as PushSupport, sub };
    }

    detect()
      .then((result) => {
        if (cancelled) return;
        setSupport(result.support);
        setSubscription(result.sub);
        setPermission("Notification" in window ? Notification.permission : null);
      })
      .catch(() => {
        if (!cancelled) setSupport("unsupported");
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  async function enable(): Promise<ActionResult> {
    if (!VAPID_KEY) return { ok: false, message: "push.notConfigured" };
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return { ok: false, message: "push.blocked" };

      const registration = await navigator.serviceWorker.ready;
      const sub =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKeyToBytes(VAPID_KEY) }));
      const saved = await savePushSubscription(subscriptionInput(sub, lang));
      if (!saved.ok) {
        await sub.unsubscribe();
        return saved;
      }
      setSubscription(sub);
      return saved;
    } catch {
      return { ok: false, message: "push.enableFailed" };
    } finally {
      setBusy(false);
    }
  }

  async function disable(): Promise<ActionResult> {
    if (!subscription) return { ok: true, data: undefined };
    setBusy(true);
    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      setSubscription(null);
      return await removePushSubscription(endpoint);
    } catch {
      return { ok: false, message: "push.saveFailed" };
    } finally {
      setBusy(false);
    }
  }

  return { support, permission, subscribed: !!subscription, busy, enable, disable };
}
