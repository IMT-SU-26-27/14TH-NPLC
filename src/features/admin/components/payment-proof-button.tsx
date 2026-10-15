"use client";

import { useTransition } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { getPaymentProofUrl } from "@/lib/actions/admin-registrations";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { PaymentProofButtonProps } from "@/types/admin";

// Fetches a 10-minute link to the private proof only when the admin asks for it.
export function PaymentProofButton({ registrationId }: PaymentProofButtonProps) {
  const [pending, startTransition] = useTransition();
  const { t } = useI18n();

  function open() {
    const tab = window.open("about:blank", "_blank");
    startTransition(async () => {
      const result = await getPaymentProofUrl(registrationId);
      if (result.ok && tab) tab.location.href = result.data;
      else {
        tab?.close();
        toast.error(t(result.ok ? "admin.detail.allowPopups" : result.message));
      }
    });
  }

  return (
    <Button type="button" variant="outline" onClick={open} disabled={pending}>
      {pending ? <Spinner /> : <ExternalLinkIcon />}
      {t("admin.detail.viewProof")}
    </Button>
  );
}
