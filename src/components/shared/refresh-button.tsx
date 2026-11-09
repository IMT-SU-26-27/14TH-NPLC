"use client";

import { RotateCwIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { RefreshButtonProps } from "@/types/system";

// "Muat ulang" for pages that no longer use realtime (dashboard, admin registrations). It also refreshes the page when
// the tab becomes visible again, at most every 30 seconds.
export function RefreshButton({ className }: RefreshButtonProps) {
  const { t } = useI18n();
  const { refresh, pending } = useRefreshOnFocus();

  return (
    <Button type="button" variant="outline" size="sm" className={className} disabled={pending} onClick={refresh}>
      {pending ? <Spinner data-icon="inline-start" /> : <RotateCwIcon data-icon="inline-start" />}
      {t("common.reload")}
    </Button>
  );
}
