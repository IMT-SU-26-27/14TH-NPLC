"use client";

import { useActionState } from "react";
import { CircleCheckIcon, MailIcon, OctagonXIcon, UserIcon } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import { initialFormState } from "@/lib/form";
import { useFormDraft } from "@/hooks/use-form-draft";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FormDraftBanner } from "@/components/shared/form-draft-banner";
import { FormDraftStatus } from "@/components/shared/form-draft-status";
import type { ProfileFormProps } from "@/types/profile";

export function ProfileForm({ user }: ProfileFormProps) {
  const { formRef, restored: draftRestored, savedAt: draftSavedAt, discardDraft, clearOnSuccess } = useFormDraft({ formId: "profile", userId: user.id });
  const [state, action, pending] = useActionState(clearOnSuccess(updateProfile), initialFormState);
  const { t, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};

  return (
    <Card className="ring-border rounded-[12px] py-6 sm:py-9">
      <form ref={formRef} action={action} className="contents">
        <CardHeader className="px-5 sm:px-10">
          <CardTitle className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{`// ${t("profile.detailsTitle")}`}</CardTitle>
          <CardDescription className="text-sm">{t("profile.detailsLead")}</CardDescription>
        </CardHeader>
        <CardContent className="px-5 sm:px-10">
          <FieldGroup>
            {draftRestored && <FormDraftBanner onDiscard={discardDraft} />}
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName" className="text-primary font-mono text-xs tracking-[0.12em] uppercase">
                {t("common.fullName")} <span aria-hidden className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <UserIcon aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2" />
                <Input id="fullName" name="fullName" autoComplete="name" defaultValue={user.full_name} aria-invalid={!!errors.fullName} required className="h-12 rounded-[8px] pl-10" />
              </div>
              <FieldDescription>{t("profile.nameHint")}</FieldDescription>
              <FieldError errors={fieldErrors(errors.fullName)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email" className="text-primary font-mono text-xs tracking-[0.12em] uppercase">
                {t("common.email")}
              </FieldLabel>
              <div className="relative">
                <MailIcon aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2" />
                <Input id="email" type="email" value={user.email} readOnly disabled className="h-12 rounded-[8px] pl-10 bg-muted" />
              </div>
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
        <CardFooter className="flex-wrap justify-end gap-3 px-5 sm:px-10">
          <FormDraftStatus savedAt={draftSavedAt} className="mr-auto" />
          <Button type="submit" size="lg" className="rounded-[8px] px-4" disabled={pending}>
            {pending && <Spinner />}
            {t("common.save")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
