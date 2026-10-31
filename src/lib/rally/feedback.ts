// A short buzz, because a scan takes seconds and the LO is watching the team, not the screen. iOS has no vibrate.
export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined") navigator.vibrate?.(pattern);
}

export const VIBRATE_READ = 80;
export const VIBRATE_SAVED = [120, 60, 120];
export const VIBRATE_ERROR = [300];
