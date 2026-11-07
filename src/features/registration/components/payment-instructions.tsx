"use client";

import Image from "next/image";
import { CheckIcon, CopyIcon, InfoIcon } from "lucide-react";
import { isPaymentReady } from "@/lib/payment";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeeAmount } from "@/components/shared/fee-amount";
import type { PaymentInstructionsProps } from "@/types/competition";

const rowLabel = "text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase";

// Where to pay: the competition's QRIS image, or its bank account. The amount is shown either way.
export function PaymentInstructions({ details, fee, qrisUrl, transferNote }: PaymentInstructionsProps) {
  const { t, lang } = useI18n();
  const account = useCopyToClipboard();
  const note = useCopyToClipboard();
  const ready = isPaymentReady(details, qrisUrl);
  const isBank = details.payment_method === "bank_transfer";

  // A <dt>/<dd> pair, so it can sit inside the bank details list or its own <dl>.
  const amount = (
    <div className="bg-card space-y-0.5 rounded-b-lg px-4 py-3">
      <dt className={rowLabel}>{t("payment.amount")}</dt>
      <dd>
        <FeeAmount
          fee={fee}
          normalFee={details.fee}
          lang={lang}
          labels={{ normal: t("competition.normalPrice"), early: t("competition.earlyPrice") }}
          className="font-heading text-2xl font-bold"
        />
      </dd>
    </div>
  );

  if (!ready) {
    return (
      <div className="space-y-2">
        <Alert>
          <InfoIcon />
          <AlertDescription>{isBank ? t("payment.bankMissing") : t("payment.qrisMissing")}</AlertDescription>
        </Alert>
        <dl className="rounded-lg border">{amount}</dl>
      </div>
    );
  }

  if (isBank) {
    return (
      <dl className="bg-muted/40 divide-y rounded-lg border text-sm">
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="space-y-0.5">
            <dt className={rowLabel}>{t("payment.bankName")}</dt>
            <dd className="font-medium">{t("payment.bankValue")}</dd>
          </div>
          <Badge variant="outline" className="bg-card font-mono text-xs tracking-[0.15em] uppercase">
            {t("payment.bankOnly")}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="space-y-0.5">
            <dt className={rowLabel}>{t("payment.accountNumber")}</dt>
            <dd className="font-mono text-base font-semibold tabular-nums">{details.bank_account_number}</dd>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-primary text-primary"
            aria-label={t("payment.copyAccount")}
            onClick={() => account.copy(details.bank_account_number ?? "", t("payment.accountCopied"))}
          >
            {account.copied ? <CheckIcon /> : <CopyIcon />}
            {t("payment.copy")}
          </Button>
        </div>
        <div className="space-y-0.5 px-4 py-3">
          <dt className={rowLabel}>{t("payment.accountHolder")}</dt>
          <dd className="font-medium">{details.bank_account_holder}</dd>
        </div>
        {transferNote && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 space-y-0.5">
              <dt className={rowLabel}>{t("payment.transferNote")}</dt>
              <dd className="font-mono font-semibold break-words">{transferNote}</dd>
              <dd className="text-muted-foreground text-xs">{t("payment.transferNoteHint")}</dd>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-primary text-primary"
              aria-label={t("payment.copyNote")}
              onClick={() => note.copy(transferNote, t("payment.noteCopied"))}
            >
              {note.copied ? <CheckIcon /> : <CopyIcon />}
              {t("payment.copy")}
            </Button>
          </div>
        )}
        {amount}
      </dl>
    );
  }

  return (
    <div className="space-y-2">
      <Image
        src={qrisUrl!}
        alt={t("payment.qrisAlt", { competition: details.name })}
        width={384}
        height={384}
        className="bg-card aspect-square w-full max-w-56 rounded-lg border object-contain"
      />
      <dl className="rounded-lg border">{amount}</dl>
    </div>
  );
}
