"use client";

import { listenForInstallPrompt } from "@/lib/pwa/install-prompt";

// Rendered once in the root layout so its module loads on every page: importing it starts listening for the
// browser's install offer, which stops the automatic "Install app?" banner. Renders nothing.
export function InstallPromptListener() {
  listenForInstallPrompt();
  return null;
}
