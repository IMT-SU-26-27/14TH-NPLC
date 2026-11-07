"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRightIcon, MailCheckIcon, MailIcon, OctagonXIcon } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

const labelClass = "text-primary font-mono text-xs font-medium tracking-[0.2em] uppercase";
const requiredMark = (
  <span aria-hidden className="text-destructive">
    *
  </span>
);

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialFormState);
  const { t, href, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <Alert>
        <MailCheckIcon />
        <AlertTitle>{t("auth.checkEmailTitle")}</AlertTitle>
        <AlertDescription>
          <p>{t("auth.resetEmailSent", state.params)}</p>
          <p>
            <Link href={href("/login")}>{t("auth.backToSignIn")}</Link>
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={action}>
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email" className={labelClass}>
            {t("common.email")} {requiredMark}
          </FieldLabel>
          <InputGroup className="h-12">
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              aria-invalid={!!errors.email}
              aria-describedby="email-hint"
              required
            />
          </InputGroup>
          <FieldDescription id="email-hint">{t("auth.forgotEmailHint")}</FieldDescription>
          <FieldError errors={fieldErrors(errors.email)} />
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
            {t("auth.sendResetLink")}
            {!pending && <ArrowRightIcon />}
          </Button>
          <FieldDescription className="text-center">
            {t("auth.rememberPassword")} <Link href={href("/login")}>{t("auth.signIn")}</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
