"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateTeamSchool } from "@/lib/actions/admin-registrations";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { TeamSchoolFormProps } from "@/types/admin";

export function TeamSchoolForm({ registrationId, school }: TeamSchoolFormProps) {
  const [state, action, pending] = useActionState(updateTeamSchool, initialFormState);
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
      <Field data-invalid={!!errors.school}>
        <FieldLabel htmlFor="school">{t("register.school")}</FieldLabel>
        <div className="flex gap-2">
          <Input id="school" name="school" defaultValue={school ?? ""} maxLength={120} aria-invalid={!!errors.school} required />
          <Button type="submit" variant="outline" disabled={pending}>
            {pending && <Spinner />}
            {t("common.save")}
          </Button>
        </div>
        <FieldError errors={fieldErrors(errors.school)} />
      </Field>
    </form>
  );
}
