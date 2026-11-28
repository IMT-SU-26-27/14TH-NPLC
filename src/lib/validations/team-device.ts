import { z } from "zod";

export const teamDeviceSyncSchema = z.object({
  competitionId: z.uuid(),
  request: z.boolean(),
});

export const teamDeviceAnswerSchema = z.object({
  competitionId: z.uuid(),
  approve: z.boolean(),
});

export const singleDeviceSchema = z.object({
  competitionId: z.uuid(),
  enabled: z.boolean(),
});
