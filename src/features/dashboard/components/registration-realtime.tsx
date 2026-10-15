"use client";

import { useRegistrationRealtime } from "@/hooks/use-registration-realtime";
import type { RegistrationRealtimeProps } from "@/types/registration";

// Renders nothing; keeps the dashboard in sync with admin decisions.
export function RegistrationRealtime({ registrationIds }: RegistrationRealtimeProps) {
  useRegistrationRealtime(registrationIds);
  return null;
}
