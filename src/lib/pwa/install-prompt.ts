import type { BeforeInstallPromptEvent } from "@/types/pwa";

// Keeps the browser's install offer instead of letting it pop up on its own. The site stays installable:
// the Profile page shows an "Install app" button that replays the saved offer.

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

let listening = false;

// Registered as early as possible (on import from the root layout), before the browser fires the event.
export function listenForInstallPrompt() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // no automatic "Install app?" banner
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installed = true;
    notify();
  });
}

listenForInstallPrompt();

export function subscribeInstallPrompt(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function hasInstallPrompt() {
  return deferred !== null;
}

export function wasInstalled() {
  return installed;
}

// Shows the browser's install dialog. Each saved offer can be used once.
export async function promptInstall(): Promise<boolean> {
  const event = deferred;
  if (!event) return false;
  deferred = null;
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
}
