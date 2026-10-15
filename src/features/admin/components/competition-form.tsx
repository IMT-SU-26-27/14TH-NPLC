"use client";

import { useActionState } from "react";
import { OctagonXIcon } from "lucide-react";
import { saveCompetition } from "@/lib/actions/admin-competitions";
import { initialFormState } from "@/lib/form";
import { toWibInputValue } from "@/lib/format";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CompetitionFormProps } from "@/types/admin";

export function CompetitionForm({ competition }: CompetitionFormProps) {
  const [state, action, pending] = useActionState(saveCompetition, initialFormState);
  const { t, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};
  const typeItems = (["competitive_programming", "logic"] as const).map((value) => ({
    value,
    label: t(`competition.type.${value}`),
  }));

  return (
    <form action={action}>
      {competition && <input type="hidden" name="id" value={competition.id} />}
      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">{t("admin.competitions.name")}</FieldLabel>
            <Input id="name" name="name" defaultValue={competition?.name} aria-invalid={!!errors.name} required />
            <FieldError errors={fieldErrors(errors.name)} />
          </Field>
          <Field data-invalid={!!errors.slug}>
            <FieldLabel htmlFor="slug">{t("admin.competitions.slug")}</FieldLabel>
            <Input id="slug" name="slug" defaultValue={competition?.slug} className="font-mono" aria-invalid={!!errors.slug} required />
            <FieldDescription>{t("admin.competitions.slugHint")}</FieldDescription>
            <FieldError errors={fieldErrors(errors.slug)} />
          </Field>
        </div>
        <Field data-invalid={!!errors.type}>
          <FieldLabel>{t("admin.competitions.type")}</FieldLabel>
          <Select name="type" items={typeItems} defaultValue={competition?.type ?? "competitive_programming"}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={fieldErrors(errors.type)} />
        </Field>
        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">{t("admin.competitions.description")}</FieldLabel>
          <Textarea id="description" name="description" defaultValue={competition?.description} rows={3} />
          <FieldError errors={fieldErrors(errors.description)} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field data-invalid={!!errors.minMembers}>
            <FieldLabel htmlFor="minMembers">{t("admin.competitions.minMembers")}</FieldLabel>
            <Input id="minMembers" name="minMembers" type="number" min={1} max={10} defaultValue={competition?.min_members ?? 1} aria-invalid={!!errors.minMembers} required />
            <FieldDescription>{t("admin.competitions.teamSizeHint")}</FieldDescription>
            <FieldError errors={fieldErrors(errors.minMembers)} />
          </Field>
          <Field data-invalid={!!errors.maxMembers}>
            <FieldLabel htmlFor="maxMembers">{t("admin.competitions.maxMembers")}</FieldLabel>
            <Input id="maxMembers" name="maxMembers" type="number" min={1} max={10} defaultValue={competition?.max_members ?? 3} aria-invalid={!!errors.maxMembers} required />
            <FieldError errors={fieldErrors(errors.maxMembers)} />
          </Field>
          <Field data-invalid={!!errors.fee}>
            <FieldLabel htmlFor="fee">{t("admin.competitions.fee")}</FieldLabel>
            <Input id="fee" name="fee" type="number" min={0} step={1000} defaultValue={competition?.fee ?? 0} aria-invalid={!!errors.fee} required />
            <FieldError errors={fieldErrors(errors.fee)} />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.registrationOpensAt}>
            <FieldLabel htmlFor="registrationOpensAt">{t("admin.competitions.opensAt")}</FieldLabel>
            <Input id="registrationOpensAt" name="registrationOpensAt" type="datetime-local" defaultValue={toWibInputValue(competition?.registration_opens_at ?? null)} />
            <FieldDescription>{t("admin.competitions.windowHint")}</FieldDescription>
            <FieldError errors={fieldErrors(errors.registrationOpensAt)} />
          </Field>
          <Field data-invalid={!!errors.registrationClosesAt}>
            <FieldLabel htmlFor="registrationClosesAt">{t("admin.competitions.closesAt")}</FieldLabel>
            <Input id="registrationClosesAt" name="registrationClosesAt" type="datetime-local" defaultValue={toWibInputValue(competition?.registration_closes_at ?? null)} aria-invalid={!!errors.registrationClosesAt} />
            <FieldError errors={fieldErrors(errors.registrationClosesAt)} />
          </Field>
        </div>
        <Field orientation="horizontal">
          <Switch id="isActive" name="isActive" defaultChecked={competition?.is_active ?? true} />
          <FieldContent>
            <FieldLabel htmlFor="isActive">{t("admin.competitions.active")}</FieldLabel>
            <FieldDescription>{t("admin.competitions.activeHint")}</FieldDescription>
          </FieldContent>
        </Field>
        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending} className="sm:w-fit">
          {pending && <Spinner />}
          {t("common.save")}
        </Button>
      </FieldGroup>
    </form>
  );
}
