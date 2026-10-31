"use client";

import { ExternalLinkIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { TwibbonProofFieldProps } from "@/types/registration";

export function TwibbonProofField({ twibbonUrl, disabled, error, uploading, progress, onFileChange }: TwibbonProofFieldProps) {
  const { t } = useI18n();

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="twibbonProof">{t(twibbonUrl ? "twibbon.proof" : "twibbon.proofOptional")}</FieldLabel>
      {twibbonUrl ? (
        <a href={twibbonUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", className: "text-foreground w-fit" })}>
          <ExternalLinkIcon />
          {t("twibbon.open")}
        </a>
      ) : (
        <FieldDescription>{t("twibbon.noLink")}</FieldDescription>
      )}
      <Input
        id="twibbonProof"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        aria-invalid={!!error}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      <FieldDescription>{t("twibbon.hint")}</FieldDescription>
      <FieldError errors={error ? [{ message: error }] : undefined} />
      {uploading && <Progress value={progress} />}
    </Field>
  );
}
