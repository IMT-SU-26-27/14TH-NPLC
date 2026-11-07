"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CircleCheckIcon, LockIcon, OctagonXIcon } from "lucide-react";
import { updatePassword } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

const labelClass = "text-primary font-mono text-xs font-medium tracking-[0.2em] uppercase";
const requiredMark = (
  <span aria-hidden className="text-destructive">
    *
  </span>
);

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
        <Link href={href("/dashboard")} className={buttonVariants({ size: "lg", className: "h-12 w-full text-base" })}>
          {t("auth.goToDashboard")}
          <ArrowRightIcon />
        </Link>
      </div>
    );
  }

  return (
    <form action={action}>
      <FieldGroup>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password" className={labelClass}>
            {t("auth.newPassword")} {requiredMark}
          </FieldLabel>
          <InputGroup className="h-12">
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput id="password" name="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} required />
          </InputGroup>
          <FieldDescription>{t("auth.passwordHint")}</FieldDescription>
          <FieldError errors={fieldErrors(errors.password)} />
        </Field>
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword" className={labelClass}>
            {t("auth.confirmPassword")} {requiredMark}
          </FieldLabel>
          <InputGroup className="h-12">
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              required
            />
          </InputGroup>
          <FieldError errors={fieldErrors(errors.confirmPassword)} />
        </Field>
        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}
        <Field>
          <Button type="submit" size="lg" className="h-12 text-base" disabled={pending}>
            {pending && <Spinner />}
            {t("auth.savePassword")}
            {!pending && <ArrowRightIcon />}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
