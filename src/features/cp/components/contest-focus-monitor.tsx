"use client";

import { usePathname } from "next/navigation";
import { ExpandIcon, ShieldAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { useFocusMonitor } from "@/hooks/use-focus-monitor";
import { useI18n } from "@/hooks/use-i18n";
import { formatDuration } from "@/lib/format";
import { CP_FOCUS_WARNING_LIMIT } from "@/lib/validations/cp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const PROBLEM_PATH = /\/cp\/problems\/([0-9a-f-]{36})/;

// Mounted once in the contest layout for participants. Active on every contest page except the waiting room and
// the results page, so moving between problems and the leaderboard inside the site is never counted as leaving.
export function ContestFocusMonitor() {
  const { t, lang } = useI18n();
  const pathname = usePathname();
  const onResult = pathname.includes("/cp/result");
  const enabled = /\/cp(\/|$)/.test(pathname) && !pathname.includes("/cp/waiting") && !onResult;
  const problemId = PROBLEM_PATH.exec(pathname)?.[1] ?? null;

  const { fullscreen, enterFullscreen } = useFocusMonitor(enabled, problemId, (kind, ms, result) => {
    const duration = ms === null ? null : formatDuration(Math.max(1, Math.round(ms / 1000)), lang);
    if (result?.warned) {
      const reached = result.warnings >= CP_FOCUS_WARNING_LIMIT;
      (reached ? toast.error : toast.warning)(t("cp.focus.warningTitle", { count: result.warnings, limit: CP_FOCUS_WARNING_LIMIT }), {
        description: [
          duration ? t("cp.focus.returned", { duration }) : t("cp.focus.returnedReload"),
          reached ? t("cp.focus.warningReached") : t("cp.focus.warningRule", { limit: CP_FOCUS_WARNING_LIMIT }),
        ].join(" "),
        duration: 15_000,
      });
      return;
    }
    // Short stretches are recorded but are not warnings; leaving fullscreen briefly gets no toast at all.
    if (kind === null || kind === "fullscreen_exit" || duration === null) return;
    toast.info(t("cp.focus.returnedTitle"), { description: t("cp.focus.returned", { duration }) });
  });

  // Shown in the waiting room too, so teams can switch to fullscreen before the start; only recorded once live.
  // The results page is not part of the contest, so it has no fullscreen reminder.
  if (fullscreen || onResult) return null;

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
