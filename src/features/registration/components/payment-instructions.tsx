"use client";

import Image from "next/image";
import { CheckIcon, CopyIcon, InfoIcon } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { isPaymentReady, PAYMENT_UNIQUE_CODE, transferAmount } from "@/lib/payment";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { PaymentInstructionsProps } from "@/types/competition";

const rowLabel = "text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase";
const copyButton = "border-primary text-primary shrink-0";

// Where to pay, in the order the participant needs it: the exact amount (fee plus the unique code), the bank
// account, then the transfer note. QRIS shows its image and the amount.
export function PaymentInstructions({ details, fee, qrisUrl, transferNote }: PaymentInstructionsProps) {
  const { t, lang } = useI18n();
  const amountCopy = useCopyToClipboard();
  const account = useCopyToClipboard();
  const note = useCopyToClipboard();
  const ready = isPaymentReady(details, qrisUrl);
  const isBank = details.payment_method === "bank_transfer";
  // 0 = the admin has not set the fee yet: formatRupiah shows "to be announced", with no code and nothing to copy.
  const total = fee > 0 ? transferAmount(fee) : 0;

  // A <dt>/<dd> pair, so it can sit inside the bank details list or its own <dl>.
  const amount = (
    <div className="bg-card flex items-start justify-between gap-3 px-4 py-3">
      <div className="min-w-0 space-y-0.5">
        <dt className={rowLabel}>{t("payment.amount")}</dt>
        <dd className="font-heading text-2xl font-bold tabular-nums">{formatRupiah(total, lang)}</dd>
        {total > 0 && (
          <dd className="text-muted-foreground text-xs">
            {t("payment.amountHint", { fee: formatRupiah(fee, lang), code: PAYMENT_UNIQUE_CODE })}
          </dd>
        )}
      </div>
      {total > 0 && (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={copyButton}
        aria-label={t("payment.copyAmount")}
        onClick={() => amountCopy.copy(String(total), t("payment.amountCopied"))}
      >
        {amountCopy.copied ? <CheckIcon /> : <CopyIcon />}
        {t("payment.copy")}
      </Button>
      )}
    </div>
  );

  if (!ready) {
    return (
      <div className="space-y-2">
        <Alert>
          <InfoIcon />
          <AlertDescription>{isBank ? t("payment.bankMissing") : t("payment.qrisMissing")}</AlertDescription>
        </Alert>
        <dl className="overflow-hidden rounded-lg border">{amount}</dl>
      </div>
    );
  }

  if (isBank) {
    return (
      <dl className="bg-muted/40 divide-y overflow-hidden rounded-lg border text-sm">
        {amount}
        <div className="space-y-3 px-4 py-3">
          <div className="space-y-0.5">
            <dt className={rowLabel}>{t("payment.bankName")}</dt>
            <dd className="font-medium">{t("payment.bankValue")}</dd>
          </div>
          <div className="space-y-0.5">
            <dt className={rowLabel}>{t("payment.accountHolder")}</dt>
            <dd className="font-medium">{details.bank_account_holder}</dd>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0 space-y-0.5">
            <dt className={rowLabel}>{t("payment.accountNumber")}</dt>
            <dd className="font-mono text-base font-semibold tabular-nums">{details.bank_account_number}</dd>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={copyButton}
            aria-label={t("payment.copyAccount")}
            onClick={() => account.copy(details.bank_account_number ?? "", t("payment.accountCopied"))}
          >
            {account.copied ? <CheckIcon /> : <CopyIcon />}
            {t("payment.copy")}
          </Button>
        </div>
        {transferNote && (
          <div className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0 space-y-0.5">
              <dt className={rowLabel}>{t("payment.transferNote")}</dt>
              <dd className="font-mono font-semibold break-words">{transferNote}</dd>
              <dd className="text-muted-foreground text-xs">{t("payment.transferNoteHint")}</dd>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={copyButton}
              aria-label={t("payment.copyNote")}
              onClick={() => note.copy(transferNote, t("payment.noteCopied"))}
            >
              {note.copied ? <CheckIcon /> : <CopyIcon />}
              {t("payment.copy")}
            </Button>
          </div>
        )}
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
      <dl className="overflow-hidden rounded-lg border">{amount}</dl>
    </div>
  );
}
