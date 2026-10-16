"use client";

import { useActionState, useEffect, useRef } from "react";
import { CircleCheckIcon, OctagonXIcon } from "lucide-react";
import { changePassword } from "@/lib/actions/profile";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initialFormState);
  const { t, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the password fields once the change went through.
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <Card>
      <form ref={formRef} action={action} className="contents">
        <CardHeader>
          <CardTitle>{t("profile.passwordTitle")}</CardTitle>
          <CardDescription>{t("profile.passwordLead")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="currentPassword">{t("profile.currentPassword")}</FieldLabel>
              <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" aria-invalid={!!errors.currentPassword} required />
              <FieldError errors={fieldErrors(errors.currentPassword)} />
            </Field>
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
            {state.status === "success" && state.message && (
              <Alert>
                <CircleCheckIcon />
                <AlertDescription>{t(state.message)}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={pending}>
            {pending && <Spinner />}
            {t("profile.changePassword")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
