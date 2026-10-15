"use client";

import { useActionState } from "react";
import { OctagonXIcon } from "lucide-react";
import { adminCreateRegistration } from "@/lib/actions/admin-registrations";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { AdminCreateRegistrationFormProps } from "@/types/admin";

export function AdminCreateRegistrationForm({ competitions }: AdminCreateRegistrationFormProps) {
  const [state, action, pending] = useActionState(adminCreateRegistration, initialFormState);
  const { t, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};
  const items = competitions.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form action={action}>
      <FieldGroup>
        <Field data-invalid={!!errors.competitionId}>
          <FieldLabel>{t("admin.registrations.competition")}</FieldLabel>
          <Select name="competitionId" items={items}>
            <SelectTrigger className="w-full" aria-invalid={!!errors.competitionId}>
              <SelectValue placeholder={t("admin.create.chooseCompetition")} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={fieldErrors(errors.competitionId)} />
        </Field>
        <Field data-invalid={!!errors.teamName}>
          <FieldLabel htmlFor="teamName">{t("register.teamName")}</FieldLabel>
          <Input id="teamName" name="teamName" maxLength={60} aria-invalid={!!errors.teamName} required />
          <FieldError errors={fieldErrors(errors.teamName)} />
        </Field>
        <Field data-invalid={!!errors.leaderEmail}>
          <FieldLabel htmlFor="leaderEmail">{t("admin.create.leaderEmail")}</FieldLabel>
          <Input id="leaderEmail" name="leaderEmail" type="email" aria-invalid={!!errors.leaderEmail} required />
          <FieldDescription>{t("admin.create.leaderEmailHint")}</FieldDescription>
          <FieldError errors={fieldErrors(errors.leaderEmail)} />
        </Field>
        <Field data-invalid={!!errors.leaderName}>
          <FieldLabel htmlFor="leaderName">{t("common.fullName")}</FieldLabel>
          <Input id="leaderName" name="leaderName" aria-invalid={!!errors.leaderName} required />
          <FieldError errors={fieldErrors(errors.leaderName)} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.leaderPhone}>
            <FieldLabel htmlFor="leaderPhone">{t("common.phoneWhatsapp")}</FieldLabel>
            <Input id="leaderPhone" name="leaderPhone" type="tel" placeholder={t("common.phonePlaceholder")} aria-invalid={!!errors.leaderPhone} required />
            <FieldError errors={fieldErrors(errors.leaderPhone)} />
          </Field>
          <Field data-invalid={!!errors.leaderNisn}>
            <FieldLabel htmlFor="leaderNisn">{t("common.nisn")}</FieldLabel>
            <Input id="leaderNisn" name="leaderNisn" inputMode="numeric" maxLength={10} placeholder={t("common.nisnPlaceholder")} aria-invalid={!!errors.leaderNisn} required />
            <FieldError errors={fieldErrors(errors.leaderNisn)} />
          </Field>
        </div>
        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {t("admin.create.submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
