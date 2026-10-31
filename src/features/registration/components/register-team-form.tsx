"use client";

import { startTransition, useActionState, useState } from "react";
import { OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { createRegistration, getNewRegistrationUploadSignature } from "@/lib/actions/registration";
import { initialFormState } from "@/lib/form";
import { isPaymentReady } from "@/lib/payment";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { PaymentInstructions } from "@/features/registration/components/payment-instructions";
import type { RegisterTeamFormProps } from "@/types/registration";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

// Registering = creating the team AND paying: the proof is uploaded first, then the team is created with it.
export function RegisterTeamForm({ competition, user, qrisUrl }: RegisterTeamFormProps) {
  const [state, action, pending] = useActionState(createRegistration, initialFormState);
  const { t, fieldErrors } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [missingProof, setMissingProof] = useState(false);
  const { upload, uploading, progress, error: uploadError, errorParams } = useCloudinaryUpload({
    getSignature: getNewRegistrationUploadSignature,
    maxBytes: MAX_BYTES,
    accept: ACCEPT,
  });
  const errors = state.fieldErrors ?? {};
  const busy = uploading || pending;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!file) {
      setMissingProof(true);
      return;
    }
    setMissingProof(false);
    const uploaded = await upload(file);
    if (!uploaded) return;
    const data = new FormData(form);
    data.set("paymentProofPublicId", uploaded.publicId);
    data.set("paymentProofFormat", uploaded.format);
    startTransition(() => action(data));
  }

  const proofError = missingProof
    ? t("register.paymentRequired")
    : uploadError
      ? t(uploadError, errorParams)
      : errors.paymentProofPublicId
        ? t(errors.paymentProofPublicId[0].message)
        : null;

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="competitionId" value={competition.id} />
      <FieldGroup>
        <Alert>
          <TriangleAlertIcon />
          <AlertDescription>{t("register.oneCompetitionWarning")}</AlertDescription>
        </Alert>

        <Field data-invalid={!!errors.teamName}>
          <FieldLabel htmlFor="teamName">{t("register.teamName")}</FieldLabel>
          <Input id="teamName" name="teamName" maxLength={60} aria-invalid={!!errors.teamName} required />
          <FieldDescription>{t("register.teamNameHint")}</FieldDescription>
          <FieldError errors={fieldErrors(errors.teamName)} />
        </Field>

        <FieldSet>
          <FieldLegend>{t("register.leader")}</FieldLegend>
          <FieldDescription>{t("register.leaderHint")}</FieldDescription>
          <FieldGroup>
            <Field data-invalid={!!errors.leaderName}>
              <FieldLabel htmlFor="leaderName">{t("common.fullName")}</FieldLabel>
              <Input id="leaderName" name="leaderName" defaultValue={user.full_name} autoComplete="name" aria-invalid={!!errors.leaderName} required />
              <FieldError errors={fieldErrors(errors.leaderName)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="leaderEmail">{t("common.email")}</FieldLabel>
              <Input id="leaderEmail" value={user.email} disabled readOnly />
              <FieldDescription>{t("common.fromAccount")}</FieldDescription>
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={!!errors.leaderPhone}>
                <FieldLabel htmlFor="leaderPhone">{t("common.phoneWhatsapp")}</FieldLabel>
                <Input id="leaderPhone" name="leaderPhone" type="tel" inputMode="tel" placeholder={t("common.phonePlaceholder")} autoComplete="tel" aria-invalid={!!errors.leaderPhone} required />
                <FieldError errors={fieldErrors(errors.leaderPhone)} />
              </Field>
              <Field data-invalid={!!errors.leaderNisn}>
                <FieldLabel htmlFor="leaderNisn">{t("common.nisn")}</FieldLabel>
                <Input id="leaderNisn" name="leaderNisn" inputMode="numeric" maxLength={10} placeholder={t("common.nisnPlaceholder")} aria-invalid={!!errors.leaderNisn} required />
                <FieldError errors={fieldErrors(errors.leaderNisn)} />
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>{t("register.paymentTitle")}</FieldLegend>
          <FieldDescription>{t("register.paymentLead")}</FieldDescription>
          <div className="grid gap-6 sm:grid-cols-[14rem_1fr]">
            <PaymentInstructions details={competition} qrisUrl={qrisUrl} />
            <Field data-invalid={!!proofError}>
              <FieldLabel htmlFor="paymentProof">{t("payment.proof")}</FieldLabel>
              <Input
                id="paymentProof"
                type="file"
                accept={ACCEPT.join(",")}
                disabled={busy}
                aria-invalid={!!proofError}
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setMissingProof(false);
                }}
              />
              <FieldDescription>{t("payment.proofHint")}</FieldDescription>
              <FieldError errors={proofError ? [{ message: proofError }] : undefined} />
              {uploading && <Progress value={progress} />}
            </Field>
          </div>
        </FieldSet>

        {state.status === "error" && state.message && !state.fieldErrors && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" disabled={busy || !isPaymentReady(competition, qrisUrl)}>
          {busy && <Spinner />}
          {uploading ? t("payment.uploading", { progress }) : t("register.submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
