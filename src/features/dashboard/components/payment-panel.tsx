"use client";

import { useState, useTransition } from "react";
import { InfoIcon, OctagonXIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { getPaymentUploadSignature, submitPayment } from "@/lib/actions/registration";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { PaymentInstructions } from "@/features/registration/components/payment-instructions";
import type { PaymentPanelProps, PaymentProofFormat } from "@/types/registration";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

export function PaymentPanel({ team, qrisUrl }: PaymentPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, startSubmit] = useTransition();
  const { t } = useI18n();
  const { upload, uploading, progress, error, errorParams } = useCloudinaryUpload({
    getSignature: () => getPaymentUploadSignature(team.id),
    maxBytes: MAX_BYTES,
    accept: ACCEPT,
  });

  const { min_members, max_members } = team.competition;
  const memberCount = team.members.length;
  const teamReady = memberCount >= min_members && memberCount <= max_members;
  const busy = uploading || submitting;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    const uploaded = await upload(file);
    if (!uploaded) return;
    startSubmit(async () => {
      const result = await submitPayment({
        registrationId: team.id,
        publicId: uploaded.publicId,
        format: uploaded.format as PaymentProofFormat,
      });
      if (result.ok) toast.success(t(result.message ?? "payment.submitted"));
      else toast.error(t(result.message));
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr]">
      <PaymentInstructions details={team.competition} qrisUrl={qrisUrl} />

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {!teamReady && (
            <Alert>
              <InfoIcon />
              <AlertTitle>{t("payment.teamIncompleteTitle")}</AlertTitle>
              <AlertDescription>{t("payment.teamIncomplete", { min: min_members, max: max_members, count: memberCount })}</AlertDescription>
            </Alert>
          )}
          {team.status === "rejected" && (
            <Alert variant="destructive">
              <OctagonXIcon />
              <AlertTitle>{t("payment.fixAndResubmit")}</AlertTitle>
              <AlertDescription>{team.rejection_reason}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={`proof-${team.id}`}>{t("payment.proof")}</FieldLabel>
            <Input
              id={`proof-${team.id}`}
              type="file"
              accept={ACCEPT.join(",")}
              disabled={busy}
              aria-invalid={!!error}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <FieldDescription>{t("payment.proofHint")}</FieldDescription>
            <FieldError errors={error ? [{ message: t(error, errorParams) }] : undefined} />
          </Field>
          {uploading && <Progress value={progress} />}
          <Button type="submit" disabled={!file || !teamReady || busy}>
            {busy ? <Spinner /> : <UploadIcon />}
            {uploading ? t("payment.uploading", { progress }) : submitting ? t("payment.submitting") : t("payment.submit")}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
