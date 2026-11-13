import type { Json } from "@/types/database";
import type { ProblemStatus } from "@/types/cp";

// Reads one problem out of cp_scores.problems ({ "<problem id>": { solved, wrong } }); null when never submitted.
export function problemStatus(problems: Json, problemId: string): ProblemStatus | null {
  if (!problems || typeof problems !== "object" || Array.isArray(problems)) return null;
  const entry = problems[problemId];
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  return { solved: entry.solved === true, wrong: typeof entry.wrong === "number" ? entry.wrong : 0 };
}
