"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { ArrowRightIcon, IdCardIcon, MailIcon, MessageCircleIcon, OctagonXIcon, SchoolIcon, TriangleAlertIcon, UserIcon, UsersIcon } from "lucide-react";
import { createRegistration, getNewRegistrationUploadSignature } from "@/lib/actions/registration";
import { fieldErrorState, initialFormState } from "@/lib/form";
import { isPaymentReady } from "@/lib/payment";
import { createRegistrationSchema } from "@/lib/validations/registration";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { useFormDraft } from "@/hooks/use-form-draft";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { FormDraftBanner } from "@/components/shared/form-draft-banner";
import { FormDraftStatus } from "@/components/shared/form-draft-status";
import { FilePicker } from "@/components/shared/file-picker";
import { FormStepHeading } from "@/features/registration/components/form-step-heading";
import { PaymentInstructions } from "@/features/registration/components/payment-instructions";
import { TwibbonProofField } from "@/features/registration/components/twibbon-proof-field";
import type { FieldErrors } from "@/types";
import type { RegisterTeamFormProps } from "@/types/registration";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

// The typed fields, checked in the browser before anything is uploaded. The Server Action checks them again.
const typedFieldsSchema = createRegistrationSchema.pick({
  teamName: true,
  school: true,
  leaderName: true,
  leaderPhone: true,
  leaderNisn: true,
  twibbonPostUrl: true,
});

const FIELD_ORDER = ["teamName", "school", "leaderName", "leaderPhone", "leaderNisn"];

const label = "text-primary font-mono text-xs tracking-[0.15em] uppercase";

const requiredMark = (
  <span aria-hidden className="text-destructive">
    *
  </span>
);

