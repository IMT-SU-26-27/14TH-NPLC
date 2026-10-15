"use client";

import { ArrowRightIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { JoinCodeFormProps } from "@/types/registration";

// Plain GET form: the code ends up in ?code= and the page shows the team preview.
export function JoinCodeForm({ defaultCode }: JoinCodeFormProps) {
  const { t, href } = useI18n();

  return (
    <form action={href("/join")} method="get">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="code">{t("join.code")}</FieldLabel>
          <Input
            id="code"
            name="code"
            defaultValue={defaultCode}
            placeholder={t("join.codePlaceholder")}
            maxLength={8}
            autoComplete="off"
            className="font-mono tracking-widest uppercase"
            required
          />
          <FieldDescription>{t("join.codeHint")}</FieldDescription>
        </Field>
        <Button type="submit">
          {t("join.find")}
          <ArrowRightIcon />
        </Button>
      </FieldGroup>
    </form>
  );
}
