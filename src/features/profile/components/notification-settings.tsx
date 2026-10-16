"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BellOffIcon, InfoIcon, SendIcon, SmartphoneIcon } from "lucide-react";
import { sendTestPush } from "@/lib/actions/push";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import type { ActionResult } from "@/types";

export function NotificationSettings() {
  const { t } = useI18n();
  const push = usePushNotifications();
  const [testing, setTesting] = useState(false);

  function report(result: ActionResult) {
    if (result.ok) {
      if (result.message) toast.success(t(result.message));
    } else toast.error(t(result.message));
  }

  async function toggle(on: boolean) {
    report(on ? await push.enable() : await push.disable());
  }

  async function test() {
    setTesting(true);
    report(await sendTestPush());
    setTesting(false);
  }

  const blocked = push.support === "supported" && push.permission === "denied";
  if (push.support === "off") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("push.settingsTitle")}</CardTitle>
        <CardDescription>{t("push.settingsLead")}</CardDescription>
      </CardHeader>
      <CardContent>
        {push.support === "checking" && <Skeleton className="h-12" />}
        {push.support === "unsupported" && (
          <Alert>
            <BellOffIcon />
            <AlertTitle>{t("push.unsupportedTitle")}</AlertTitle>
            <AlertDescription>{t("push.unsupported")}</AlertDescription>
          </Alert>
        )}
        {push.support === "needs-install" && (
          <Alert>
            <SmartphoneIcon />
            <AlertTitle>{t("push.installTitle")}</AlertTitle>
            <AlertDescription>{t("push.install")}</AlertDescription>
          </Alert>
        )}
        {push.support === "supported" && (
          <div className="space-y-4">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="push-switch">{t("push.thisDevice")}</FieldLabel>
                <FieldDescription>{push.subscribed ? t("push.onDescription") : t("push.offDescription")}</FieldDescription>
              </FieldContent>
              <Switch id="push-switch" checked={push.subscribed} disabled={push.busy || blocked} onCheckedChange={toggle} />
            </Field>
            {blocked && (
              <Alert>
                <InfoIcon />
                <AlertTitle>{t("push.blockedTitle")}</AlertTitle>
                <AlertDescription>{t("push.blocked")}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      {push.subscribed && (
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={test} disabled={testing}>
            {testing ? <Spinner /> : <SendIcon />}
            {t("push.sendTest")}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
