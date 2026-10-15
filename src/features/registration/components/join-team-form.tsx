"use client";

import { useActionState } from "react";
import { OctagonXIcon } from "lucide-react";
import { joinTeam } from "@/lib/actions/registration";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { JoinTeamFormProps } from "@/types/registration";

export function JoinTeamForm({ referralCode, preview, user }: JoinTeamFormProps) {
  const [state, action, pending] = useActionState(joinTeam, initialFormState);
  const { t, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action}>
      <input type="hidden" name="referralCode" value={referralCode} />
      <FieldGroup>
        <Field data-invalid={!!errors.fullName}>
          <FieldLabel htmlFor="fullName">{t("common.fullName")}</FieldLabel>
          <Input id="fullName" name="fullName" defaultValue={user.full_name} autoComplete="name" aria-invalid={!!errors.fullName} required />
          <FieldError errors={fieldErrors(errors.fullName)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">{t("common.email")}</FieldLabel>
          <Input id="email" value={user.email} disabled readOnly />
          <FieldDescription>{t("common.fromAccount")}</FieldDescription>
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.nisn}>
            <FieldLabel htmlFor="nisn">{t("common.nisn")}</FieldLabel>
            <Input id="nisn" name="nisn" inputMode="numeric" maxLength={10} placeholder={t("common.nisnPlaceholder")} aria-invalid={!!errors.nisn} required />
            <FieldError errors={fieldErrors(errors.nisn)} />
          </Field>
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">{t("common.phoneOptional")}</FieldLabel>
            <Input id="phone" name="phone" type="tel" inputMode="tel" placeholder={t("common.phonePlaceholder")} aria-invalid={!!errors.phone} />
            <FieldError errors={fieldErrors(errors.phone)} />
          </Field>
        </div>

        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Spinner />}
          {t("join.submit", { team: preview.team_name })}
        </Button>
      </FieldGroup>
    </form>
  );
}
