"use client";

import { useState } from "react";
import { useI18n } from "@/hooks/use-i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import type { TeamDeviceRequestDialogProps } from "@/types/team-device";

// On the active device when another device of the team asks to take over. It stays open until answered or until the
// request expires (the guard then unmounts it); Escape does not dismiss it, so the answer is always a choice.
export function TeamDeviceRequestDialog({ state, onAnswer }: TeamDeviceRequestDialogProps) {
  const { t } = useI18n();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);

  const reply = async (approve: boolean) => {
    setPending(approve ? "approve" : "reject");
    await onAnswer(approve);
    setPending(null);
  };

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("cp.device.requestTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("cp.device.requestLead", {
              name: state.requestName ?? t("cp.device.someone"),
              device: state.requestLabel || t("cp.device.unknownDevice"),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-muted-foreground space-y-2 text-sm">
          <p className="text-foreground font-medium">{t("cp.device.requestCode")}</p>
          <p>{t("cp.device.requestTimeout")}</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending !== null} onClick={() => void reply(false)}>
            {pending === "reject" && <Spinner />}
            {t("cp.device.reject")}
          </AlertDialogCancel>
          <AlertDialogAction disabled={pending !== null} onClick={() => void reply(true)}>
            {pending === "approve" && <Spinner />}
            {t("cp.device.approve")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
