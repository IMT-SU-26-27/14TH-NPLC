"use client";

import Image from "next/image";
import { CheckIcon, CopyIcon, InfoIcon } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { isPaymentReady } from "@/lib/payment";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useI18n } from "@/hooks/use-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { PaymentInstructionsProps } from "@/types/competition";

// Where to pay: the competition's QRIS image, or its BCA account. The amount is shown either way.
export function PaymentInstructions({ details, qrisUrl }: PaymentInstructionsProps) {
  const { t, lang } = useI18n();
  const { copied, copy } = useCopyToClipboard();
  const ready = isPaymentReady(details, qrisUrl);
  const isBank = details.payment_method === "bank_transfer";

  const amount = (
    <p className="text-sm">
      {t("payment.amount")}: <span className="font-semibold">{formatRupiah(details.fee, lang)}</span>
    </p>
  );

  if (!ready) {
    return (
      <div className="space-y-2">
        <Alert>
          <InfoIcon />
          <AlertDescription>{isBank ? t("payment.bankMissing") : t("payment.qrisMissing")}</AlertDescription>
        </Alert>
        {amount}
      </div>
    );
  }

  if (isBank) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">{t("payment.bankTitle")}</p>
        <dl className="bg-muted/50 divide-y rounded-lg border text-sm">
          <div className="space-y-0.5 px-3 py-2">
            <dt className="text-muted-foreground text-xs">{t("payment.bankName")}</dt>
            <dd className="font-medium">BCA</dd>
          </div>
          <div className="space-y-0.5 px-3 py-2">
            <dt className="text-muted-foreground text-xs">{t("payment.accountNumber")}</dt>
            <dd className="flex items-center justify-between gap-2 font-mono font-medium tabular-nums">
              {details.bank_account_number}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={t("payment.copyAccount")}
                onClick={() => copy(details.bank_account_number ?? "", t("payment.accountCopied"))}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </dd>
          </div>
          <div className="space-y-0.5 px-3 py-2">
            <dt className="text-muted-foreground text-xs">{t("payment.accountHolder")}</dt>
            <dd className="font-medium">{details.bank_account_holder}</dd>
          </div>
        </dl>
        {amount}
      </div>
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
      {amount}
    </div>
  );
}
