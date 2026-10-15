import Link from "next/link";
import { CalendarIcon, UsersIcon, WalletIcon } from "lucide-react";
import { formatDateTime, formatRupiah, formatTeamSize } from "@/lib/format";
import { isRegistrationOpen } from "@/lib/data/competitions";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompetitionCardProps } from "@/types/competition";

export function CompetitionCard({ competition, lang }: CompetitionCardProps) {
  const t = getT(lang);
  const open = isRegistrationOpen(competition);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{competition.name}</CardTitle>
        {t(`competition.type.${competition.type}`).toLowerCase() !== competition.name.toLowerCase() && (
          <CardDescription>{t(`competition.type.${competition.type}`)}</CardDescription>
        )}
        <CardAction>
          <Badge variant={open ? "default" : "outline"}>{open ? t("competition.open") : t("competition.closed")}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {competition.description && <p className="text-muted-foreground">{competition.description}</p>}
        <ul className="text-muted-foreground space-y-2">
          <li className="flex items-center gap-2">
            <UsersIcon className="size-4" />
            {t("competition.teamOf", { size: formatTeamSize(competition.min_members, competition.max_members, lang) })}
          </li>
          <li className="flex items-center gap-2">
            <WalletIcon className="size-4" />
            {formatRupiah(competition.fee, lang)}
          </li>
          {competition.registration_closes_at && (
            <li className="flex items-center gap-2">
              <CalendarIcon className="size-4" />
              {t("competition.closes", { date: formatDateTime(competition.registration_closes_at, lang) })}
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto">
        {open ? (
          <Link href={localePath(lang, `/register/${competition.slug}`)} className={buttonVariants({ className: "w-full" })}>
            {t("competition.registerTeam")}
          </Link>
        ) : (
          <span className={buttonVariants({ variant: "outline", className: "pointer-events-none w-full opacity-50" })}>
            {t("competition.registrationClosed")}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
