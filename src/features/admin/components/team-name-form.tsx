"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateTeamName } from "@/lib/actions/admin-registrations";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { TeamNameFormProps } from "@/types/admin";

export function TeamNameForm({ registrationId, teamName }: TeamNameFormProps) {
  const [state, action, pending] = useActionState(updateTeamName, initialFormState);
  const { t, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(t(state.message));
    if (state.status === "error" && state.message && !state.fieldErrors) toast.error(t(state.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast once per action result
  }, [state]);

  return (
    <form action={action}>
      <input type="hidden" name="registrationId" value={registrationId} />
      <Field data-invalid={!!errors.teamName}>
        <FieldLabel htmlFor="teamName">{t("register.teamName")}</FieldLabel>
        <div className="flex gap-2">
          <Input id="teamName" name="teamName" defaultValue={teamName} maxLength={60} aria-invalid={!!errors.teamName} required />
          <Button type="submit" variant="outline" disabled={pending}>
            {pending && <Spinner />}
            {t("admin.detail.rename")}
          </Button>
        </div>
        <FieldError errors={fieldErrors(errors.teamName)} />
      </Field>
    </form>
  );
}
