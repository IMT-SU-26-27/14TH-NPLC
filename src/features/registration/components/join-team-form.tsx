"use client";

import { startTransition, useActionState, useState } from "react";
import { ArrowRightIcon, IdCardIcon, ImageIcon, MailIcon, MessageCircleIcon, OctagonXIcon, UserIcon } from "lucide-react";
import { getTwibbonUploadSignature, joinTeam } from "@/lib/actions/registration";
import { initialFormState } from "@/lib/form";
import { cn } from "@/lib/utils";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { useFormDraft } from "@/hooks/use-form-draft";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { FormDraftBanner } from "@/components/shared/form-draft-banner";
import { FormDraftStatus } from "@/components/shared/form-draft-status";
import { TwibbonProofField } from "@/features/registration/components/twibbon-proof-field";
import type { JoinTeamFormProps } from "@/types/registration";

const TWIBBON_ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

const label = "text-primary font-mono text-xs tracking-[0.15em] uppercase";
const inputGroup = "h-11 has-[>[data-align=inline-start]]:[&>input]:pl-3";

const requiredMark = (
  <span aria-hidden className="text-destructive">
    *
  </span>
);

export function JoinTeamForm({ referralCode, preview, user }: JoinTeamFormProps) {
  const { formRef, restored: draftRestored, savedAt: draftSavedAt, discardDraft, clearOnSuccess } = useFormDraft({ formId: "join-team", userId: user.id });
  const [state, action, pending] = useActionState(clearOnSuccess(joinTeam), initialFormState);
  const { t, fieldErrors } = useI18n();
  const [twibbonFile, setTwibbonFile] = useState<File | null>(null);
  const [missingTwibbon, setMissingTwibbon] = useState(false);
  const twibbon = useCloudinaryUpload({ getSignature: getTwibbonUploadSignature, maxBytes: MAX_BYTES, accept: TWIBBON_ACCEPT });
  const errors = state.fieldErrors ?? {};
  const busy = twibbon.uploading || pending;
  const twibbonError = missingTwibbon ? t("errors.twibbonRequired") : twibbon.error ? t(twibbon.error, twibbon.errorParams) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (preview.twibbon_url && !twibbonFile) {
      setMissingTwibbon(true);
      return;
    }
    setMissingTwibbon(false);
    const uploaded = twibbonFile ? await twibbon.upload(twibbonFile) : null;
    if (twibbonFile && !uploaded) return;
    const data = new FormData(form);
    if (uploaded) {
      data.set("twibbonProofPublicId", uploaded.publicId);
      data.set("twibbonProofFormat", uploaded.format);
    }
    startTransition(() => action(data));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="hidden" name="referralCode" value={referralCode} />
      <FieldGroup>
        {draftRestored && <FormDraftBanner hasFiles onDiscard={discardDraft} />}
        <Field data-invalid={!!errors.fullName}>
          <FieldLabel htmlFor="fullName" className={label}>
            {t("common.fullName")} {requiredMark}
          </FieldLabel>
          <InputGroup className={inputGroup}>
            <InputGroupInput id="fullName" name="fullName" defaultValue={user.full_name} autoComplete="name" aria-invalid={!!errors.fullName} required />
            <InputGroupAddon className="pl-4">
              <UserIcon />
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={fieldErrors(errors.fullName)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email" className={label}>
            {t("common.email")}
          </FieldLabel>
          <InputGroup className={cn(inputGroup, "bg-muted")}>
            <InputGroupInput id="email" value={user.email} disabled readOnly />
            <InputGroupAddon className="pl-4">
              <MailIcon />
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>{t("common.fromAccount")}</FieldDescription>
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.nisn}>
            <FieldLabel htmlFor="nisn" className={label}>
              {t("common.nisn")} {requiredMark}
            </FieldLabel>
            <InputGroup className={inputGroup}>
              <InputGroupInput id="nisn" name="nisn" inputMode="numeric" maxLength={10} placeholder={t("common.nisnPlaceholder")} aria-invalid={!!errors.nisn} required />
              <InputGroupAddon className="pl-4">
                <IdCardIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={fieldErrors(errors.nisn)} />
          </Field>
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone" className={label}>
              {t("common.phoneOptional")}
            </FieldLabel>
            <InputGroup className={inputGroup}>
              <InputGroupInput id="phone" name="phone" type="tel" inputMode="tel" placeholder={t("common.phonePlaceholder")} aria-invalid={!!errors.phone} />
              <InputGroupAddon className="pl-4">
                <MessageCircleIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={fieldErrors(errors.phone)} />
          </Field>
        </div>

        <div className="flex gap-3">
          <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
            <ImageIcon aria-hidden className="size-4" />
          </span>
          <div className="space-y-0.5">
            <h3 className="text-lg leading-7 font-bold">{t("join.twibbonTitle")}</h3>
            <p className="text-muted-foreground text-sm">{t("join.twibbonLead")}</p>
          </div>
        </div>
        <TwibbonProofField
          twibbonUrl={preview.twibbon_url}
          disabled={busy}
          error={twibbonError}
          uploading={twibbon.uploading}
          progress={twibbon.progress}
          reselectHint={draftRestored && !twibbonFile}
          onFileChange={(next) => {
            setTwibbonFile(next);
            setMissingTwibbon(false);
          }}
        />

        {state.status === "error" && state.message && (
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertDescription>{t(state.message)}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="bg-highlight text-highlight-foreground hover:bg-highlight/80 h-11 w-full" disabled={busy}>
          {busy && <Spinner />}
          {t("join.submit", { team: preview.team_name })}
          {!busy && <ArrowRightIcon data-icon="inline-end" />}
        </Button>
        <FormDraftStatus savedAt={draftSavedAt} className="-mt-3 justify-center" />
      </FieldGroup>
    </form>
  );
}
