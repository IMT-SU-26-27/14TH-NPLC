"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setSingleDevice } from "@/lib/actions/team-device";
import { useI18n } from "@/hooks/use-i18n";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import type { SingleDeviceSwitchProps } from "@/types/team-device";

// The emergency switch for the one-device rule, in case it gets in the way on contest day.
export function SingleDeviceSwitch({ competitionId, enabled }: SingleDeviceSwitchProps) {
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();

  const change = (checked: boolean) =>
    startTransition(async () => {
      const result = await setSingleDevice(competitionId, checked);
      if (result.ok) toast.success(t(result.message ?? "admin.devices.turnedOn"));
      else toast.error(t(result.message));
    });

  return (
    <Field orientation="horizontal" className="w-fit">
      <Switch id="singleDevice" checked={enabled} disabled={pending} onCheckedChange={change} />
      <FieldLabel htmlFor="singleDevice" className="whitespace-nowrap">
        {t("admin.devices.switchLabel")}
      </FieldLabel>
      {pending && <Spinner />}
    </Field>
  );
}
