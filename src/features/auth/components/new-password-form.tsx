"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleCheckIcon, OctagonXIcon } from "lucide-react";
import { updatePassword } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialFormState);
  const { t, href, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="space-y-4">
        <Alert>
          <CircleCheckIcon />
          <AlertTitle>{t("auth.passwordUpdatedTitle")}</AlertTitle>
          <AlertDescription>{t("auth.passwordUpdated")}</AlertDescription>
        </Alert>
        <Link href={href("/dashboard")} className={buttonVariants({ size: "lg", className: "w-full" })}>
          {t("auth.goToDashboard")}
        </Link>
      </div>
    );
  }

  return (
    <form action={action}>
      <FieldGroup>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">{t("auth.newPassword")}</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} required />
          <FieldDescription>{t("auth.passwordHint")}</FieldDescription>
          <FieldError errors={fieldErrors(errors.password)} />
        </Field>
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">{t("auth.confirmPassword")}</FieldLabel>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} required />
          <FieldError errors={fieldErrors(errors.confirmPassword)} />
        </Field>
        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}
        <Field>
          <Button type="submit" size="lg" disabled={pending}>
            {pending && <Spinner />}
            {t("auth.savePassword")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
