import { QrCodeIcon } from "lucide-react";
import { getT } from "@/lib/i18n/get-dictionary";
import { qrSvg, rallyQrPayload } from "@/lib/rally/qr";
import type { RallyTeamQrProps } from "@/types/rally";

export async function RallyTeamQr({ token, referralCode, lang }: RallyTeamQrProps) {
  const t = getT(lang);
  const svg = await qrSvg(rallyQrPayload(token));

  return (
    <section className="bg-card-muted ring-border space-y-3 rounded-[12px] p-4 ring-1 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{`// ${t("rally.team.qrLabel")}`}</h3>
        <QrCodeIcon aria-hidden className="text-primary size-4" />
      </div>
      <p className="text-muted-foreground text-sm">{t("rally.team.qrLead")}</p>
      {/* Generated on the server from the team's own token. */}
      <div
        role="img"
        aria-label={t("rally.team.qrTitle")}
        className="mx-auto w-full max-w-xs rounded-[8px] border bg-white"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="text-muted-foreground text-center text-sm">
        {t("rally.team.backupCode")} <span className="text-foreground font-mono font-medium tracking-widest">{referralCode}</span>
      </p>
    </section>
  );
}
