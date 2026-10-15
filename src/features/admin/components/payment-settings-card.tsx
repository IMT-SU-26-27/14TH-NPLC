import { CreditCardIcon, QrCodeIcon } from "lucide-react";
import { publicImageUrl } from "@/lib/cloudinary/server";
import { formatRupiah } from "@/lib/format";
import { getT } from "@/lib/i18n/get-dictionary";
import { isPaymentReady } from "@/lib/payment";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { PaymentSettingsDialog } from "@/features/admin/components/payment-settings-dialog";
import type { PaymentSettingsCardProps } from "@/types/admin";

// One row per competition: how participants pay, and a dialog to change it (QRIS image or BCA account).
export function PaymentSettingsCard({ competitions, lang }: PaymentSettingsCardProps) {
  const t = getT(lang);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.payment.title")}</CardTitle>
        <CardDescription>{t("admin.payment.lead")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="divide-y rounded-lg border">
          {competitions.map((c) => {
            const qrisUrl = c.qris_public_id ? publicImageUrl(c.qris_public_id) : null;
            const isBank = c.payment_method === "bank_transfer";
            const ready = isPaymentReady(c, qrisUrl);
            return (
              <Item key={c.id} size="sm" className="rounded-none">
                <ItemMedia variant="icon">{isBank ? <CreditCardIcon /> : <QrCodeIcon />}</ItemMedia>
                <ItemContent>
                  <ItemTitle>{c.name}</ItemTitle>
                  <ItemDescription>
                    {isBank ? t("admin.payment.bank") : t("admin.payment.qris")}
                    {isBank && ready && (
                      <>
                        {" · "}
                        <span className="font-mono">{c.bank_account_number}</span> · {c.bank_account_holder}
                      </>
                    )}
                    {" · "}
                    {formatRupiah(c.fee, lang)}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  {!ready && <Badge variant="destructive">{t("admin.payment.notSet")}</Badge>}
                  <PaymentSettingsDialog competition={c} qrisUrl={qrisUrl} />
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
