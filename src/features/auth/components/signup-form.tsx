"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheckIcon, OctagonXIcon } from "lucide-react";
import { signUp } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { AuthFormProps } from "@/types/auth";

export function SignupForm({ next }: AuthFormProps) {
  const [state, action, pending] = useActionState(signUp, initialFormState);
  const { t, href, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <Alert>
        <MailCheckIcon />
        <AlertTitle>{t("auth.checkEmailTitle")}</AlertTitle>
        <AlertDescription>
          <p>
            {t("auth.checkEmail", state.params)} <Link href={href("/login")}>{t("auth.signInAfter")}</Link>.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      <FieldGroup>
        <Field data-invalid={!!errors.fullName}>
          <FieldLabel htmlFor="fullName">{t("common.fullName")}</FieldLabel>
          <Input id="fullName" name="fullName" autoComplete="name" aria-invalid={!!errors.fullName} required />
          <FieldError errors={fieldErrors(errors.fullName)} />
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">{t("common.email")}</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} required />
          <FieldError errors={fieldErrors(errors.email)} />
        </Field>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">{t("auth.password")}</FieldLabel>
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
            {t("auth.createAccount")}
          </Button>
          <FieldDescription className="text-center">
            {t("auth.haveAccount")}{" "}
            <Link href={next ? `${href("/login")}?next=${encodeURIComponent(next)}` : href("/login")}>{t("auth.signIn")}</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
