"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BellRingIcon } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { PushPromptProps } from "@/types/push";

const DISMISS_KEY = "nplc:push-prompt-dismissed";

function readDismissed() {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

// One-time nudge for team members who haven't decided on notifications yet. Hidden once they turn
// them on, block them, or press "Not now"; the switch on the profile page stays available.
export function PushPrompt({ hasTeams }: PushPromptProps) {
  const { t } = useI18n();
  const push = usePushNotifications();
  const [dismissed, setDismissed] = useState(readDismissed);

  if (!hasTeams || dismissed || push.support !== "supported" || push.subscribed || push.permission !== "default") return null;

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private mode: the prompt just comes back next visit.
    }
    setDismissed(true);
  }

  async function enable() {
    const result = await push.enable();
    if (result.ok) toast.success(t(result.message ?? "push.enabled"));
    else toast.error(t(result.message));
  }

  return (
    <Alert>
      <BellRingIcon />
      <AlertTitle>{t("push.promptTitle")}</AlertTitle>
      <AlertDescription>
        <p>{t("push.promptDescription")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" onClick={enable} disabled={push.busy}>
            {push.busy && <Spinner />}
            {t("push.turnOn")}
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            {t("push.notNow")}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
