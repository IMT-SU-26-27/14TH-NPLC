import { z } from "zod";

// A form draft as stored in localStorage. Parsed on every read: the value can be stale, edited or from an older version.
export const formDraftSchema = z.object({
  savedAt: z.number().int().positive(),
  values: z.record(z.string(), z.string()),
});
