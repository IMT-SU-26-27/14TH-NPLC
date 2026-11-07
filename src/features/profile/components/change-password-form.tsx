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
    <Card className="ring-border rounded-[12px] py-6 sm:py-9">
      <form ref={formRef} action={action} className="contents">
        <CardHeader className="px-5 sm:px-10">
          <CardTitle className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{`// ${t("profile.passwordTitle")}`}</CardTitle>
          <CardDescription className="text-sm">{t("profile.passwordLead")}</CardDescription>
        </CardHeader>
        <CardContent className="px-5 sm:px-10">
          <FieldGroup>
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="currentPassword" className="text-primary font-mono text-xs tracking-[0.12em] uppercase">
                {t("profile.currentPassword")} <span aria-hidden className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <LockIcon aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2" />
                <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" aria-invalid={!!errors.currentPassword} required className="h-12 rounded-[8px] pl-10" />
              </div>
              <FieldError errors={fieldErrors(errors.currentPassword)} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password" className="text-primary font-mono text-xs tracking-[0.12em] uppercase">
                {t("auth.newPassword")} <span aria-hidden className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <LockIcon aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2" />
                <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} required className="h-12 rounded-[8px] pl-10" />
              </div>
              <FieldDescription>{t("auth.passwordHint")}</FieldDescription>
              <FieldError errors={fieldErrors(errors.password)} />
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword" className="text-primary font-mono text-xs tracking-[0.12em] uppercase">
                {t("auth.confirmPassword")} <span aria-hidden className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <LockIcon aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2" />
                <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} required className="h-12 rounded-[8px] pl-10" />
              </div>
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
        <CardFooter className="flex-wrap items-center justify-between gap-3 px-5 sm:px-10">
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
