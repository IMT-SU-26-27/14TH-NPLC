import type { ReactNode } from "react";
import type { z } from "zod";
import type { Database } from "@/types/database";
import type { Locale } from "@/types/i18n";
import type { teamDeviceAnswerSchema } from "@/lib/validations/team-device";

export type TeamDeviceStatus = "off" | "active" | "waiting" | "blocked" | "rejected" | "expired";

export type TeamDeviceAction = Database["public"]["Enums"]["team_device_action"];

export type TeamDeviceAnswerInput = z.infer<typeof teamDeviceAnswerSchema>;

// What this browser sees of its team's device lock (team_device_sync).
export type TeamDeviceState = {
  status: TeamDeviceStatus;
  holderName: string | null;
  holderLabel: string | null;
  holderSince: string | null;
  requestName: string | null;
  requestLabel: string | null;
  requestAt: string | null;
};

export type TeamDeviceGuardProps = {
  competitionId: string;
  // Rendered only while this device holds the team (the leave-the-page monitor).
  monitor: ReactNode;
  children: ReactNode;
};

export type ContestAccessGateProps = {
  children: ReactNode;
};

export type TeamDeviceRequestDialogProps = {
  state: TeamDeviceState;
  onAnswer: (approve: boolean) => Promise<void>;
};

export type TeamDeviceLockScreenProps = {
  state: TeamDeviceState;
  // This browser held the team earlier in this visit and lost it.
  movedAway: boolean;
  onRequest: () => Promise<void>;
};

export type TeamDevicePerson = { full_name: string; email: string } | null;

export type AdminTeamDeviceRow = {
  registrationId: string;
  teamName: string;
  holderName: string | null;
  holderLabel: string;
  claimedAt: string;
  seenAt: string;
  // Checked in within the last 90 s; an offline holder is replaced by the next device without asking.
  online: boolean;
  pendingName: string | null;
  pendingLabel: string | null;
};

export type AdminTeamDeviceEvent = {
  id: number;
  teamName: string;
  action: TeamDeviceAction;
  memberName: string | null;
  label: string | null;
  createdAt: string;
};

export type AdminTeamDevices = {
  singleDevice: boolean;
  devices: AdminTeamDeviceRow[];
  events: AdminTeamDeviceEvent[];
};

export type TeamDevicesCardProps = {
  competitionId: string;
  lang: Locale;
};

export type TeamDeviceResetButtonProps = {
  registrationId: string;
  teamName: string;
};

export type SingleDeviceSwitchProps = {
  competitionId: string;
  enabled: boolean;
};
