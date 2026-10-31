import Link from "next/link";
import { QrCodeIcon, TrophyIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { qrSvg, rallyQrPayload } from "@/lib/rally/qr";
import { buttonVariants } from "@/components/ui/button";
import type { RallyTeamQrProps } from "@/types/rally";

export async function RallyTeamQr({ token, referralCode, lang }: RallyTeamQrProps) {
  const t = getT(lang);
  const svg = await qrSvg(rallyQrPayload(token));

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 font-medium">
        <QrCodeIcon className="size-4" />
        {t("rally.team.qrTitle")}
      </h3>
      <p className="text-muted-foreground text-sm">{t("rally.team.qrLead")}</p>
      {/* Generated on the server from the team's own token. */}
      <div
        role="img"
        aria-label={t("rally.team.qrTitle")}
        className="mx-auto w-full max-w-xs rounded-lg border bg-white"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="text-muted-foreground text-center text-sm">
        {t("rally.team.backupCode")} <span className="text-foreground font-mono font-medium tracking-widest">{referralCode}</span>
      </p>
      <div className="flex justify-center">
        <Link href={localePath(lang, "/rally/leaderboard")} className={buttonVariants({ variant: "outline" })}>
          <TrophyIcon />
          {t("rally.leaderboard.title")}
        </Link>
      </div>
    </section>
  );
}
