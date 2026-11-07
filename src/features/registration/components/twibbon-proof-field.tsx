"use client";

import { ExternalLinkIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { FilePicker } from "@/features/registration/components/file-picker";
import type { TwibbonProofFieldProps } from "@/types/registration";

export function TwibbonProofField({ twibbonUrl, disabled, error, uploading, progress, onFileChange }: TwibbonProofFieldProps) {
  const { t } = useI18n();

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="twibbonProof" className="text-primary font-mono text-xs tracking-[0.15em] uppercase">{t(twibbonUrl ? "twibbon.proof" : "twibbon.proofOptional")}</FieldLabel>
      {twibbonUrl ? (
        <a href={twibbonUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-primary text-foreground w-fit")}>
          <ExternalLinkIcon />
          {t("twibbon.open")}
        </a>
      ) : (
        <FieldDescription>{t("twibbon.noLink")}</FieldDescription>
      )}
      <FilePicker id="twibbonProof" accept="image/jpeg,image/png,image/webp" disabled={disabled} invalid={!!error} onFileChange={onFileChange} />
      <FieldDescription>{t("twibbon.hint")}</FieldDescription>
      <FieldError errors={error ? [{ message: error }] : undefined} />
      {uploading && <Progress value={progress} />}
    </Field>
  );
}
