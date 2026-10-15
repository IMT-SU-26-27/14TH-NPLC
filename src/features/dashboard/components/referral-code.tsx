"use client";

import { CheckIcon, CopyIcon, LinkIcon } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ReferralCodeProps } from "@/types/registration";

export function ReferralCode({ code }: ReferralCodeProps) {
  const { copied, copy } = useCopyToClipboard();
  const { t, href } = useI18n();

  return (
    <Field>
      <FieldLabel htmlFor={`code-${code}`}>{t("dashboard.teamCode")}</FieldLabel>
      <div className="flex gap-2">
        <Input id={`code-${code}`} value={code} readOnly className="font-mono tracking-widest" />
        <Button type="button" variant="outline" size="icon" aria-label={t("dashboard.copyCode")} onClick={() => copy(code, t("dashboard.codeCopied"))}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => copy(`${window.location.origin}${href("/join")}?code=${code}`, t("dashboard.inviteCopied"))}
        >
          <LinkIcon />
          {t("dashboard.inviteLink")}
        </Button>
      </div>
      <FieldDescription>{t("dashboard.teamCodeHint")}</FieldDescription>
    </Field>
  );
}
