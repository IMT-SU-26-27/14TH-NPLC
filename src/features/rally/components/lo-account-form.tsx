"use client";

import { useActionState, useEffect, useRef } from "react";
import { OctagonXIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { createLoAccount } from "@/lib/actions/admin-rally";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function LoAccountForm() {
  const [state, action, pending] = useActionState(createLoAccount, initialFormState);
  const { t, fieldErrors } = useI18n();
  const form = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(t(state.message));
      form.current?.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast once per action result
  }, [state]);

  return (
    <form ref={form} action={action}>
      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field data-invalid={!!errors.fullName}>
            <FieldLabel htmlFor="fullName">{t("common.fullName")}</FieldLabel>
            <Input id="fullName" name="fullName" aria-invalid={!!errors.fullName} required />
            <FieldError errors={fieldErrors(errors.fullName)} />
          </Field>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">{t("common.email")}</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="off" aria-invalid={!!errors.email} required />
            <FieldError errors={fieldErrors(errors.email)} />
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">{t("rally.admin.loPassword")}</FieldLabel>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} aria-invalid={!!errors.password} required />
            <FieldDescription>{t("rally.admin.loPasswordHint")}</FieldDescription>
            <FieldError errors={fieldErrors(errors.password)} />
          </Field>
        </div>
        {state.status === "error" && state.message && !state.fieldErrors && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" variant="outline" disabled={pending} className="sm:w-fit">
          {pending ? <Spinner /> : <PlusIcon />}
          {t("rally.admin.createLo")}
        </Button>
      </FieldGroup>
    </form>
  );
}
