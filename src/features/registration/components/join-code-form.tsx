"use client";

import { SearchIcon, UsersIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { JoinCodeFormProps } from "@/types/registration";

// Plain GET form: the code ends up in ?code= and the page shows the team preview.
export function JoinCodeForm({ defaultCode, primary = true }: JoinCodeFormProps) {
  const { t, href } = useI18n();

  return (
    <form action={href("/join")} method="get">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="code" className="text-primary font-mono text-xs tracking-[0.15em] uppercase">
            {t("join.code")}
            <span aria-hidden className="text-destructive">
              *
            </span>
          </FieldLabel>
          <InputGroup className="h-12 has-[>[data-align=inline-start]]:[&>input]:pl-3">
            <InputGroupInput
              id="code"
              name="code"
              defaultValue={defaultCode}
              placeholder={t("join.codePlaceholder")}
              maxLength={8}
              autoComplete="off"
              className="font-mono text-base tracking-[0.3em] uppercase"
              required
            />
            <InputGroupAddon className="pl-4">
              <UsersIcon className="size-5" />
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>{t("join.codeHint")}</FieldDescription>
        </Field>
        <Button type="submit" size="lg" variant={primary ? "default" : "outline"} className="h-11 w-full">
          {t("join.find")}
          <SearchIcon data-icon="inline-end" />
        </Button>
      </FieldGroup>
    </form>
  );
}
