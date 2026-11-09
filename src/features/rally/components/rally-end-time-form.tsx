"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { setRallyScheduledEnd } from "@/lib/actions/admin-rally";
import { toWibInputValue } from "@/lib/format";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { RallyEndTimeFormProps } from "@/types/rally";

// When the Rally Games end. Only used for the participants' leaderboard, which closes on its own one hour earlier.
export function RallyEndTimeForm({ competitionId, scheduledEndAt }: RallyEndTimeFormProps) {
  const [state, action, pending] = useActionState(setRallyScheduledEnd, initialFormState);
  const { t, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(t(state.message));
    if (state.status === "error" && state.message && !state.fieldErrors) toast.error(t(state.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast once per action result
  }, [state]);

  return (
    <form action={action} className="w-full">
      <input type="hidden" name="competitionId" value={competitionId} />
      <Field data-invalid={!!errors.scheduledEndAt}>
        <FieldLabel htmlFor="scheduledEndAt">{t("rally.session.endLabel")}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          <Input
            id="scheduledEndAt"
            name="scheduledEndAt"
            type="datetime-local"
            defaultValue={toWibInputValue(scheduledEndAt)}
            aria-invalid={!!errors.scheduledEndAt}
            className="w-auto min-w-0 flex-1"
          />
          <Button type="submit" variant="outline" disabled={pending}>
            {pending && <Spinner />}
            {t("common.save")}
          </Button>
        </div>
        <FieldDescription>{t("rally.session.endHint")}</FieldDescription>
        <FieldError errors={fieldErrors(errors.scheduledEndAt)} />
      </Field>
    </form>
  );
}
