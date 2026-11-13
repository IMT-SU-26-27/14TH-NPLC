"use client";

import { usePathname } from "next/navigation";
import { ExpandIcon, ShieldAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { useFocusMonitor } from "@/hooks/use-focus-monitor";
import { useI18n } from "@/hooks/use-i18n";
import { formatDuration } from "@/lib/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const PROBLEM_PATH = /\/cp\/problems\/([0-9a-f-]{36})/;

// Mounted once in the contest layout for participants. Active on every contest page except the waiting room,
// so moving between problems and the leaderboard inside the site is never counted as leaving.
export function ContestFocusMonitor() {
  const { t, lang } = useI18n();
  const pathname = usePathname();
  const enabled = /\/cp(\/|$)/.test(pathname) && !pathname.includes("/cp/waiting");
  const problemId = PROBLEM_PATH.exec(pathname)?.[1] ?? null;

  const { fullscreen, enterFullscreen } = useFocusMonitor(enabled, problemId, (kind, ms) => {
    if (kind === "fullscreen_exit") return;
    toast.warning(t("cp.focus.returnedTitle"), {
      description: t("cp.focus.returned", { duration: formatDuration(Math.max(1, Math.round(ms / 1000)), lang) }),
    });
  });

  // Shown in the waiting room too, so teams can switch to fullscreen before the start; only recorded once live.
  if (fullscreen) return null;

  return (
    <Alert className="mb-6">
      <ShieldAlertIcon />
      <AlertTitle>{t("cp.focus.fullscreenTitle")}</AlertTitle>
      <AlertDescription>
        <p>{t("cp.focus.fullscreenLead")}</p>
        <Button size="sm" className="mt-2" onClick={() => void enterFullscreen()}>
          <ExpandIcon />
          {t("cp.focus.fullscreenAction")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
