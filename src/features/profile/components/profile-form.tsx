"use client";

import { useActionState } from "react";
import { CircleCheckIcon, OctagonXIcon } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { ProfileFormProps } from "@/types/profile";

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, initialFormState);
  const { t, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};

  return (
    <Card>
      <form action={action} className="contents">
        <CardHeader>
          <CardTitle>{t("profile.detailsTitle")}</CardTitle>
          <CardDescription>{t("profile.detailsLead")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName">{t("common.fullName")}</FieldLabel>
              <Input id="fullName" name="fullName" autoComplete="name" defaultValue={user.full_name} aria-invalid={!!errors.fullName} required />
              <FieldDescription>{t("profile.nameHint")}</FieldDescription>
              <FieldError errors={fieldErrors(errors.fullName)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">{t("common.email")}</FieldLabel>
              <Input id="email" type="email" value={user.email} readOnly disabled />
              <FieldDescription>{t("profile.emailHint")}</FieldDescription>
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
            {t("common.save")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
