"use client";

import { useActionState, useEffect } from "react";
import { OctagonXIcon } from "lucide-react";
import { toast } from "sonner";
import { saveAboutContent } from "@/lib/actions/admin-content";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { AboutFormProps } from "@/types/content";

export function AboutForm({ content }: AboutFormProps) {
  const [state, action, pending] = useActionState(saveAboutContent, initialFormState);
  const { t } = useI18n();

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(t(state.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast once per action result
  }, [state]);

  return (
    <form action={action}>
      <FieldGroup>
        <div className="grid gap-6 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="aboutTitleId">{t("admin.content.aboutTitleId")}</FieldLabel>
            <Input id="aboutTitleId" name="aboutTitleId" defaultValue={content.about_title_id} maxLength={120} />
          </Field>
          <Field>
            <FieldLabel htmlFor="aboutTitleEn">{t("admin.content.aboutTitleEn")}</FieldLabel>
            <Input id="aboutTitleEn" name="aboutTitleEn" defaultValue={content.about_title_en} maxLength={120} />
          </Field>
          <Field>
            <FieldLabel htmlFor="aboutBodyId">{t("admin.content.aboutBodyId")}</FieldLabel>
            <Textarea id="aboutBodyId" name="aboutBodyId" defaultValue={content.about_body_id} rows={8} />
            <FieldDescription>{t("admin.content.bodyHint")}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="aboutBodyEn">{t("admin.content.aboutBodyEn")}</FieldLabel>
            <Textarea id="aboutBodyEn" name="aboutBodyEn" defaultValue={content.about_body_en} rows={8} />
            <FieldDescription>{t("admin.content.bodyHint")}</FieldDescription>
          </Field>
        </div>
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
