"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { correctRallyResult, deleteRallyResult } from "@/lib/actions/admin-rally";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { RallyOutcome, RallyResultActionsProps } from "@/types/rally";

export function RallyResultActions({ result }: RallyResultActionsProps) {
  const { t, fieldErrors } = useI18n();
  const correct = useDialogFormAction(correctRallyResult);
  const remove = useDialogFormAction(deleteRallyResult);

  // Only outcomes that differ from the current one, and a draw only where the post allows it.
  const outcomes: RallyOutcome[] = (["win", "lose", "draw"] as const).filter(
    (o) => o !== result.outcome && (o !== "draw" || result.post.allow_draw),
  );
  const items = outcomes.map((value) => ({ value, label: t(`rally.outcome.${value}`) }));

  const correctErrors = correct.state.fieldErrors ?? {};
  const deleteErrors = remove.state.fieldErrors ?? {};

  return (
    <>
      <Dialog open={correct.open} onOpenChange={correct.setOpen}>
        <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t("rally.results.correct")} />}>
          <PencilIcon />
        </DialogTrigger>
        <DialogContent>
          <form action={correct.action}>
            <input type="hidden" name="resultId" value={result.id} />
            <DialogHeader>
              <DialogTitle>{t("rally.results.correct")}</DialogTitle>
              <DialogDescription>
                {result.registration.team_name} · {result.post.name} · {t(`rally.outcome.${result.outcome}`)}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel>{t("rally.results.newResult")}</FieldLabel>
                <Select name="outcome" items={items} defaultValue={outcomes[0]}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field data-invalid={!!correctErrors.reason}>
                <FieldLabel htmlFor={`correct-reason-${result.id}`}>{t("rally.log.reason")}</FieldLabel>
                <Textarea id={`correct-reason-${result.id}`} name="reason" rows={3} maxLength={500} aria-invalid={!!correctErrors.reason} required />
                <FieldError errors={fieldErrors(correctErrors.reason)} />
              </Field>
              {correct.state.status === "error" && correct.state.message && !correct.state.fieldErrors && (
                <Alert variant="destructive">
                  <AlertDescription>{t(correct.state.message)}</AlertDescription>
                </Alert>
              )}
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" disabled={correct.pending}>
                {correct.pending && <Spinner />}
                {t("rally.results.saveCorrection")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={remove.open} onOpenChange={remove.setOpen}>
        <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t("rally.results.delete")} />}>
          <Trash2Icon />
        </DialogTrigger>
        <DialogContent>
          <form action={remove.action}>
            <input type="hidden" name="resultId" value={result.id} />
            <DialogHeader>
              <DialogTitle>{t("rally.results.delete")}</DialogTitle>
              <DialogDescription>
                {result.registration.team_name} · {result.post.name} · {t("rally.results.deleteLead")}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-4">
              <Field data-invalid={!!deleteErrors.reason}>
                <FieldLabel htmlFor={`delete-reason-${result.id}`}>{t("rally.log.reason")}</FieldLabel>
                <Textarea id={`delete-reason-${result.id}`} name="reason" rows={3} maxLength={500} aria-invalid={!!deleteErrors.reason} required />
                <FieldError errors={fieldErrors(deleteErrors.reason)} />
              </Field>
              {remove.state.status === "error" && remove.state.message && !remove.state.fieldErrors && (
                <Alert variant="destructive">
                  <AlertDescription>{t(remove.state.message)}</AlertDescription>
                </Alert>
              )}
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" variant="destructive" disabled={remove.pending}>
                {remove.pending && <Spinner />}
                {t("rally.results.delete")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
