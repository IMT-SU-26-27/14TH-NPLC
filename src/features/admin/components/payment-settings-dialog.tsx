"use client";

import { useActionState, useState } from "react";
import { SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { savePaymentSettings } from "@/lib/actions/admin-competitions";
import { initialFormState } from "@/lib/form";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { QrisUploader } from "@/features/admin/components/qris-uploader";
import type { FormState } from "@/types";
import type { PaymentSettingsDialogProps } from "@/types/admin";
import type { PaymentMethod } from "@/types/competition";

export function PaymentSettingsDialog({ competition, qrisUrl }: PaymentSettingsDialogProps) {
  const { t, fieldErrors } = useI18n();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>(competition.payment_method);
  const [state, action, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await savePaymentSettings(prev, formData);
    if (result.status === "success" && result.message) {
      toast.success(t(result.message));
      if (method === "bank_transfer") setOpen(false);
    } else if (result.status === "error" && result.message && !result.fieldErrors) {
      toast.error(t(result.message));
    }
    return result;
  }, initialFormState);
  const errors = state.fieldErrors ?? {};
  const items = [
    { value: "qris", label: t("admin.payment.qris") },
    { value: "bank_transfer", label: t("admin.payment.bank") },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <SettingsIcon />
        {t("admin.payment.configure")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("admin.payment.dialogTitle", { competition: competition.name })}</DialogTitle>
          <DialogDescription>{t("admin.payment.lead")}</DialogDescription>
        </DialogHeader>

        <form action={action}>
          <input type="hidden" name="competitionId" value={competition.id} />
          <FieldGroup>
            <Field>
              <FieldLabel>{t("admin.payment.method")}</FieldLabel>
              <Select name="paymentMethod" items={items} value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
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
            {method === "bank_transfer" && (
              <>
                <Field data-invalid={!!errors.bankAccountNumber}>
                  <FieldLabel htmlFor={`acc-${competition.id}`}>{t("admin.payment.bankAccountNumber")}</FieldLabel>
                  <Input
                    id={`acc-${competition.id}`}
                    name="bankAccountNumber"
                    inputMode="numeric"
                    defaultValue={competition.bank_account_number ?? ""}
                    className="font-mono"
                    aria-invalid={!!errors.bankAccountNumber}
                    required
                  />
                  <FieldError errors={fieldErrors(errors.bankAccountNumber)} />
                </Field>
                <Field data-invalid={!!errors.bankAccountHolder}>
                  <FieldLabel htmlFor={`holder-${competition.id}`}>{t("admin.payment.bankAccountHolder")}</FieldLabel>
                  <Input
                    id={`holder-${competition.id}`}
                    name="bankAccountHolder"
                    defaultValue={competition.bank_account_holder ?? ""}
                    aria-invalid={!!errors.bankAccountHolder}
                    required
                  />
                  <FieldDescription>{t("admin.payment.bankHolderHint")}</FieldDescription>
                  <FieldError errors={fieldErrors(errors.bankAccountHolder)} />
                </Field>
              </>
            )}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending && <Spinner />}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>

        {method === "qris" && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium">{t("admin.payment.qrisSection")}</p>
              <QrisUploader competitionId={competition.id} qrisUrl={qrisUrl} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
