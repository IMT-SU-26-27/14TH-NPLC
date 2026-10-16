import type { CpVerdict } from "@/types/cp";

// The floating verdict guide listens for this event, so a toast (or any component) can open it
// at a specific verdict without sharing React state.
export const VERDICT_GUIDE_EVENT = "nplc:open-verdict-guide";

// Verdicts explained in the guide, in the order players meet them. exec_format_error shares
// internal_error's entry (same cause, same advice).
export const GUIDE_VERDICTS = [
  "wrong_answer",
  "time_limit_exceeded",
  "compilation_error",
  "runtime_error_nzec",
  "runtime_error_sigsegv",
  "runtime_error_sigfpe",
  "runtime_error_sigabrt",
  "runtime_error_sigxfsz",
  "runtime_error_other",
  "internal_error",
] as const satisfies readonly CpVerdict[];

export function guideEntryFor(verdict: CpVerdict): CpVerdict | null {
  if (verdict === "accepted") return null;
  return verdict === "exec_format_error" ? "internal_error" : verdict;
}

export function openVerdictGuide(verdict?: CpVerdict) {
  window.dispatchEvent(new CustomEvent<CpVerdict | undefined>(VERDICT_GUIDE_EVENT, { detail: verdict }));
}
