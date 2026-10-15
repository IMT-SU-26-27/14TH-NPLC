import { LineChartIcon } from "lucide-react";
import { requireAdmin } from "@/lib/data/auth";
import { getCompetitionStats, getRegistrationTrend } from "@/lib/data/admin";
import { getT } from "@/lib/i18n/get-dictionary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { StatsCards } from "@/features/admin/components/stats-cards";
import { RegistrationTrendChart } from "@/features/admin/components/registration-trend-chart";
import type { LangProps } from "@/types/i18n";

export async function AdminOverview({ lang }: LangProps) {
  const t = getT(lang);
  await requireAdmin();
  const [stats, trend] = await Promise.all([getCompetitionStats(), getRegistrationTrend(30)]);

  return (
    <div className="space-y-4">
      <StatsCards stats={stats} lang={lang} />
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.overview.chartTitle")}</CardTitle>
          <CardDescription>
            {t("admin.overview.chartLead")} {t("admin.overview.totalInRange", { count: trend.total, days: trend.days })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trend.total === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LineChartIcon />
                </EmptyMedia>
                <EmptyTitle>{t("admin.overview.chartEmpty")}</EmptyTitle>
                <EmptyDescription>{t("admin.overview.chartLead")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <RegistrationTrendChart trend={trend} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
