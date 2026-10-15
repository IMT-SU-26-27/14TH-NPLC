import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatsCardsProps } from "@/types/admin";

// Only accepted registrations count toward "registered".
export function StatsCards({ stats, lang }: StatsCardsProps) {
  const t = getT(lang);
  const totalPeople = stats.reduce((sum, s) => sum + (s.accepted_people ?? 0), 0);
  const totalTeams = stats.reduce((sum, s) => sum + (s.accepted_teams ?? 0), 0);
  const waiting = stats.reduce((sum, s) => sum + (s.under_review_teams ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t("admin.overview.totalPeople"), value: totalPeople },
          { label: t("admin.overview.acceptedTeams"), value: totalTeams },
          { label: t("admin.overview.waitingReview"), value: waiting },
        ].map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-semibold tabular-nums">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((s) => (
          <Card key={s.competition_id} size="sm">
            <CardHeader>
              <CardTitle>{s.name}</CardTitle>
              {s.type && s.name && t(`competition.type.${s.type}`).toLowerCase() !== s.name.toLowerCase() && (
                <CardDescription>{t(`competition.type.${s.type}`)}</CardDescription>
              )}
              <CardAction>
                <Badge variant="secondary">{t("admin.overview.teamsTotal", { count: s.total_teams ?? 0 })}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-3 gap-4 text-xs sm:text-sm">
                <div>
                  <dt className="text-muted-foreground">{t("admin.overview.peopleRegistered")}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">{s.accepted_people ?? 0}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("admin.overview.teamsAccepted")}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">{s.accepted_teams ?? 0}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("admin.overview.underReview")}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">{s.under_review_teams ?? 0}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
