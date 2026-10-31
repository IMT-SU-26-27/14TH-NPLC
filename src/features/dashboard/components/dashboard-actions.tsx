import Link from "next/link";
import { getMyTeams } from "@/lib/data/registrations";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { buttonVariants } from "@/components/ui/button";
import type { LangProps } from "@/types/i18n";

// Registering or joining only makes sense before the account is on a team.
export async function DashboardActions({ lang }: LangProps) {
  const t = getT(lang);
  const teams = await getMyTeams();
  if (teams.length > 0) return null;

  return (
    <div className="flex gap-2">
      <Link href={localePath(lang, "/join")} className={buttonVariants({ variant: "outline" })}>
        {t("nav.joinTeam")}
      </Link>
      <Link href={localePath(lang, "/register")} className={buttonVariants()}>
        {t("nav.registerTeam")}
      </Link>
    </div>
  );
}
