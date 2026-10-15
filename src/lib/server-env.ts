import "server-only";
import { serverEnvSchema } from "@/lib/validations/env";
import type { ServerEnv } from "@/types/env";

let cached: ServerEnv | undefined;

// Parsed on first use so a missing secret fails the feature that needs it, with a clear message.
export function getServerEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse(process.env);
  return cached;
}
