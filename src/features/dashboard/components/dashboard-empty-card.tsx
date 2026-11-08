import { KeyRoundIcon, UserPlusIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { DashboardEmptyOption } from "@/features/dashboard/components/dashboard-empty-option";
import type { DashboardEmptyCardProps } from "@/types/registration";

// Dashboard 07 for an account without a team: same frame as the team card, with the two ways to start.
export function DashboardEmptyCard({ lang }: DashboardEmptyCardProps) {
  const t = getT(lang);

  return (
    <article className="bg-card ring-border space-y-5.5 rounded-[12px] p-5 ring-1 sm:px-10 sm:py-9">
      <header className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-primary font-mono text-xs font-medium tracking-[0.14em] uppercase">{`// ${t("dashboard.emptyLabel")}`}</p>
          <Badge
            variant="outline"
            className="bg-card border-border text-foreground h-6 gap-1.5 rounded-[6px] px-2.5 font-mono text-[11px] tracking-[0.12em] uppercase"
          >
            <span aria-hidden className="border-muted-foreground size-[7px] rounded-full border" />
            {t("dashboard.emptyBadge")}
          </Badge>
        </div>
        <h2 className="font-heading text-foreground text-[28px] leading-[1.1] font-bold tracking-[-0.02em] break-words sm:text-[34px]">
          {t("dashboard.emptyTitle")}
        </h2>
        <p className="text-muted-foreground text-sm">{t("dashboard.emptyDescription")}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardEmptyOption
          label={`A // ${t("dashboard.leaderLabel")}`}
          title={t("dashboard.leaderTitle")}
          description={t("dashboard.leaderDescription")}
          href={localePath(lang, "/register")}
          cta={t("dashboard.registerTeam")}
          icon={UserPlusIcon}
          variant="leader"
        />
        <DashboardEmptyOption
          label={`B // ${t("dashboard.memberLabel")}`}
          title={t("dashboard.joinWithCode")}
          description={t("dashboard.memberDescription")}
          href={localePath(lang, "/join")}
          cta={t("dashboard.joinTeam")}
          icon={KeyRoundIcon}
          variant="member"
        />
      </div>
    </article>
  );
}
