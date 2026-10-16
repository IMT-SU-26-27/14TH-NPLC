// Browser-side helpers for web push.

export const SERVICE_WORKER_URL = "/sw.js";

// The VAPID public key is base64url; PushManager.subscribe wants the raw bytes.
export function vapidKeyToBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export function subscriptionInput(subscription: PushSubscription, locale: "id" | "en") {
  const { keys } = subscription.toJSON();
  return {
    endpoint: subscription.endpoint,
    keys: { p256dh: keys?.p256dh ?? "", auth: keys?.auth ?? "" },
    locale,
    userAgent: navigator.userAgent.slice(0, 400),
  };
}

// iPhone and iPad only expose PushManager to sites opened from the Home Screen.
export function needsHomeScreenInstall(): boolean {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios && !window.matchMedia("(display-mode: standalone)").matches;
}
