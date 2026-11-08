"use client";

import { CheckIcon, CopyIcon, KeyRoundIcon, LinkIcon } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { ReferralCodeProps } from "@/types/registration";

const action = "border-primary text-primary h-12 rounded-[8px] px-4.5";

export function ReferralCode({ code }: ReferralCodeProps) {
  const { copied, copy } = useCopyToClipboard();
  const { t, href } = useI18n();

  return (
    <div className="space-y-2 pt-3">
      <p className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{t("dashboard.teamCode")}</p>
      <div className="flex gap-2">
        <InputGroup className="h-12 min-w-0 flex-1 rounded-[8px]">
          <InputGroupAddon>
            <KeyRoundIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={t("dashboard.teamCode")}
            value={code}
            readOnly
            className="font-mono text-base tracking-[0.22em]"
          />
        </InputGroup>
        <Button type="button" variant="outline" className={action} onClick={() => copy(code, t("dashboard.codeCopied"))}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {t("dashboard.copy")}
        </Button>
      </div>
      <Button
        type="button"
        variant="outline"
        className={action}
        onClick={() => copy(`${window.location.origin}${href("/join")}?code=${code}`, t("dashboard.inviteCopied"))}
      >
        <LinkIcon />
        {t("dashboard.inviteLink")}
      </Button>
      <p className="text-muted-foreground text-[13px] leading-[18px]">{t("dashboard.teamCodeHint")}</p>
    </div>
  );
}
