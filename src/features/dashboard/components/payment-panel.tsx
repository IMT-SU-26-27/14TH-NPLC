"use client";

import { useState, useTransition } from "react";
import { InfoIcon, OctagonXIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { getPaymentUploadSignature, submitPayment } from "@/lib/actions/registration";
import { PAYMENT_PROOF_MAX_BYTES } from "@/lib/upload-limits";
import { memberRange } from "@/lib/format";
import { transferNote } from "@/lib/payment";
import { currentFee } from "@/lib/pricing";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { ContactPersonLink } from "@/components/shared/contact-person-link";
import { FilePicker } from "@/components/shared/file-picker";
import { PaymentInstructions } from "@/features/registration/components/payment-instructions";
import type { PaymentPanelProps, PaymentProofFormat } from "@/types/registration";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
// Early feedback only: the server checks the uploaded file again (verifyUpload).
const MAX_BYTES = PAYMENT_PROOF_MAX_BYTES;

export function PaymentPanel({ team, qrisUrl }: PaymentPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [payerName, setPayerName] = useState(team.payer_name ?? "");
  const [payerError, setPayerError] = useState<string | null>(null);
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
  const [quotaFull, setQuotaFull] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    if (payerName.trim().length < 2) {
      setPayerError("validation.payerName");
      document.getElementById(`payer-${team.id}`)?.focus();
      return;
    }
    const uploaded = await upload(file);
    if (!uploaded) return;
    startSubmit(async () => {
      const result = await submitPayment({
        registrationId: team.id,
        publicId: uploaded.publicId,
        format: uploaded.format as PaymentProofFormat,
        payerName,
      });
      if (result.ok) toast.success(t(result.message ?? "payment.submitted"));
      else if (result.message === "errors.quotaFull") setQuotaFull(true);
      else if (result.message === "validation.payerName") setPayerError(result.message);
      else toast.error(t(result.message));
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr]">
      {/* The price when the team registered, so a team that signed up in the early bird keeps it. */}
      <PaymentInstructions
        details={team.competition}
        fee={currentFee(team.competition.fee, new Date(team.created_at))}
        qrisUrl={qrisUrl}
        transferNote={transferNote(team.members.find((m) => m.is_leader)?.full_name ?? team.team_name)}
      />

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {quotaFull && (
            <Alert variant="destructive">
              <OctagonXIcon />
              <AlertTitle>{t("register.quotaFullTitle")}</AlertTitle>
              <AlertDescription>
                <p>{t("errors.quotaFull")}</p>
                <ContactPersonLink competitionType={team.competition.type} opensLabel={t("landing.contact.opensWhatsapp")} className="mt-2" />
              </AlertDescription>
            </Alert>
          )}
          {!teamReady && (
            <Alert>
              <InfoIcon />
              <AlertTitle>{t("payment.teamIncompleteTitle")}</AlertTitle>
              <AlertDescription>{t("payment.teamIncomplete", { range: memberRange(min_members, max_members), count: memberCount })}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={`proof-${team.id}`}>{t("payment.proof")}</FieldLabel>
            <FilePicker id={`proof-${team.id}`} accept={ACCEPT.join(",")} disabled={busy} invalid={!!error} onFileChange={setFile} />
            <FieldDescription>{t("payment.proofHint")}</FieldDescription>
            <FieldError errors={error ? [{ message: t(error, errorParams) }] : undefined} />
          </Field>
          <Field data-invalid={!!payerError}>
            <FieldLabel htmlFor={`payer-${team.id}`}>{t("payment.payerName")}</FieldLabel>
            <Input
              id={`payer-${team.id}`}
              value={payerName}
              maxLength={100}
              disabled={busy}
              aria-invalid={!!payerError}
              onChange={(e) => {
                setPayerName(e.target.value);
                setPayerError(null);
              }}
            />
            <FieldDescription>{t("payment.payerNameHint")}</FieldDescription>
            <FieldError errors={payerError ? [{ message: t(payerError) }] : undefined} />
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
