"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { subscribeAuthed } from "@/lib/supabase/realtime";
import { useI18n } from "@/hooks/use-i18n";
import type { RegistrationStatus } from "@/types/registration";

// Refreshes the dashboard when an admin accepts or rejects one of these registrations.
export function useRegistrationRealtime(registrationIds: string[]) {
  const router = useRouter();
  const { t } = useI18n();
  const key = registrationIds.join(",");

  useEffect(() => {
    if (!key) return;
    return subscribeAuthed(`registration-events:${key}`, (channel) =>
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "registration_events", filter: `registration_id=in.(${key})` },
        (payload) => {
          const status = (payload.new as { status: RegistrationStatus }).status;
          if (status === "accepted") toast.success(t("dashboard.accepted"));
          if (status === "rejected") toast.error(t("dashboard.rejected"));
          router.refresh();
        },
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t changes identity every render; the language is fixed per page
  }, [key, router]);
}
