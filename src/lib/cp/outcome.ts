import type { CpOutcome, CpVerdict } from "@/types/cp";

// The submission responses named in the Programming guidebook (section 06). Runtime errors of every kind are one
// response there; judge failures are not a response at all and never cost points.
export function submissionOutcome(verdict: CpVerdict, alreadySolved: boolean): CpOutcome {
  switch (verdict) {
    case "accepted":
      return alreadySolved ? "solved" : "accepted";
    case "wrong_answer":
      return "wrongAnswer";
    case "time_limit_exceeded":
      return "timeLimit";
    case "compilation_error":
      return "compileError";
    case "internal_error":
    case "exec_format_error":
      return "judgeError";
    default:
      return "runtimeError";
  }
}
