"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2Icon, DownloadIcon, InfoIcon, ShareIcon } from "lucide-react";
import { useInstallApp } from "@/hooks/use-install-app";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

// "Install app": the browser's automatic install banner is blocked (InstallPromptListener), so installing
// happens here, on request. iPhone and iPad only install through Share → Add to Home Screen.
export function InstallAppCard() {
  const { t } = useI18n();
  const app = useInstallApp();
  const [busy, setBusy] = useState(false);

  async function install() {
    setBusy(true);
    const accepted = await app.install();
    setBusy(false);
    if (accepted) toast.success(t("pwa.installed"));
  }

  return (
    <Card className="ring-border rounded-[12px] py-6 sm:py-9">
      <CardHeader className="px-5 sm:px-10">
        <CardTitle className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{`// ${t("pwa.title")}`}</CardTitle>
        <CardDescription className="text-sm">{t("pwa.lead")}</CardDescription>
      </CardHeader>
      <CardContent className="px-5 sm:px-10">
        {app.mode === "checking" && <Skeleton className="h-10" />}
        {app.mode === "installed" && (
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>{t("pwa.installedTitle")}</AlertTitle>
            <AlertDescription>{t("pwa.installedBody")}</AlertDescription>
          </Alert>
        )}
        {app.mode === "prompt" && (
          <Button onClick={install} disabled={busy}>
            {busy ? <Spinner /> : <DownloadIcon />}
            {t("pwa.install")}
          </Button>
        )}
        {app.mode === "ios" && (
          <Alert>
            <ShareIcon />
            <AlertTitle>{t("pwa.iosTitle")}</AlertTitle>
            <AlertDescription>{t("pwa.ios")}</AlertDescription>
          </Alert>
        )}
        {app.mode === "manual" && (
          <Alert>
            <InfoIcon />
            <AlertTitle>{t("pwa.manualTitle")}</AlertTitle>
            <AlertDescription>{t("pwa.manual")}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
