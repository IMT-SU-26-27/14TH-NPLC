// Chrome and Edge fire this before showing their own "Install app" prompt. Not in the DOM typings yet.
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// "installed": opened from the Home Screen or as an installed app.
// "prompt": the browser offered installation, so our button can show its dialog.
// "ios": iPhone/iPad, installed only through Share → Add to Home Screen.
// "manual": no prompt available (yet); install from the browser menu.
export type InstallAppMode = "checking" | "installed" | "prompt" | "ios" | "manual";

export type InstallAppState = {
  mode: InstallAppMode;
  install: () => Promise<boolean>;
};
