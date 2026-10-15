"use client";

import { useActionState, useEffect, useState } from "react";
import { OctagonXIcon } from "lucide-react";
import { toast } from "sonner";
import { reviewRegistration } from "@/lib/actions/admin-registrations";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { RegistrationStatus } from "@/types/registration";
import type { ReviewFormProps } from "@/types/admin";

export function ReviewForm({ registrationId, status, rejectionReason }: ReviewFormProps) {
  const [state, action, pending] = useActionState(reviewRegistration, initialFormState);
  const [next, setNext] = useState<RegistrationStatus>(status === "under_review" ? "accepted" : status);
  const { t, fieldErrors } = useI18n();
  const errors = state.fieldErrors ?? {};
  const statusItems: { value: RegistrationStatus; label: string }[] = [
    { value: "accepted", label: t("admin.detail.accept") },
    { value: "rejected", label: t("admin.detail.reject") },
    { value: "under_review", label: t("admin.detail.backToReview") },
    { value: "pending_payment", label: t("admin.detail.backToPayment") },
  ];

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(t(state.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast once per action result
  }, [state]);

  return (
    <form action={action}>
      <input type="hidden" name="registrationId" value={registrationId} />
      <FieldGroup>
        <Field>
          <FieldLabel>{t("admin.detail.decision")}</FieldLabel>
          <Select
            name="status"
            items={statusItems}
            value={next}
            onValueChange={(value) => setNext(value as RegistrationStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {next === "rejected" && (
          <Field data-invalid={!!errors.rejectionReason}>
            <FieldLabel htmlFor="rejectionReason">{t("admin.detail.reason")}</FieldLabel>
            <Textarea
              id="rejectionReason"
              name="rejectionReason"
              defaultValue={rejectionReason ?? ""}
              placeholder={t("admin.detail.reasonPlaceholder")}
              aria-invalid={!!errors.rejectionReason}
              required
            />
            <FieldDescription>{t("admin.detail.reasonHint")}</FieldDescription>
            <FieldError errors={fieldErrors(errors.rejectionReason)} />
          </Field>
        )}
        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" variant={next === "rejected" ? "destructive" : "default"} disabled={pending}>
          {pending && <Spinner />}
          {t("admin.detail.saveDecision")}
        </Button>
      </FieldGroup>
    </form>
  );
}
