import { z } from "zod";

export const CP_LANGUAGES = ["python", "cpp", "java"] as const;
export const CP_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const codeSubmissionSchema = z.object({
  problemId: z.uuid(),
  language: z.enum(CP_LANGUAGES),
  sourceCode: z
    .string()
    .min(1, "cp.errors.emptyCode")
    .refine((v) => new TextEncoder().encode(v).length <= 65536, "cp.errors.codeTooLong"),
});

export const testCaseSchema = z.object({
  input: z.string().max(2_000_000),
  expectedOutput: z.string().min(1, "validation.expectedOutput").max(2_000_000),
  isSample: z.boolean(),
});

export const problemSchema = z.object({
  id: z.uuid().optional(),
  competitionId: z.uuid(),
  level: z.coerce.number().int().min(1, "validation.atLeastOne").max(999),
  difficulty: z.enum(CP_DIFFICULTIES),
  title: z.string().trim().min(1, "validation.title").max(120),
  statement: z.string().trim().min(1, "validation.statement"),
  inputFormat: z.string().trim().max(5000),
  outputFormat: z.string().trim().max(5000),
  constraints: z.string().trim().max(5000),
  timeLimitMs: z.coerce.number().int().min(100, "validation.timeLimit").max(15000, "validation.timeLimit"),
  memoryLimitKb: z.coerce.number().int().min(16384, "validation.memoryLimit").max(512000, "validation.memoryLimit"),
  points: z.coerce.number().int().min(1, "validation.atLeastOne").max(100000),
  isPublished: z.boolean(),
  testCases: z.array(testCaseSchema).min(1, "validation.testCasesMin").max(100),
});

export const sessionSchema = z
  .object({
    competitionId: z.uuid(),
    scheduledStartAt: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : new Date(`${v}:00+07:00`).toISOString())),
    scheduledEndAt: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : new Date(`${v}:00+07:00`).toISOString())),
    cooldownSeconds: z.coerce.number().int().min(0, "validation.nonNegative").max(600, "validation.cooldownMax"),
  })
  .refine((v) => !v.scheduledStartAt || !v.scheduledEndAt || v.scheduledEndAt > v.scheduledStartAt, {
    message: "validation.endAfterStart",
    path: ["scheduledEndAt"],
  });

export const contestStatusSchema = z.object({
  competitionId: z.uuid(),
  status: z.enum(["scheduled", "live", "paused", "ended"]),
});
