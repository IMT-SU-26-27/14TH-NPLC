"use client";

import { useActionState, useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { saveTimelineEvent } from "@/lib/actions/admin-content";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/types";
import type { TimelineEventDialogProps } from "@/types/content";

// Add (event = null) or edit a timeline event.
export function TimelineEventDialog({ event }: TimelineEventDialogProps) {
  const [open, setOpen] = useState(false);
  const { t, fieldErrors } = useI18n();
  // Close and toast from the action itself, so a successful save needs no extra render pass.
  const [state, action, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await saveTimelineEvent(prev, formData);
    if (result.status === "success" && result.message) {
      toast.success(t(result.message));
      setOpen(false);
    } else if (result.status === "error" && result.message && !result.fieldErrors) {
      toast.error(t(result.message));
    }
    return result;
  }, initialFormState);
  const errors = state.fieldErrors ?? {};
  const competitionItems = [
    { value: "all", label: t("admin.content.forAll") },
    { value: "competitive_programming", label: t("competition.type.competitive_programming") },
    { value: "logic", label: t("competition.type.logic") },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={event ? <Button variant="ghost" size="icon-sm" aria-label={t("admin.content.editEvent")} /> : <Button />}
      >
        {event ? <PencilIcon /> : <PlusIcon />}
        {!event && t("admin.content.addEvent")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form action={action}>
          {event && <input type="hidden" name="id" value={event.id} />}
          <DialogHeader>
            <DialogTitle>{event ? t("admin.content.editEvent") : t("admin.content.addEvent")}</DialogTitle>
            <DialogDescription>{t("admin.content.timelineLead")}</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={!!errors.startsOn}>
                <FieldLabel htmlFor="startsOn">{t("admin.content.startsOn")}</FieldLabel>
                <Input id="startsOn" name="startsOn" type="date" defaultValue={event?.starts_on} aria-invalid={!!errors.startsOn} required />
                <FieldError errors={fieldErrors(errors.startsOn)} />
              </Field>
              <Field data-invalid={!!errors.endsOn}>
                <FieldLabel htmlFor="endsOn">{t("admin.content.endsOn")}</FieldLabel>
                <Input id="endsOn" name="endsOn" type="date" defaultValue={event?.ends_on ?? ""} aria-invalid={!!errors.endsOn} />
                <FieldError errors={fieldErrors(errors.endsOn)} />
              </Field>
              <Field data-invalid={!!errors.titleId}>
                <FieldLabel htmlFor="titleId">{t("admin.content.titleId")}</FieldLabel>
                <Input id="titleId" name="titleId" defaultValue={event?.title_id} maxLength={120} aria-invalid={!!errors.titleId} required />
                <FieldError errors={fieldErrors(errors.titleId)} />
              </Field>
              <Field data-invalid={!!errors.titleEn}>
                <FieldLabel htmlFor="titleEn">{t("admin.content.titleEn")}</FieldLabel>
                <Input id="titleEn" name="titleEn" defaultValue={event?.title_en} maxLength={120} aria-invalid={!!errors.titleEn} required />
                <FieldError errors={fieldErrors(errors.titleEn)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="descriptionId">{t("admin.content.descriptionId")}</FieldLabel>
                <Textarea id="descriptionId" name="descriptionId" defaultValue={event?.description_id} rows={3} />
              </Field>
              <Field>
                <FieldLabel htmlFor="descriptionEn">{t("admin.content.descriptionEn")}</FieldLabel>
                <Textarea id="descriptionEn" name="descriptionEn" defaultValue={event?.description_en} rows={3} />
              </Field>
              <Field>
                <FieldLabel>{t("admin.content.forCompetition")}</FieldLabel>
                <Select name="competitionType" items={competitionItems} defaultValue={event?.competition_type ?? "all"}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {competitionItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>{t("admin.content.forCompetitionHint")}</FieldDescription>
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
