"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { RegistrationStatus } from "@/types/registration";

const STATUS_TOAST: Partial<Record<RegistrationStatus, string>> = {
  accepted: "Your registration was accepted 🎉",
  rejected: "Your registration was rejected. See the reason on your dashboard.",
};

// Refreshes the dashboard when an admin accepts or rejects one of these registrations.
export function useRegistrationRealtime(registrationIds: string[]) {
  const router = useRouter();
  const key = registrationIds.join(",");

  useEffect(() => {
    if (!key) return;
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`registration-events:${key}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "registration_events", filter: `registration_id=in.(${key})` },
        (payload) => {
          const status = (payload.new as { status: RegistrationStatus }).status;
          const message = STATUS_TOAST[status];
          if (status === "accepted" && message) toast.success(message);
          else if (message) toast.error(message);
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [key, router]);
}
