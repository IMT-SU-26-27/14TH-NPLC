"use client";

import { ExternalLinkIcon, ImageIcon, Link2Icon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { TwibbonProofFieldProps } from "@/types/registration";

// The twibbon proof is the link to the visitor's Instagram post (design v86 09/11). A plain text input, so the
// form draft keeps it, unlike a file.
export function TwibbonProofField({ twibbonUrl, disabled, error, onValueChange }: TwibbonProofFieldProps) {
  const { t } = useI18n();

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="twibbonPostUrl" className="text-primary font-mono text-xs tracking-[0.15em] uppercase">
        {t(twibbonUrl ? "twibbon.proof" : "twibbon.proofOptional")}
      </FieldLabel>
      {twibbonUrl ? (
        <a href={twibbonUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-primary text-foreground h-10 w-fit! px-4")}>
          <ImageIcon />
          {t("twibbon.open")}
          <ExternalLinkIcon data-icon="inline-end" />
        </a>
      ) : (
        <FieldDescription>{t("twibbon.noLink")}</FieldDescription>
      )}
      <InputGroup className="h-12">
        <InputGroupAddon>
          <Link2Icon />
        </InputGroupAddon>
        <InputGroupInput
          id="twibbonPostUrl"
          name="twibbonPostUrl"
          type="url"
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={500}
          placeholder={t("twibbon.placeholder")}
          disabled={disabled}
          aria-invalid={!!error}
          onInput={onValueChange}
        />
      </InputGroup>
      <FieldDescription>{t("twibbon.hint")}</FieldDescription>
      <FieldError errors={error ? [{ message: error }] : undefined} />
    </Field>
  );
}