// Registering = creating the team AND paying: the proof is uploaded first, then the team is created with it.
export function RegisterTeamForm({ competition, user, qrisUrl, fee }: RegisterTeamFormProps) {
  const { formRef, restored: draftRestored, savedAt: draftSavedAt, discardDraft, clearOnSuccess } = useFormDraft({ formId: `register-team-${competition.slug}`, userId: user.id });
  const [state, action, pending] = useActionState(clearOnSuccess(createRegistration), initialFormState);
  const { t, fieldErrors } = useI18n();
  const [teamName, setTeamName] = useState("");
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [missingProof, setMissingProof] = useState(false);
  const { upload, uploading, progress, error: uploadError, errorParams } = useCloudinaryUpload({
    getSignature: getNewRegistrationUploadSignature,
    maxBytes: MAX_BYTES,
    accept: ACCEPT,
  });
  const [missingTwibbon, setMissingTwibbon] = useState(false);
  const errors: FieldErrors = { ...(state.fieldErrors ?? {}), ...clientErrors };
  const busy = uploading || pending;
  const hasClientErrors = Object.values(clientErrors).some(Boolean);

  // The draft hook fills the inputs without firing events, so read the restored team name for the transfer note.
  useEffect(() => {
    const input = formRef.current?.elements.namedItem("teamName");
    if (input instanceof HTMLInputElement) setTeamName(input.value);
  }, [draftRestored, formRef]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Show every problem at once instead of one per submit.
    const typed = typedFieldsSchema.safeParse(Object.fromEntries(data));
    const nextErrors = typed.success ? {} : (fieldErrorState(typed.error).fieldErrors ?? {});
    const proofMissing = !file;
    const twibbonMissing = !!competition.twibbon_url && !String(data.get("twibbonPostUrl") ?? "").trim();
    setClientErrors(nextErrors);
    setMissingProof(proofMissing);
    setMissingTwibbon(twibbonMissing);
    if (!typed.success || proofMissing || twibbonMissing) {
      // Field ids match their names, so the first problem in form order gets the focus.
      const first = FIELD_ORDER.find((name) => nextErrors[name]) ?? (proofMissing ? "paymentProof" : "twibbonPostUrl");
      document.getElementById(first)?.focus();
      return;
    }

    const uploaded = await upload(file);
    if (!uploaded) return;
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
  const twibbonError = missingTwibbon
    ? t("errors.twibbonRequired")
    : errors.twibbonPostUrl
      ? t(errors.twibbonPostUrl[0].message)
      : null;
  const formMessage = hasClientErrors || missingProof || missingTwibbon ? "validation.fixFields" : state.status === "error" ? state.message : null;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="competitionId" value={competition.id} />
      <FieldGroup>
        {draftRestored && <FormDraftBanner hasFiles onDiscard={discardDraft} />}
        <Alert className="border-l-highlight border-l-4">
          <TriangleAlertIcon />
          <AlertDescription>{t("register.oneCompetitionWarning")}</AlertDescription>
        </Alert>

        <FormStepHeading id="step-team" step={1} title={t("register.stepTeam")} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.teamName}>
            <FieldLabel htmlFor="teamName" className={label}>
              {t("register.teamName")} {requiredMark}
            </FieldLabel>
            <InputGroup className="h-12">
              <InputGroupAddon>
                <UsersIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="teamName"
                name="teamName"
                maxLength={60}
                aria-invalid={!!errors.teamName}
                required
                onChange={(e) => setTeamName(e.target.value)}
              />
            </InputGroup>
            <FieldDescription>{t("register.teamNameHint")}</FieldDescription>
            <FieldError errors={fieldErrors(errors.teamName)} />
          </Field>
          <Field data-invalid={!!errors.school}>
            <FieldLabel htmlFor="school" className={label}>
              {t("register.school")} {requiredMark}
            </FieldLabel>
            <InputGroup className="h-12">
              <InputGroupAddon>
                <SchoolIcon />
              </InputGroupAddon>
              <InputGroupInput id="school" name="school" maxLength={120} autoComplete="organization" aria-invalid={!!errors.school} required />
            </InputGroup>
            <FieldDescription>{t("register.schoolHint")}</FieldDescription>
            <FieldError errors={fieldErrors(errors.school)} />
          </Field>
        </div>

        <FieldSeparator />

        <FormStepHeading id="step-leader" step={2} title={t("register.stepLeader")} description={t("register.leaderHint")} />
        <Field data-invalid={!!errors.leaderName}>
          <FieldLabel htmlFor="leaderName" className={label}>
            {t("common.fullName")} {requiredMark}
          </FieldLabel>
          <InputGroup className="h-12">
            <InputGroupAddon>
              <UserIcon />
            </InputGroupAddon>
            <InputGroupInput id="leaderName" name="leaderName" defaultValue={user.full_name} autoComplete="name" aria-invalid={!!errors.leaderName} required />
          </InputGroup>
          <FieldError errors={fieldErrors(errors.leaderName)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="leaderEmail" className={label}>
            {t("common.email")}
          </FieldLabel>
          <InputGroup className="bg-muted h-12">
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput id="leaderEmail" type="email" value={user.email} readOnly disabled />
          </InputGroup>
          <FieldDescription>{t("common.fromAccount")}</FieldDescription>
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.leaderPhone}>
            <FieldLabel htmlFor="leaderPhone" className={label}>
              {t("common.phoneWhatsapp")} {requiredMark}
            </FieldLabel>
            <InputGroup className="h-12">
              <InputGroupAddon>
                <MessageCircleIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="leaderPhone"
                name="leaderPhone"
                type="tel"
                inputMode="tel"
                placeholder={t("common.phonePlaceholder")}
                autoComplete="tel"
                aria-invalid={!!errors.leaderPhone}
                required
              />
            </InputGroup>
            <FieldError errors={fieldErrors(errors.leaderPhone)} />
          </Field>
          <Field data-invalid={!!errors.leaderNisn}>
            <FieldLabel htmlFor="leaderNisn" className={label}>
              {t("common.nisn")} {requiredMark}
            </FieldLabel>
            <InputGroup className="h-12">
              <InputGroupAddon>
                <IdCardIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="leaderNisn"
                name="leaderNisn"
                inputMode="numeric"
                maxLength={10}
                placeholder={t("common.nisnPlaceholder")}
                aria-invalid={!!errors.leaderNisn}
                required
              />
            </InputGroup>
            <FieldError errors={fieldErrors(errors.leaderNisn)} />
          </Field>
        </div>

        <FieldSeparator />

        <FormStepHeading id="step-payment" step={3} title={t("register.stepPayment")} description={t("register.paymentStepLead")} />
        <PaymentInstructions
          details={competition}
          fee={fee}
          qrisUrl={qrisUrl}
          transferNote={`${teamName.trim() || t("register.teamName")} - ${competition.name}`}
        />
        <Field data-invalid={!!proofError}>
          <FieldLabel htmlFor="paymentProof" className={label}>
            {t("payment.proof")} {requiredMark}
          </FieldLabel>
          <FilePicker
            id="paymentProof"
            accept={ACCEPT.join(",")}
            disabled={busy}
            invalid={!!proofError}
            onFileChange={(next) => {
              setFile(next);
              setMissingProof(false);
            }}
          />
          <FieldDescription>{t("payment.proofPick")}</FieldDescription>
          {draftRestored && !file && <FieldDescription className="text-warning">{t("draft.reselectFile")}</FieldDescription>}
          <FieldError errors={proofError ? [{ message: proofError }] : undefined} />
          {uploading && <Progress value={progress} />}
        </Field>

        <FieldSeparator />

        <FormStepHeading id="step-twibbon" step={4} title={t("register.stepTwibbon")} description={t("register.twibbonLead")} />
        <TwibbonProofField
          twibbonUrl={competition.twibbon_url}
          disabled={busy}
          error={twibbonError}
          onValueChange={() => setMissingTwibbon(false)}
        />

        {formMessage && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(formMessage)}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          size="lg"
          className="bg-highlight text-highlight-foreground hover:bg-highlight/80 h-11 w-full"
          disabled={busy || !isPaymentReady(competition, qrisUrl)}
        >
          {busy && <Spinner />}
          {uploading ? t("payment.uploading", { progress }) : t("register.submit")}
          {!busy && <ArrowRightIcon data-icon="inline-end" />}
        </Button>
        <FormDraftStatus savedAt={draftSavedAt} className="-mt-3 justify-center" />
      </FieldGroup>
    </form>
  );
}
