"use client";

import { useSyncExternalStore } from "react";
import { hasInstallPrompt, promptInstall, subscribeInstallPrompt, wasInstalled } from "@/lib/pwa/install-prompt";
import type { InstallAppMode, InstallAppState } from "@/types/pwa";

function currentMode(): InstallAppMode {
  if (wasInstalled() || window.matchMedia("(display-mode: standalone)").matches) return "installed";
  if (hasInstallPrompt()) return "prompt";
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "manual";
}

// How this device can install the site as an app, for the Profile page's install card.
export function useInstallApp(): InstallAppState {
  const mode = useSyncExternalStore(subscribeInstallPrompt, currentMode, () => "checking" as const);
  return { mode, install: promptInstall };
}
