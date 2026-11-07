"use client";

import { CheckIcon, CopyIcon, KeyRoundIcon, LinkIcon } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import type { ReferralCodeProps } from "@/types/registration";

const action = "border-primary text-primary h-12 rounded-lg px-4.5";

export function ReferralCode({ code }: ReferralCodeProps) {
  const { copied, copy } = useCopyToClipboard();
  const { t, href } = useI18n();

  return (
    <div className="space-y-2 pt-3">
      <p className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{t("dashboard.teamCode")}</p>
      <div className="flex gap-2">
        <div className="bg-card border-input flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-lg border px-3.5">
          <KeyRoundIcon aria-hidden className="text-muted-foreground size-[18px] shrink-0" />
          <input
            aria-label={t("dashboard.teamCode")}
            value={code}
            readOnly
            className="text-foreground min-w-0 flex-1 bg-transparent font-mono text-base tracking-[0.22em] outline-none"
          />
        </div>
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
