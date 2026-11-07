"use client";

import { useActionState, useEffect, useRef } from "react";
import { CircleCheckIcon, LockIcon, OctagonXIcon } from "lucide-react";
import { changePassword } from "@/lib/actions/profile";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

const labelClass = "text-primary font-mono text-xs font-medium tracking-[0.2em] uppercase";
const requiredMark = (
  <span aria-hidden className="text-destructive">
    *
  </span>
);

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
    <Card className="ring-border rounded-[12px] py-6 sm:py-9">
      <form ref={formRef} action={action} className="contents">
        <CardHeader className="px-5 sm:px-10">
          <CardTitle className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{`// ${t("profile.passwordTitle")}`}</CardTitle>
          <CardDescription className="text-sm">{t("profile.passwordLead")}</CardDescription>
        </CardHeader>
        <CardContent className="px-5 sm:px-10">
          <FieldGroup>
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="currentPassword" className={labelClass}>
                {t("profile.currentPassword")} {requiredMark}
              </FieldLabel>
              <InputGroup className="h-12">
                <InputGroupAddon>
                  <LockIcon />
                </InputGroupAddon>
                <InputGroupInput id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" aria-invalid={!!errors.currentPassword} required />
              </InputGroup>
              <FieldError errors={fieldErrors(errors.currentPassword)} />
            </Field>
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
                <InputGroupInput id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} required />
              </InputGroup>
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
        <CardFooter className="flex-col items-start gap-3 border-t-0 bg-transparent px-5 pt-0 pb-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pb-9">
          <p className="text-muted-foreground text-[0.8125rem]">{t("profile.passwordNoDraft")}</p>
          <Button type="submit" size="lg" className="rounded-[8px] px-4" disabled={pending}>
            {pending && <Spinner />}
            {t("profile.changePassword")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
