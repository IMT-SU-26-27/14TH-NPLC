import "server-only";
import { getServerEnv } from "@/lib/server-env";
import type { CpLanguage, CpVerdict, Judge0Result, Judge0Run } from "@/types/cp";

// Language ids on the self-hosted Judge0 (GET /languages). Java sources must declare `public class Main`.
export const JUDGE0_LANGUAGE_ID: Record<CpLanguage, number> = {
  python: 71, // Python (3.8.1)
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
};

const BATCH_SIZE = 20; // max_submission_batch_size on the server
const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 90_000;

// Judge0 status id -> our verdict (see docs/judge0-errors.md).
const STATUS_VERDICT: Record<number, CpVerdict> = {
  3: "accepted",
  4: "wrong_answer",
  5: "time_limit_exceeded",
  6: "compilation_error",
  7: "runtime_error_sigsegv",
  8: "runtime_error_sigxfsz",
  9: "runtime_error_sigfpe",
  10: "runtime_error_sigabrt",
  11: "runtime_error_nzec",
  12: "runtime_error_other",
  13: "internal_error",
  14: "exec_format_error",
};

export class Judge0Error extends Error {}

const b64 = (text: string) => Buffer.from(text, "utf8").toString("base64");
const unb64 = (text: string | null | undefined) => (text ? Buffer.from(text, "base64").toString("utf8") : "");

async function judge0<T>(path: string, init?: RequestInit): Promise<T> {
  const env = getServerEnv();
  const response = await fetch(`${env.JUDGE0_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Auth-Token": env.JUDGE0_AUTH_TOKEN, ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new Judge0Error(`Judge0 ${path} answered ${response.status}`);
  return response.json() as Promise<T>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Runs every input against the same program and waits for all results.
// Expected output is NOT sent: we compare ourselves, so status 3 means "ran without error".
export async function runOnJudge0(runs: Judge0Run[]): Promise<Judge0Result[]> {
  const tokens: string[] = [];
  for (let i = 0; i < runs.length; i += BATCH_SIZE) {
    const chunk = runs.slice(i, i + BATCH_SIZE).map((run) => ({
      source_code: b64(run.sourceCode),
      language_id: JUDGE0_LANGUAGE_ID[run.language],
      stdin: b64(run.stdin),
      cpu_time_limit: run.cpuTimeLimitSeconds,
      wall_time_limit: Math.min(20, run.cpuTimeLimitSeconds * 3 + 1),
      memory_limit: run.memoryLimitKb,
    }));
    const created = await judge0<{ token?: string; error?: string }[]>("/submissions/batch?base64_encoded=true", {
      method: "POST",
      body: JSON.stringify({ submissions: chunk }),
    });
    for (const item of created) {
      if (!item.token) throw new Judge0Error(item.error ?? "Judge0 rejected a submission");
      tokens.push(item.token);
    }
  }

  const results = new Map<string, Judge0Result>();
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (results.size < tokens.length) {
    if (Date.now() > deadline) throw new Judge0Error("Judge0 took too long to answer");
    await sleep(POLL_INTERVAL_MS);
    const pending = tokens.filter((t) => !results.has(t));
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const ids = pending.slice(i, i + BATCH_SIZE).join(",");
      const { submissions } = await judge0<{
        submissions: {
          token: string;
          status: { id: number };
          time: string | null;
          memory: number | null;
          stdout: string | null;
          stderr: string | null;
          compile_output: string | null;
          message: string | null;
        }[];
      }>(`/submissions/batch?tokens=${ids}&base64_encoded=true&fields=token,status,time,memory,stdout,stderr,compile_output,message`);
      for (const s of submissions) {
        if (s.status.id <= 2) continue; // in queue / processing
        results.set(s.token, {
          statusId: s.status.id,
          timeSeconds: s.time === null ? null : Number(s.time),
          memoryKb: s.memory,
          stdout: unb64(s.stdout),
          stderr: unb64(s.stderr),
          compileOutput: unb64(s.compile_output),
          message: unb64(s.message),
        });
      }
    }
  }

  return tokens.map((t) => results.get(t)!);
}

// Trailing spaces on each line and trailing blank lines are ignored; Windows line endings are normalised.
export function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");
}

export function verdictFor(result: Judge0Result, expectedOutput: string): CpVerdict {
  const verdict = STATUS_VERDICT[result.statusId] ?? "internal_error";
  if (verdict !== "accepted") return verdict;
  return normalizeOutput(result.stdout) === normalizeOutput(expectedOutput) ? "accepted" : "wrong_answer";
}
