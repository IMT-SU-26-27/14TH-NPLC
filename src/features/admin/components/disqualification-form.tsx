"use client";

import { useActionState, useState } from "react";
import { BanIcon, OctagonXIcon, UndoIcon } from "lucide-react";
import { toast } from "sonner";
import { disqualifyTeam, liftDisqualification } from "@/lib/actions/admin-registrations";
import { initialFormState } from "@/lib/form";
import { formatDateTime } from "@/lib/format";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/types";
import type { DisqualificationFormProps } from "@/types/admin";

// Disqualify an accepted team (reason required, shown to the team) or lift it again. Results are never deleted.
export function DisqualificationForm({ registrationId, disqualifiedAt, reason }: DisqualificationFormProps) {
  const { t, lang, fieldErrors } = useI18n();
  const [open, setOpen] = useState(false);
  // Closes the dialog and confirms in the same step as the action, instead of reacting to its state afterwards.
  const [state, action, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const next = await disqualifyTeam(prev, formData);
    if (next.status === "success") {
      if (next.message) toast.success(t(next.message));
      setOpen(false);
    }
    return next;
  }, initialFormState);
  const lift = useConfirmAction();
  const errors = state.fieldErrors ?? {};

  if (disqualifiedAt) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <BanIcon />
          <AlertTitle>{t("admin.detail.disqualifiedOn", { date: formatDateTime(disqualifiedAt, lang) })}</AlertTitle>
          <AlertDescription>{reason}</AlertDescription>
        </Alert>
        <AlertDialog open={lift.open} onOpenChange={lift.setOpen}>
          <AlertDialogTrigger render={<Button variant="outline" />}>
            <UndoIcon />
            {t("admin.detail.liftDisqualification")}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("admin.detail.liftTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("admin.detail.liftDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={lift.pending}>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                disabled={lift.pending}
                onClick={() => lift.run(() => liftDisqualification(registrationId), "admin.detail.disqualificationLifted")}
              >
                {lift.pending && <Spinner />}
                {t("admin.detail.liftDisqualification")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        <BanIcon />
        {t("admin.detail.disqualify")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="registrationId" value={registrationId} />
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.detail.disqualifyTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.detail.disqualifyDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <Field data-invalid={!!errors.reason}>
            <FieldLabel htmlFor="disqualifyReason">{t("admin.detail.reason")}</FieldLabel>
            <Textarea
              id="disqualifyReason"
              name="reason"
              placeholder={t("admin.detail.disqualifyPlaceholder")}
              aria-invalid={!!errors.reason}
              required
            />
            <FieldDescription>{t("admin.detail.disqualifyHint")}</FieldDescription>
            <FieldError errors={fieldErrors(errors.reason)} />
          </Field>
          {state.status === "error" && state.message && !errors.reason && (
            <Alert variant="destructive">
              <OctagonXIcon />
              <AlertDescription>{t(state.message)}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{t("common.cancel")}</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending && <Spinner />}
              {t("admin.detail.disqualify")}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
